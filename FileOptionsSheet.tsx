import { useState } from "react";
import { useFileSystem } from "@/hooks/useFileSystem";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { FileResponse } from "@shared/schema";
import { formatBytes, formatRelativeTime } from "@/utils/formatters";
import { 
  Download, 
  Share, 
  Edit, 
  FolderUp, 
  Trash
} from "lucide-react";
import { getFileIconType } from "@/utils/fileTypeIcons";

type FileOptionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileResponse;
};

export const FileOptionsSheet = ({ open, onOpenChange, file }: FileOptionsSheetProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [newFileName, setNewFileName] = useState(file.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { downloadFile, updateFile, deleteFile } = useFileSystem();

  const handleDownload = async () => {
    await downloadFile(file.id, file.name);
  };

  const handleRename = async () => {
    if (newFileName !== file.name) {
      await updateFile.mutateAsync({
        id: file.id,
        name: newFileName,
      });
    }
    setIsEditMode(false);
  };

  const handleDelete = async () => {
    await deleteFile.mutateAsync(file.id);
    onOpenChange(false);
    setDeleteDialogOpen(false);
  };

  const getFileTypeName = (fileName: string, mimeType: string) => {
    const iconType = getFileIconType(fileName, mimeType);
    
    switch (iconType) {
      case 'document':
        return 'Document';
      case 'spreadsheet':
        return 'Spreadsheet';
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      case 'presentation':
        return 'Presentation';
      case 'archive':
        return 'Archive';
      case 'code':
        return 'Code';
      default:
        return 'File';
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl pt-6">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 -mt-2" />
          <SheetHeader className="text-left">
            {isEditMode ? (
              <div className="mb-4">
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleRename}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <SheetTitle>{file.name}</SheetTitle>
            )}
          </SheetHeader>
          
          <div className="grid grid-cols-4 gap-4 mb-6 mt-4">
            <button className="flex flex-col items-center" onClick={handleDownload}>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-gray-500">Download</span>
            </button>
            
            <button className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <Share className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-gray-500">Share</span>
            </button>
            
            <button className="flex flex-col items-center" onClick={() => setIsEditMode(true)}>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <Edit className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-gray-500">Rename</span>
            </button>
            
            <button className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <FolderUp className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-gray-500">Move</span>
            </button>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Type</span>
              <span className="text-sm font-medium text-gray-900">
                {getFileTypeName(file.name, file.type)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Size</span>
              <span className="text-sm font-medium text-gray-900">
                {formatBytes(file.sizeInBytes)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Modified</span>
              <span className="text-sm font-medium text-gray-900">
                {formatRelativeTime(file.lastModified)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Location</span>
              <span className="text-sm font-medium text-gray-900">
                {file.folderId ? 'In folder' : 'Root'}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost"
            className="flex items-center justify-center w-full py-3 text-destructive font-medium"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </SheetContent>
      </Sheet>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FileOptionsSheet;
