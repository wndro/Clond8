import { useStorage } from "@/hooks/useStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export const StorageUsage = () => {
  const { 
    isLoadingStorage, 
    formattedUsed, 
    formattedTotal, 
    formattedFree, 
    formattedPercentUsed, 
    percentUsed 
  } = useStorage();
  const { t } = useLanguage();

  if (isLoadingStorage) {
    return (
      <div className="px-4 py-3 bg-white mb-2 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-sm font-medium text-gray-500">{t('storage.title')}</h2>
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-full rounded-full mb-1" />
        <div className="flex justify-between mt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-white mb-2 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-medium text-gray-500">{t('storage.title')}</h2>
        <span className="text-sm text-gray-900 font-medium">
          {formattedUsed} / {formattedTotal}
        </span>
      </div>
      <Progress value={percentUsed} className="h-3" />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{formattedPercentUsed} {t('storage.used')}</span>
        <span className="text-xs text-gray-500">{formattedFree} {t('storage.free')}</span>
      </div>
    </div>
  );
};

export default StorageUsage;
