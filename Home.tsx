import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import StorageUsage from "@/components/StorageUsage";
import RecentFiles from "@/components/RecentFiles";
import FoldersList from "@/components/FoldersList";
import MediaGallery from "@/components/MediaGallery";
import BottomNav from "@/components/BottomNav";
import FileUploadButton from "@/components/FileUploadButton";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileVideo, FileImage, FileText, FilesIcon } from "lucide-react";

export const Home = () => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">{t('app.name')}</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5 text-gray-500" />
              <span className="sr-only">{t('action.search')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5 text-gray-500" />
              <span className="sr-only">Profile</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Storage Usage */}
      <StorageUsage />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-20">
        {/* Categories Shortcuts */}
        <div className="my-4 grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center justify-center bg-blue-50 rounded-lg p-3 shadow-sm">
            <div className="bg-blue-100 p-2 rounded-full mb-2">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-gray-700">{t('category.documents')}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-red-50 rounded-lg p-3 shadow-sm">
            <div className="bg-red-100 p-2 rounded-full mb-2">
              <FileImage className="h-5 w-5 text-red-500" />
            </div>
            <span className="text-xs font-medium text-gray-700">{t('category.images')}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-purple-50 rounded-lg p-3 shadow-sm">
            <div className="bg-purple-100 p-2 rounded-full mb-2">
              <FileVideo className="h-5 w-5 text-purple-500" />
            </div>
            <span className="text-xs font-medium text-gray-700">{t('category.videos')}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-3 shadow-sm">
            <div className="bg-gray-100 p-2 rounded-full mb-2">
              <FilesIcon className="h-5 w-5 text-gray-500" />
            </div>
            <span className="text-xs font-medium text-gray-700">{t('category.all')}</span>
          </div>
        </div>
        
        <RecentFiles />
        <MediaGallery />
        <FoldersList />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Upload FAB */}
      <FileUploadButton />
    </div>
  );
};

export default Home;
