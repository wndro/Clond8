import { useRef } from "react";
import { useFileSystem } from "@/hooks/useFileSystem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { useState } from "react";
import { Upload, Camera, FolderPlus, FileScan } from "lucide-react";

type UploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: number;
};

export const UploadModal = ({ open, onOpenChange, folderId }: UploadModalProps) => {
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useFileSystem();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      // Upload the first file (in a real app, you might want to handle multiple files)
      await uploadFile.mutateAsync({ 
        file: files[0],
        folderId
      });
      
      // Close the modal after successful upload
      onOpenChange(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleCreateFolder = () => {
    setCreateFolderOpen(true);
    // Keep upload modal open until folder creation is done
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload to CloudStore</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              onClick={handleUploadClick}
            >
              <Upload className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium text-gray-900">Upload File</span>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </button>
            
            <button 
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              disabled
            >
              <Camera className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium text-gray-900">Take Photo</span>
            </button>
            
            <button 
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              onClick={handleCreateFolder}
            >
              <FolderPlus className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium text-gray-900">New Folder</span>
            </button>
            
            <button 
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              disabled
            >
              <FileScan className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium text-gray-900">Scan Document</span>
            </button>
          </div>
          
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <CreateFolderDialog 
        open={createFolderOpen} 
        onOpenChange={(open) => {
          setCreateFolderOpen(open);
          if (!open) {
            // Close the upload modal when folder creation is done
            onOpenChange(false);
          }
        }}
        parentId={folderId}
      />
    </>
  );
};

export default UploadModal;
