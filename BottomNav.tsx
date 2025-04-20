import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Folder, Users, Clock, Settings } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const BottomNav = () => {
  const [location] = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around py-2 z-10">
      <Link href="/" className={cn(
        "flex flex-col items-center justify-center p-2",
        isActive("/") ? "text-primary" : "text-gray-500"
      )}>
        <Folder className="h-5 w-5" />
        <span className="text-xs mt-1">{t('nav.files')}</span>
      </Link>
      
      <button className="flex flex-col items-center justify-center p-2 text-gray-500" disabled>
        <Users className="h-5 w-5" />
        <span className="text-xs mt-1">{t('nav.shared')}</span>
      </button>
      
      {/* Placeholder for FAB */}
      <div className="invisible flex flex-col items-center justify-center p-2">
        <span className="material-icons">add</span>
        <span className="text-xs mt-1">{t('action.upload')}</span>
      </div>
      
      <Link href="/files" className={cn(
        "flex flex-col items-center justify-center p-2",
        isActive("/files") ? "text-primary" : "text-gray-500"
      )}>
        <Clock className="h-5 w-5" />
        <span className="text-xs mt-1">{t('files.recent')}</span>
      </Link>
      
      <Link href="/settings" className={cn(
        "flex flex-col items-center justify-center p-2",
        isActive("/settings") ? "text-primary" : "text-gray-500"
      )}>
        <Settings className="h-5 w-5" />
        <span className="text-xs mt-1">{t('nav.settings')}</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
