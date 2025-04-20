import { useState } from "react";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileIconType, getFileColorClass, getFileIconComponent } from "@/utils/fileTypeIcons";
import { formatBytes, formatRelativeTime } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { FileOptionsSheet } from "@/components/FileOptionsSheet";

export const FilesList = ({ folderId }: { folderId?: number }) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortMethod, setSortMethod] = useState<'name' | 'date' | 'size'>('date');
  
  const { getFiles } = useFileSystem();
  const { data: files, isLoading: isLoadingFiles } = getFiles(folderId);
  const { t } = useLanguage();

  const openFileOptions = (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(file);
    setSheetOpen(true);
  };

  const sortFiles = (files: any[]) => {
    if (!files) return [];
    
    const sortedFiles = [...files];
    switch (sortMethod) {
      case 'name':
        return sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
      case 'size':
        return sortedFiles.sort((a, b) => b.sizeInBytes - a.sizeInBytes);
      case 'date':
      default:
        return sortedFiles.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    }
  };

  if (isLoadingFiles) {
    return (
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-900">{t('files.all')}</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            <span className="material-icons text-sm align-middle mr-1">sort</span> {t('sort.date')}
          </Button>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full mb-2 rounded-lg" />
        ))}
      </section>
    );
  }

  if (!files || files.length === 0) {
    return (
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium text-gray-900">{t('files.all')}</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            <span className="material-icons text-sm align-middle mr-1">sort</span> {t('sort.date')}
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">{t('files.no_files')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('files.upload_message')}</p>
        </div>
      </section>
    );
  }

  const sortedFiles = sortFiles(files);

  return (
    <section>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-gray-900">{t('files.all')}</h2>
        <div className="flex">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary"
            onClick={() => setSortMethod(sortMethod === 'name' ? 'date' : 'name')}
          >
            <span className="material-icons text-sm align-middle mr-1">sort</span>
            {sortMethod === 'name' ? t('sort.name') : sortMethod === 'size' ? t('sort.size') : t('sort.date')}
          </Button>
        </div>
      </div>

      {sortedFiles.map((file) => {
        const fileType = getFileIconType(file.name, file.type);
        const colorClass = getFileColorClass(fileType);
        const FileIcon = getFileIconComponent(fileType);
        
        const isImage = fileType === 'image';
        const isVideo = fileType === 'video';
        const showThumbnail = isImage || isVideo;
        
        return (
          <div 
            key={file.id}
            className="bg-white rounded-lg shadow-sm mb-2 cursor-pointer"
            onClick={(e) => openFileOptions(file, e)}
          >
            <div className="flex items-center p-3">
              {showThumbnail ? (
                <div className="relative w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                  <img 
                    src={`/api/files/${file.id}/download`}
                    alt={file.name}
                    className="object-cover w-full h-full absolute inset-0"
                  />
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-4 h-4 rounded-full bg-white/80 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-primary border-b-[3px] border-b-transparent ml-[2px]"></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <FileIcon className={`${colorClass.split(' ')[0]} w-6 h-6 mr-3 flex-shrink-0`} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatBytes(file.sizeInBytes)} • {t('viewer.modified')} {formatRelativeTime(file.lastModified)}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => openFileOptions(file, e)}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">{t('action.more')}</span>
              </Button>
            </div>
          </div>
        );
      })}
      
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

export default FilesList;
