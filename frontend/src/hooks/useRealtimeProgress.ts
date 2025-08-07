import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface ProgressData {
  courseId: string;
  lessonId: string;
  progress: any;
  unlockedLessons: string[];
}

interface UseRealtimeProgressProps {
  courseId: string | null;
  onProgressUpdate: (progress: any) => void;
  onUnlockedLessonsUpdate: (unlockedLessons: string[]) => void;
}

export const useRealtimeProgress = ({
  courseId,
  onProgressUpdate,
  onUnlockedLessonsUpdate,
}: UseRealtimeProgressProps) => {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce function để tránh gọi callback quá nhiều lần
  const debouncedProgressUpdate = useCallback(
    debounce((progress: any) => {
      onProgressUpdate(progress);
    }, 300),
    [onProgressUpdate],
  );

  const debouncedUnlockedLessonsUpdate = useCallback(
    debounce((unlockedLessons: string[]) => {
      onUnlockedLessonsUpdate(unlockedLessons);
    }, 300),
    [onUnlockedLessonsUpdate],
  );

  useEffect(() => {
    if (!courseId) return;

    // Tạo socket connection
    const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socketRef.current = socket;

    // Join room cho course cụ thể
    socket.emit('join-course', { courseId });

    // Lắng nghe progress updates
    socket.on('progress-updated', (data: ProgressData) => {
      if (data.courseId === courseId) {
        console.log('Realtime progress update:', data);
        debouncedProgressUpdate(data.progress);
        debouncedUnlockedLessonsUpdate(data.unlockedLessons);
      }
    });

    // Lắng nghe lesson completion
    socket.on('lesson-completed', (data: { courseId: string; lessonId: string }) => {
      if (data.courseId === courseId) {
        console.log('Lesson completed:', data.lessonId);
        // Trigger reload progress
        debouncedProgressUpdate(null); // null sẽ trigger reload
      }
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to realtime progress server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from realtime progress server');
      // Auto reconnect sau 3 giây
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.connect();
        }
      }, 3000);
    });

    socket.on('connect_error', error => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, [courseId, debouncedProgressUpdate, debouncedUnlockedLessonsUpdate]);

  // Function để emit progress update
  const emitProgressUpdate = useCallback(
    (lessonId: string, progressData: any) => {
      if (socketRef.current && courseId) {
        socketRef.current.emit('update-progress', {
          courseId,
          lessonId,
          progressData,
        });
      }
    },
    [courseId],
  );

  return { emitProgressUpdate };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
