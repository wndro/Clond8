import { 
  users, type User, type InsertUser,
  folders, type Folder, type InsertFolder,
  files, type File, type InsertFile,
  storageInfo, type StorageInfo, type InsertStorageInfo,
  FileResponse, FolderResponse, StorageResponse
} from "@shared/schema";

// Interface for our storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Folder operations
  getFolders(userId: number, parentId?: number): Promise<Folder[]>;
  getFolder(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, name: string): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
  
  // File operations
  getFiles(userId: number, folderId?: number): Promise<File[]>;
  getRecentFiles(userId: number, limit: number): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, name: string, folderId?: number): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // Storage operations
  getStorageInfo(userId: number): Promise<StorageInfo | undefined>;
  updateStorageInfo(userId: number, usedBytes: number): Promise<StorageInfo>;
  
  // Utility methods for API responses
  generateFileResponse(file: File): FileResponse;
  generateFolderResponse(folder: Folder, files: File[]): FolderResponse;
  generateStorageResponse(info: StorageInfo, user: User): StorageResponse;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private folders: Map<number, Folder>;
  private files: Map<number, File>;
  private storageInfo: Map<number, StorageInfo>;
  
  // For generating sequential IDs
  private nextUserId: number;
  private nextFolderId: number;
  private nextFileId: number;
  private nextStorageInfoId: number;
  
  // In-memory file content storage (contentId -> binary data)
  private fileContents: Map<string, Buffer>;
  
  constructor() {
    this.users = new Map();
    this.folders = new Map();
    this.files = new Map();
    this.storageInfo = new Map();
    this.fileContents = new Map();
    
    this.nextUserId = 1;
    this.nextFolderId = 1;
    this.nextFileId = 1;
    this.nextStorageInfoId = 1;
    
    // Initialize with a demo user
    const demoUser: User = {
      id: this.nextUserId++,
      username: 'demo',
      password: 'password',
      storageLimit: 3 * 1024 * 1024 * 1024 * 1024 // 3TB
    };
    this.users.set(demoUser.id, demoUser);
    
    // Initialize storage info for demo user
    const demoStorageInfo: StorageInfo = {
      id: this.nextStorageInfoId++,
      userId: demoUser.id,
      usedBytes: 0,
      lastUpdated: new Date()
    };
    this.storageInfo.set(demoStorageInfo.id, demoStorageInfo);
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      storageLimit: 3 * 1024 * 1024 * 1024 * 1024 // 3TB
    };
    this.users.set(id, user);
    
    // Create storage info record for the new user
    await this.updateStorageInfo(id, 0);
    
    return user;
  }
  
  // Folder operations
  async getFolders(userId: number, parentId?: number): Promise<Folder[]> {
    return Array.from(this.folders.values()).filter(folder => 
      folder.userId === userId && 
      (parentId === undefined ? folder.parentId === null : folder.parentId === parentId)
    );
  }
  
  async getFolder(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }
  
  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = this.nextFolderId++;
    const folder: Folder = { 
      ...insertFolder, 
      id, 
      parentId: insertFolder.parentId ?? null,
      createdAt: new Date() 
    };
    this.folders.set(id, folder);
    return folder;
  }
  
  async updateFolder(id: number, name: string): Promise<Folder | undefined> {
    const folder = this.folders.get(id);
    if (!folder) return undefined;
    
    const updatedFolder = { ...folder, name };
    this.folders.set(id, updatedFolder);
    return updatedFolder;
  }
  
  async deleteFolder(id: number): Promise<boolean> {
    // Get all files in this folder and delete them
    const folderFiles = Array.from(this.files.values()).filter(file => file.folderId === id);
    for (const file of folderFiles) {
      await this.deleteFile(file.id);
    }
    
    // Get all subfolders and delete them recursively
    const subfolders = Array.from(this.folders.values()).filter(folder => folder.parentId === id);
    for (const subfolder of subfolders) {
      await this.deleteFolder(subfolder.id);
    }
    
    // Delete the folder itself
    return this.folders.delete(id);
  }
  
  // File operations
  async getFiles(userId: number, folderId?: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => 
      file.userId === userId && 
      (folderId === undefined ? true : file.folderId === folderId)
    );
  }
  
  async getRecentFiles(userId: number, limit: number): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.userId === userId)
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, limit);
  }
  
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.nextFileId++;
    const file: File = {
      ...insertFile,
      id,
      folderId: insertFile.folderId ?? null,
      lastModified: new Date(),
      createdAt: new Date()
    };
    this.files.set(id, file);
    
    // Update storage usage
    const storageInfo = await this.getStorageInfoByUserId(insertFile.userId);
    if (storageInfo) {
      await this.updateStorageInfo(insertFile.userId, storageInfo.usedBytes + insertFile.sizeInBytes);
    }
    
    return file;
  }
  
  async updateFile(id: number, name: string, folderId?: number): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile = { 
      ...file, 
      name, 
      folderId: folderId !== undefined ? folderId : file.folderId,
      lastModified: new Date()
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }
  
  async deleteFile(id: number): Promise<boolean> {
    const file = this.files.get(id);
    if (!file) return false;
    
    // Update storage usage
    const storageInfo = await this.getStorageInfoByUserId(file.userId);
    if (storageInfo) {
      await this.updateStorageInfo(file.userId, Math.max(0, storageInfo.usedBytes - file.sizeInBytes));
    }
    
    // Delete file content
    this.fileContents.delete(file.contentId);
    
    // Delete file record
    return this.files.delete(id);
  }
  
  // Storage operations
  private async getStorageInfoByUserId(userId: number): Promise<StorageInfo | undefined> {
    return Array.from(this.storageInfo.values()).find(info => info.userId === userId);
  }
  
  async getStorageInfo(userId: number): Promise<StorageInfo | undefined> {
    return this.getStorageInfoByUserId(userId);
  }
  
  async updateStorageInfo(userId: number, usedBytes: number): Promise<StorageInfo> {
    let info = await this.getStorageInfoByUserId(userId);
    
    if (info) {
      // Update existing record
      const updatedInfo = {
        ...info,
        usedBytes,
        lastUpdated: new Date()
      };
      this.storageInfo.set(info.id, updatedInfo);
      return updatedInfo;
    } else {
      // Create new record
      const id = this.nextStorageInfoId++;
      info = {
        id,
        userId,
        usedBytes,
        lastUpdated: new Date()
      };
      this.storageInfo.set(id, info);
      return info;
    }
  }
  
  // File content operations
  storeFileContent(contentId: string, content: Buffer): void {
    this.fileContents.set(contentId, content);
  }
  
  getFileContent(contentId: string): Buffer | undefined {
    return this.fileContents.get(contentId);
  }
  
  // Response generators for API endpoints
  generateFileResponse(file: File): FileResponse {
    return {
      id: file.id,
      name: file.name,
      type: file.type,
      sizeInBytes: file.sizeInBytes,
      folderId: file.folderId,
      lastModified: file.lastModified.toISOString(),
      createdAt: file.createdAt.toISOString()
    };
  }
  
  generateFolderResponse(folder: Folder, files: File[]): FolderResponse {
    const totalSize = files.reduce((sum, file) => sum + file.sizeInBytes, 0);
    
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      fileCount: files.length,
      totalSize
    };
  }
  
  generateStorageResponse(info: StorageInfo, user: User): StorageResponse {
    return {
      usedBytes: info.usedBytes,
      totalBytes: user.storageLimit,
      percentUsed: (info.usedBytes / user.storageLimit) * 100
    };
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
