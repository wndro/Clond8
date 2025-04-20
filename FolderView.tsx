import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useFileSystem } from "@/hooks/useFileSystem";
import StorageUsage from "@/components/StorageUsage";
import FoldersList from "@/components/FoldersList";
import FilesList from "@/components/FilesList";
import BottomNav from "@/components/BottomNav";
import FileUploadButton from "@/components/FileUploadButton";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const FolderView = () => {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const folderId = parseInt(params.id);
  
  const { getFolders } = useFileSystem();
  const { data: folders, isLoading } = getFolders();
  
  // Find current folder
  const currentFolder = folders?.find(folder => folder.id === folderId);

  // Find parent folder for navigation
  const parentFolder = currentFolder?.parentId 
    ? folders?.find(folder => folder.id === currentFolder.parentId)
    : null;

  const handleBackClick = () => {
    if (currentFolder?.parentId) {
      navigate(`/folder/${currentFolder.parentId}`);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-100">
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-1">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Skeleton className="h-6 w-32" />
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        <StorageUsage />
        
        <main className="flex-1 overflow-y-auto px-4 pb-20">
          <div className="space-y-4 mt-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        
        <BottomNav />
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-100 items-center justify-center p-4">
        <h1 className="text-xl font-semibold mb-2">Folder not found</h1>
        <p className="text-gray-500 mb-4">The folder you're looking for doesn't exist or was deleted.</p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-1">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {currentFolder.name}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Storage Usage */}
      <StorageUsage />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-20">
        <FoldersList parentId={folderId} />
        <FilesList folderId={folderId} />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Upload FAB */}
      <FileUploadButton folderId={folderId} />
    </div>
  );
};

export default FolderView;
