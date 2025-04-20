import { useState } from "react";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useLanguage } from "@/hooks/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileIconType, getFileColorClass, getFileIconComponent } from "@/utils/fileTypeIcons";
import { formatBytes } from "@/utils/formatters";
import { FileVideo, FileImage, FileText, FilesIcon } from "lucide-react";
import MediaViewer from "./MediaViewer";

interface FileItem {
  id: number;
  name: string;
  type: string;
  sizeInBytes: number;
  folderId: number | null;
  lastModified: string;
  createdAt: string;
}

export const MediaGallery = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<FileItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  const { getFiles } = useFileSystem();
  const { data: allFiles, isLoading } = getFiles();
  const { t } = useLanguage();
  
  // Filter files by type
  const imageFiles = allFiles?.filter(file => {
    const fileType = getFileIconType(file.name, file.type);
    return fileType === 'image';
  }) || [];
  
  const videoFiles = allFiles?.filter(file => {
    const fileType = getFileIconType(file.name, file.type);
    return fileType === 'video';
  }) || [];
  
  const documentFiles = allFiles?.filter(file => {
    const fileType = getFileIconType(file.name, file.type);
    return fileType === 'document';
  }) || [];
  
  const openMediaViewer = (file: FileItem) => {
    setSelectedMedia(file);
    setViewerOpen(true);
  };
  
  const renderMediaGrid = (files: FileItem[]) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <Skeleton className="w-full h-36" />
              <div className="p-2">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (files.length === 0) {
      return (
        <div className="text-center py-10">
          <FilesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('files.no_files')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('files.upload_message')}</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 gap-3">
        {files.map(file => {
          const fileType = getFileIconType(file.name, file.type);
          const colorClass = getFileColorClass(fileType);
          const FileIcon = getFileIconComponent(fileType);
          
          const isImage = fileType === 'image';
          const isVideo = fileType === 'video';
          const showThumbnail = isImage || isVideo;
          
          return (
            <div 
              key={file.id} 
              className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openMediaViewer(file)}
            >
              <div className={`h-36 flex items-center justify-center relative ${colorClass.split(' ')[1]}`}>
                {showThumbnail ? (
                  <>
                    <img 
                      src={`/api/files/${file.id}/download`}
                      alt={file.name}
                      className="object-cover w-full h-full absolute inset-0"
                    />
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-primary border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <FileIcon className={`h-16 w-16 ${colorClass.split(' ')[0]}`} />
                )}
              </div>
              <div className="p-2">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatBytes(file.sizeInBytes)}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{t('media.gallery')}</h2>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link href="/files">{t('action.view_all')}</Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full grid grid-cols-4">
          <TabsTrigger value="all" className="text-xs">{t('category.all')}</TabsTrigger>
          <TabsTrigger value="images" className="text-xs">{t('category.images')}</TabsTrigger>
          <TabsTrigger value="videos" className="text-xs">{t('category.videos')}</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">{t('category.documents')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {renderMediaGrid(allFiles || [])}
        </TabsContent>
        
        <TabsContent value="images" className="mt-0">
          {renderMediaGrid(imageFiles)}
        </TabsContent>
        
        <TabsContent value="videos" className="mt-0">
          {renderMediaGrid(videoFiles)}
        </TabsContent>
        
        <TabsContent value="documents" className="mt-0">
          {renderMediaGrid(documentFiles)}
        </TabsContent>
      </Tabs>
      
      {selectedMedia && (
        <MediaViewer
          file={selectedMedia}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}
    </section>
  );
};

export default MediaGallery;