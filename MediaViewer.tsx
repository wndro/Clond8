import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getFileIconType } from "@/utils/fileTypeIcons";
import { formatBytes, formatRelativeTime } from "@/utils/formatters";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useLanguage } from "@/hooks/useLanguage";
import { Download, X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface FileItem {
  id: number;
  name: string;
  type: string;
  sizeInBytes: number;
  folderId: number | null;
  lastModified: string;
  createdAt: string;
}

interface MediaViewerProps {
  file: FileItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MediaViewer = ({ file, open, onOpenChange }: MediaViewerProps) => {
  const fileType = getFileIconType(file.name, file.type);
  const { downloadFile } = useFileSystem();
  const { t } = useLanguage();
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const handleDownload = () => {
    if (file && file.id) {
      downloadFile(file.id, file.name);
    }
  };
  
  // Reset state when media changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    return undefined;
  }, [file.id]);
  
  // Hide controls after a period of inactivity
  useEffect(() => {
    if (fileType === 'video' && isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isPlaying, showControls, fileType]);
  
  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleVolumeChange = (newVolume: number[]) => {
    if (newVolume && newVolume.length > 0) {
      const value = newVolume[0];
      setVolume(value);
      if (videoRef.current) {
        videoRef.current.volume = value;
      }
      setIsMuted(value === 0);
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  const handleSeek = (newTime: number[]) => {
    if (newTime && newTime.length > 0) {
      const value = newTime[0];
      setCurrentTime(value);
      if (videoRef.current) {
        videoRef.current.currentTime = value;
      }
    }
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };
  
  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };
  
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };
  
  // Render media content based on file type
  const renderMediaContent = () => {
    // Image viewer
    if (fileType === 'image') {
      return (
        <div className="flex items-center justify-center h-full">
          <img 
            src={`/api/files/${file.id}/download`} 
            alt={file.name} 
            className="max-h-full max-w-full object-contain"
          />
        </div>
      );
    }
    
    // Video player
    if (fileType === 'video') {
      return (
        <div 
          className="relative flex items-center justify-center h-full"
          onMouseMove={() => setShowControls(true)}
        >
          <video
            ref={videoRef}
            src={`/api/files/${file.id}/download`}
            className="max-h-full max-w-full"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-white" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button variant="ghost" size="icon" className="text-white" onClick={skipBackward}>
                  <SkipBack className="h-5 w-5" />
                </Button>
                
                <Button variant="ghost" size="icon" className="text-white" onClick={skipForward}>
                  <SkipForward className="h-5 w-5" />
                </Button>
                
                <div className="text-xs">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                
                <div className="flex-1 mx-2">
                  <Slider
                    value={[currentTime]}
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                </div>
                
                <Button variant="ghost" size="icon" className="text-white" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                
                <div className="w-20 hidden sm:block">
                  <Slider
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                  />
                </div>
                
                <Button variant="ghost" size="icon" className="text-white" onClick={toggleFullscreen}>
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Document/other file preview (fallback)
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{t('viewer.no_preview')}</p>
        <Button variant="default" size="sm" className="mt-4" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" /> {t('action.download')}
        </Button>
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
        <DialogHeader className="absolute top-0 right-0 z-10 p-2">
          <DialogTitle className="sr-only">{file.name}</DialogTitle>
          <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white hover:bg-black/40" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="h-full flex flex-col">
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {renderMediaContent()}
          </div>
          
          <div className="p-3 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatBytes(file.sizeInBytes)} • {t('viewer.modified')} {formatRelativeTime(file.lastModified)}
                </p>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> {t('action.download')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewer;