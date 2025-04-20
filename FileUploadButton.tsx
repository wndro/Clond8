import { useState } from "react";
import { Plus } from "lucide-react";
import { UploadModal } from "@/components/UploadModal";

export const FileUploadButton = ({ folderId }: { folderId?: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-16 right-0 left-0 flex justify-center z-20 pointer-events-none max-w-md mx-auto">
        <button
          className="bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg pointer-events-auto"
          aria-label="Upload"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <UploadModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        folderId={folderId}
      />
    </>
  );
};

export default FileUploadButton;
