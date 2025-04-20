import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileResponse, FolderResponse } from "@shared/schema";

export function useFileSystem() {
  const { toast } = useToast();

  // Folders queries
  const getFolders = (parentId?: number) => {
    const queryKey = parentId ? 
      ['/api/folders', { parentId }] : 
      ['/api/folders'];
      
    return useQuery<FolderResponse[]>({
      queryKey,
    });
  };

  // Create folder mutation
  const createFolder = useMutation({
    mutationFn: async (data: { name: string; parentId?: number }) => {
      const response = await apiRequest('POST', '/api/folders', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      toast({
        title: "Folder created",
        description: "Your folder has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create folder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update folder mutation
  const updateFolder = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await apiRequest('PUT', `/api/folders/${id}`, { name });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      toast({
        title: "Folder updated",
        description: "Your folder has been renamed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update folder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete folder mutation
  const deleteFolder = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/folders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      toast({
        title: "Folder deleted",
        description: "Your folder has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete folder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Files queries
  const getFiles = (folderId?: number) => {
    const queryKey = folderId ? 
      ['/api/files', { folderId }] : 
      ['/api/files'];
      
    return useQuery<FileResponse[]>({
      queryKey,
    });
  };

  const getRecentFiles = (limit: number = 10) => {
    return useQuery<FileResponse[]>({
      queryKey: ['/api/files/recent', { limit }],
    });
  };

  const getFile = (id: number) => {
    return useQuery<FileResponse>({
      queryKey: [`/api/files/${id}`],
      enabled: !!id,
    });
  };

  // Upload file mutation
  const uploadFile = useMutation({
    mutationFn: async ({ file, folderId }: { file: File; folderId?: number }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) {
        formData.append('folderId', String(folderId));
      }
      
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/files/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage'] });
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upload file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update file mutation
  const updateFile = useMutation({
    mutationFn: async ({ id, name, folderId }: { id: number; name: string; folderId?: number }) => {
      const response = await apiRequest('PUT', `/api/files/${id}`, { name, folderId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/files/recent'] });
      toast({
        title: "File updated",
        description: "Your file has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteFile = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/files/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage'] });
      toast({
        title: "File deleted",
        description: "Your file has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Download file
  const downloadFile = async (id: number, name: string) => {
    try {
      const response = await fetch(`/api/files/${id}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download file');
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a temporary link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "File downloaded",
        description: "Your file has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to download file",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  return {
    // Folders
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    
    // Files
    getFiles,
    getRecentFiles,
    getFile,
    uploadFile,
    updateFile,
    deleteFile,
    downloadFile,
  };
}
