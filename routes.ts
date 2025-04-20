import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import multer from "multer";
import { 
  insertFolderSchema, 
  insertFileSchema,
  folders,
  files
} from "@shared/schema";
import { z } from "zod";

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // Limit to 100MB per file for this demo
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // For demonstration purposes, we'll use a fixed user ID
  // In a real app, this would come from authentication
  const DEMO_USER_ID = 1;

  // API route prefix
  const API_PREFIX = "/api";

  // Storage info endpoint
  app.get(`${API_PREFIX}/storage`, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const storageInfo = await storage.getStorageInfo(DEMO_USER_ID);
      if (!storageInfo) {
        return res.status(404).json({ message: "Storage info not found" });
      }

      const response = storage.generateStorageResponse(storageInfo, user);
      res.json(response);
    } catch (error) {
      console.error("Error fetching storage info:", error);
      res.status(500).json({ message: "Failed to retrieve storage information" });
    }
  });

  // Folder endpoints
  app.get(`${API_PREFIX}/folders`, async (req: Request, res: Response) => {
    try {
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;
      
      const foldersList = await storage.getFolders(DEMO_USER_ID, parentId);
      
      // Get file counts and sizes for each folder
      const folderResponses = await Promise.all(
        foldersList.map(async (folder) => {
          const folderFiles = await storage.getFiles(DEMO_USER_ID, folder.id);
          return storage.generateFolderResponse(folder, folderFiles);
        })
      );
      
      res.json(folderResponses);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to retrieve folders" });
    }
  });

  app.post(`${API_PREFIX}/folders`, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertFolderSchema.safeParse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid folder data", 
          errors: validationResult.error.errors 
        });
      }
      
      const folder = await storage.createFolder(validationResult.data);
      const folderFiles = await storage.getFiles(DEMO_USER_ID, folder.id);
      
      res.status(201).json(storage.generateFolderResponse(folder, folderFiles));
    } catch (error) {
      console.error("Error creating folder:", error);
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  app.put(`${API_PREFIX}/folders/:id`, async (req: Request, res: Response) => {
    try {
      const folderId = parseInt(req.params.id);
      const { name } = req.body;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: "Folder name is required" });
      }
      
      const folder = await storage.getFolder(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      if (folder.userId !== DEMO_USER_ID) {
        return res.status(403).json({ message: "Unauthorized access to folder" });
      }
      
      const updatedFolder = await storage.updateFolder(folderId, name);
      if (!updatedFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      const folderFiles = await storage.getFiles(DEMO_USER_ID, updatedFolder.id);
      res.json(storage.generateFolderResponse(updatedFolder, folderFiles));
    } catch (error) {
      console.error("Error updating folder:", error);
      res.status(500).json({ message: "Failed to update folder" });
    }
  });

  app.delete(`${API_PREFIX}/folders/:id`, async (req: Request, res: Response) => {
    try {
      const folderId = parseInt(req.params.id);
      
      const folder = await storage.getFolder(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      if (folder.userId !== DEMO_USER_ID) {
        return res.status(403).json({ message: "Unauthorized access to folder" });
      }
      
      const success = await storage.deleteFolder(folderId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete folder" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // File endpoints
  app.get(`${API_PREFIX}/files`, async (req: Request, res: Response) => {
    try {
      const folderId = req.query.folderId ? 
        parseInt(req.query.folderId as string) : 
        undefined;
      
      const filesList = await storage.getFiles(DEMO_USER_ID, folderId);
      
      const fileResponses = filesList.map(file => 
        storage.generateFileResponse(file)
      );
      
      res.json(fileResponses);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to retrieve files" });
    }
  });

  app.get(`${API_PREFIX}/files/recent`, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? 
        parseInt(req.query.limit as string) : 
        10; // Default limit of 10
      
      const recentFiles = await storage.getRecentFiles(DEMO_USER_ID, limit);
      
      const fileResponses = recentFiles.map(file => 
        storage.generateFileResponse(file)
      );
      
      res.json(fileResponses);
    } catch (error) {
      console.error("Error fetching recent files:", error);
      res.status(500).json({ message: "Failed to retrieve recent files" });
    }
  });

  app.post(`${API_PREFIX}/files`, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { originalname, mimetype, buffer, size } = req.file;
      const folderId = req.body.folderId ? parseInt(req.body.folderId) : null;
      
      // Check if user has enough storage space
      const user = await storage.getUser(DEMO_USER_ID);
      const storageInfo = await storage.getStorageInfo(DEMO_USER_ID);
      
      if (!user || !storageInfo) {
        return res.status(404).json({ message: "User or storage info not found" });
      }
      
      const remainingSpace = user.storageLimit - storageInfo.usedBytes;
      if (size > remainingSpace) {
        return res.status(400).json({ 
          message: "Not enough storage space",
          required: size,
          available: remainingSpace
        });
      }
      
      // Store file content
      const contentId = randomUUID();
      storage.storeFileContent(contentId, buffer);
      
      // Create file record
      const fileData = {
        name: originalname,
        type: mimetype,
        sizeInBytes: size,
        folderId,
        userId: DEMO_USER_ID,
        contentId
      };
      
      const validationResult = insertFileSchema.safeParse(fileData);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid file data", 
          errors: validationResult.error.errors 
        });
      }
      
      const file = await storage.createFile(validationResult.data);
      
      res.status(201).json(storage.generateFileResponse(file));
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get(`${API_PREFIX}/files/:id`, async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      if (file.userId !== DEMO_USER_ID) {
        return res.status(403).json({ message: "Unauthorized access to file" });
      }
      
      res.json(storage.generateFileResponse(file));
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to retrieve file" });
    }
  });

  app.get(`${API_PREFIX}/files/:id/download`, async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      if (file.userId !== DEMO_USER_ID) {
        return res.status(403).json({ message: "Unauthorized access to file" });
      }
      
      const fileContent = storage.getFileContent(file.contentId);
      if (!fileContent) {
        return res.status(404).json({ message: "File content not found" });
      }
      
      res.setHeader('Content-Type', file.type);
      res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
      res.send(fileContent);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  app.put(`${API_PREFIX}/files/:id`, async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const { name, folderId } = req.body;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: "File name is required" });
      }
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      if (file.userId !== DEMO_USER_ID) {
        return res.status(403).json({ message: "Unauthorized access to file" });
      }
      
      const updatedFile = await storage.updateFile(
        fileId, 
        name, 
        folderId !== undefined ? parseInt(folderId) : undefined
      );
      
      if (!updatedFile) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(storage.generateFileResponse(updatedFile));
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.delete(`${API_PREFIX}/files/:id`, async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      if (file.userId !== DEMO_USER_ID) {
        return res.status(403).json({ message: "Unauthorized access to file" });
      }
      
      const success = await storage.deleteFile(fileId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete file" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  return httpServer;
}
