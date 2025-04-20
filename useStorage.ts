import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StorageResponse } from "@shared/schema";

export function useStorage() {
  const { toast } = useToast();

  // Get storage usage information
  const { 
    data: storageInfo, 
    isLoading: isLoadingStorage,
    error: storageError
  } = useQuery<StorageResponse>({
    queryKey: ['/api/storage'],
  });

  // Calculate derived values
  const usedBytes = storageInfo?.usedBytes || 0;
  const totalBytes = storageInfo?.totalBytes || 0;
  const percentUsed = storageInfo?.percentUsed || 0;
  const freeBytes = totalBytes - usedBytes;

  // Format values for display
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formattedUsed = formatBytes(usedBytes);
  const formattedTotal = formatBytes(totalBytes);
  const formattedFree = formatBytes(freeBytes);
  const formattedPercentUsed = `${Math.round(percentUsed)}%`;

  return {
    storageInfo,
    isLoadingStorage,
    storageError,
    usedBytes,
    totalBytes,
    freeBytes,
    percentUsed,
    formattedUsed,
    formattedTotal,
    formattedFree,
    formattedPercentUsed,
  };
}
