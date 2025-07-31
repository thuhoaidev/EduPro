import { useState, useCallback, useRef, useEffect } from 'react';
import { getProgress, getUnlockedLessons } from '../services/progressService';

interface UseOptimizedProgressProps {
  courseId: string | null;
}

export const useOptimizedProgress = ({ courseId }: UseOptimizedProgressProps) => {
  const [progress, setProgress] = useState<any>({});
  const [unlockedLessons, setUnlockedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  
  // Cache để tránh load lại dữ liệu không cần thiết
  const cacheRef = useRef<{
    progress: any;
    unlockedLessons: string[];
    timestamp: number;
  }>({
    progress: {},
    unlockedLessons: [],
    timestamp: 0
  });

  // Debounce function để tránh gọi API quá nhiều lần
  const debouncedLoadProgress = useCallback(
    debounce(async (forceReload = false) => {
      if (!courseId) return;

      const now = Date.now();
      const cacheAge = now - cacheRef.current.timestamp;
      const cacheValid = cacheAge < 5000; // Cache valid trong 5 giây

      // Nếu cache còn valid và không force reload, sử dụng cache
      if (cacheValid && !forceReload && Object.keys(cacheRef.current.progress).length > 0) {
        console.log('Using cached progress data');
        setProgress(cacheRef.current.progress);
        setUnlockedLessons(cacheRef.current.unlockedLessons);
        return;
      }

      setLoading(true);
      try {
        console.log('Loading fresh progress data...');
        const [progressData, unlockedData] = await Promise.all([
          getProgress(courseId),
          getUnlockedLessons(courseId)
        ]);

        // Update cache
        cacheRef.current = {
          progress: progressData || {},
          unlockedLessons: unlockedData || [],
          timestamp: now
        };

        setProgress(progressData || {});
        setUnlockedLessons(unlockedData || []);
        setLastUpdate(now);
        
        console.log('Progress data loaded successfully');
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    [courseId]
  );

  // Load progress khi courseId thay đổi
  useEffect(() => {
    if (courseId) {
      debouncedLoadProgress();
    }
  }, [courseId, debouncedLoadProgress]);

  // Function để update progress locally (optimistic update)
  const updateProgressLocally = useCallback((lessonId: string, newProgress: any) => {
    setProgress(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        ...newProgress
      }
    }));
  }, []);

  // Function để force reload progress
  const forceReloadProgress = useCallback(() => {
    debouncedLoadProgress(true);
  }, [debouncedLoadProgress]);

  // Function để update unlocked lessons locally
  const updateUnlockedLessonsLocally = useCallback((newUnlockedLessons: string[]) => {
    setUnlockedLessons(newUnlockedLessons);
  }, []);

  // Auto refresh progress mỗi 30 giây nếu user đang active
  useEffect(() => {
    if (!courseId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdate;
      
      // Chỉ refresh nếu đã hơn 30 giây và user đang active
      if (timeSinceLastUpdate > 30000 && document.visibilityState === 'visible') {
        console.log('Auto refreshing progress...');
        debouncedLoadProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [courseId, lastUpdate, debouncedLoadProgress]);

  return {
    progress,
    unlockedLessons,
    loading,
    lastUpdate,
    updateProgressLocally,
    updateUnlockedLessonsLocally,
    forceReloadProgress,
    reloadProgress: () => debouncedLoadProgress(true)
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 