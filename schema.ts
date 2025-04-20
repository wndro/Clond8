import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  storageLimit: integer("storage_limit").notNull().default(3 * 1024 * 1024 * 1024), // 3TB in bytes
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Folder schema
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFolderSchema = createInsertSchema(folders).pick({
  name: true,
  parentId: true,
  userId: true,
});

// File schema
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // MIME type
  sizeInBytes: integer("size_in_bytes").notNull(),
  folderId: integer("folder_id"),
  userId: integer("user_id").notNull(),
  contentId: text("content_id").notNull(), // Reference to actual file data
  lastModified: timestamp("last_modified").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  type: true,
  sizeInBytes: true,
  folderId: true,
  userId: true,
  contentId: true,
});

// Storage info schema (for tracking usage)
export const storageInfo = pgTable("storage_info", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  usedBytes: integer("used_bytes").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertStorageInfoSchema = createInsertSchema(storageInfo).pick({
  userId: true,
  usedBytes: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type StorageInfo = typeof storageInfo.$inferSelect;
export type InsertStorageInfo = z.infer<typeof insertStorageInfoSchema>;

// API response types
export type FileResponse = {
  id: number;
  name: string;
  type: string;
  sizeInBytes: number;
  folderId: number | null;
  lastModified: string;
  createdAt: string;
};

export type FolderResponse = {
  id: number;
  name: string;
  parentId: number | null;
  fileCount: number;
  totalSize: number;
};

export type StorageResponse = {
  usedBytes: number;
  totalBytes: number;
  percentUsed: number;
};
