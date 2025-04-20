import { useState } from "react";
import StorageUsage from "@/components/StorageUsage";
import FilesList from "@/components/FilesList";
import BottomNav from "@/components/BottomNav";
import FileUploadButton from "@/components/FileUploadButton";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export const AllFiles = () => {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-1">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">All Files</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </header>

      {/* Storage Usage */}
      <StorageUsage />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-20">
        <FilesList />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Upload FAB */}
      <FileUploadButton />
    </div>
  );
};

export default AllFiles;
