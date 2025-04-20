import { useState } from "react";
import { Link } from "wouter";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileIconType, getFileColorClass, getFileIconComponent } from "@/utils/fileTypeIcons";
import { formatBytes } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { FileOptionsSheet } from "@/components/FileOptionsSheet";

export const RecentFiles = () => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const { getRecentFiles } = useFileSystem();
  const { data: recentFiles, isLoading: isLoadingFiles } = getRecentFiles(4);
  const { t } = useLanguage();

  const openFileOptions = (file: any) => {
    setSelectedFile(file);
    setSheetOpen(true);
  };

  if (isLoadingFiles) {
    return (
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-900">{t('files.recent')}</h2>
          <Button variant="ghost" size="sm" className="text-primary">{t('action.view_all')}</Button>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-3 w-max">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-32 h-44 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!recentFiles || recentFiles.length === 0) {
    return (
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-900">{t('files.recent')}</h2>
          <Button variant="ghost" size="sm" className="text-primary" asChild>
            <Link href="/files">{t('action.view_all')}</Link>
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">{t('files.no_recent')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('files.upload_appear')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-gray-900">{t('files.recent')}</h2>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link href="/files">{t('action.view_all')}</Link>
        </Button>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-3 w-max">
          {recentFiles.map((file) => {
            const fileType = getFileIconType(file.name, file.type);
            const colorClass = getFileColorClass(fileType);
            const FileIcon = getFileIconComponent(fileType);
            
            const isImage = fileType === 'image';
            const isVideo = fileType === 'video';
            const showThumbnail = isImage || isVideo;
            
            return (
              <div 
                key={file.id} 
                className="file-card flex flex-col w-32 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                onClick={() => openFileOptions(file)}
              >
                <div className={`h-24 flex items-center justify-center relative ${colorClass.split(' ')[1]}`}>
                  {showThumbnail ? (
                    <>
                      <img 
                        src={`/api/files/${file.id}/download`}
                        alt={file.name}
                        className="object-cover w-full h-full absolute inset-0"
                      />
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-primary border-b-[6px] border-b-transparent ml-1"></div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <FileIcon className={`h-12 w-12 ${colorClass.split(' ')[0]}`} />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatBytes(file.sizeInBytes)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedFile && (
        <FileOptionsSheet 
          open={sheetOpen} 
          onOpenChange={setSheetOpen}
          file={selectedFile}
        />
      )}
    </section>
  );
};

export default RecentFiles;
