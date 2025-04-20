import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, formatFileCount } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Folder, MoreVertical } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const FoldersList = ({ parentId }: { parentId?: number }) => {
  const [location, navigate] = useLocation();
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  
  const { getFolders, deleteFolder } = useFileSystem();
  const { data: folders, isLoading: isLoadingFolders } = getFolders(parentId);
  const { t } = useLanguage();

  const handleOpenFolder = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/folder/${folderId}`);
  };

  const handleDeleteFolder = async () => {
    if (selectedFolder) {
      await deleteFolder.mutateAsync(selectedFolder.id);
      setDeleteFolderDialogOpen(false);
    }
  };

  if (isLoadingFolders) {
    return (
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-900">{t('folders.title')}</h2>
          <Button variant="ghost" size="sm" className="text-primary">{t('folders.new')}</Button>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full mb-2 rounded-lg" />
        ))}
      </section>
    );
  }

  if (!folders || folders.length === 0) {
    return (
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-900">{t('folders.title')}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary"
            onClick={() => setNewFolderDialogOpen(true)}
          >
            {t('folders.new')}
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">{t('folders.no_folders')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('folders.create_message')}</p>
        </div>
        
        <CreateFolderDialog 
          open={newFolderDialogOpen} 
          onOpenChange={setNewFolderDialogOpen}
          parentId={parentId}
        />
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-gray-900">{t('folders.title')}</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary"
          onClick={() => setNewFolderDialogOpen(true)}
        >
          {t('folders.new')}
        </Button>
      </div>
      
      {folders.map((folder) => (
        <div 
          key={folder.id}
          className="bg-white rounded-lg shadow-sm mb-2"
          onClick={(e) => handleOpenFolder(folder.id, e)}
        >
          <div className="flex items-center p-3">
            <Folder className="text-primary w-6 h-6 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
              <p className="text-xs text-gray-500">
                {formatFileCount(folder.fileCount)} - {formatBytes(folder.totalSize)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenFolder(folder.id, e);
                  }}
                >
                  {t('action.open')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    // Rename folder functionality
                  }}
                >
                  {t('action.rename')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFolder(folder);
                    setDeleteFolderDialogOpen(true);
                  }}
                >
                  {t('action.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
      
      <CreateFolderDialog 
        open={newFolderDialogOpen} 
        onOpenChange={setNewFolderDialogOpen}
        parentId={parentId}
      />
      
      <AlertDialog open={deleteFolderDialogOpen} onOpenChange={setDeleteFolderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.are_you_sure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.delete_folder_warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('action.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default FoldersList;
