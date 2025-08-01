import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
      PlayCircleOutlined,
      PauseCircleOutlined,
      SoundOutlined,
      FullscreenOutlined,
      FullscreenExitOutlined,
} from '@ant-design/icons';

interface CustomVideoPlayerProps {
      sources: { [quality: string]: string };
      onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
      onEnded?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
      onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
      onPlay?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
      onPause?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
      initialTime?: number;
      isLessonCompleted?: boolean;
}

// Enhanced network quality detection with bandwidth estimation
const detectNetworkQuality = (): 'slow' | 'medium' | 'fast' => {
      if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') return 'slow';
            if (connection.effectiveType === '3g') return 'medium';
            return 'fast';
      }
      return 'medium'; // Default fallback
};

// Advanced adaptive bitrate selection with performance consideration
const selectOptimalQuality = (sources: { [quality: string]: string }, networkQuality: string, devicePerformance?: number): string => {
      const qualities = Object.keys(sources);
      if (qualities.length === 0) return '';

      // Enhanced quality mapping with better bitrate detection
      const qualityMap = qualities.reduce((acc, quality) => {
            // Support multiple quality naming patterns
            const bitrateMatch = quality.match(/(\d+)(k|p|K|P)/);
            const numberMatch = quality.match(/(\d+)/);
            const bitrate = bitrateMatch ? parseInt(bitrateMatch[1]) : (numberMatch ? parseInt(numberMatch[1]) : 0);
            acc[quality] = bitrate;
            return acc;
      }, {} as { [key: string]: number });

      // Sort by bitrate
      const sortedQualities = qualities.sort((a, b) => qualityMap[a] - qualityMap[b]);

      // Consider device performance for quality selection
      const performanceFactor = devicePerformance || 1;
      const adjustedNetworkQuality = performanceFactor < 0.7 ? 'slow' : networkQuality;

      // Enhanced selection based on network quality and device performance
      switch (adjustedNetworkQuality) {
            case 'slow':
                  return sortedQualities[0] || qualities[0]; // Lowest quality for slow connections
            case 'medium':
                  return sortedQualities[Math.floor(sortedQualities.length / 2)] || qualities[0]; // Medium quality
            case 'fast':
                  return sortedQualities[sortedQualities.length - 1] || qualities[0]; // Highest quality
            default:
                  return qualities[0];
      }
};

// Performance monitoring utility
const createPerformanceMonitor = () => {
      let frameCount = 0;
      let lastTime = performance.now();
      let fpsHistory: number[] = [];

      return {
            start: () => {
                  frameCount = 0;
                  lastTime = performance.now();
                  fpsHistory = [];
            },
            measure: () => {
                  frameCount++;
                  const currentTime = performance.now();
                  const fps = (frameCount * 1000) / (currentTime - lastTime);

                  // Keep last 10 FPS measurements
                  fpsHistory.push(fps);
                  if (fpsHistory.length > 10) {
                        fpsHistory.shift();
                  }

                  return fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
            },
            getAverageFPS: () => {
                  return fpsHistory.length > 0 ? fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length : 0;
            }
      };
};

// Video optimization utilities
const optimizeVideoElement = (video: HTMLVideoElement) => {
      // Set optimal video attributes for streaming
      video.preload = 'metadata'; // Only load metadata initially
      video.autoplay = false;
      video.muted = true; // Muted videos load faster
      video.playsInline = true;

      // Enable hardware acceleration
      video.style.transform = 'translateZ(0)';
      video.style.willChange = 'auto';

      // Set optimal buffer size
      // Note: DRM handling would be implemented separately if needed
};

// Streaming optimization
const createStreamingOptimizer = () => {
      let bufferTarget = 30; // 30 seconds buffer target
      let qualitySwitchThreshold = 0.2;

      return {
            adjustBufferTarget: (networkQuality: string) => {
                  switch (networkQuality) {
                        case 'slow':
                              bufferTarget = 45; // Larger buffer for slow connections
                              break;
                        case 'medium':
                              bufferTarget = 30;
                              break;
                        case 'fast':
                              bufferTarget = 20; // Smaller buffer for fast connections
                              break;
                  }
            },
            getBufferTarget: () => bufferTarget,
            setQualitySwitchThreshold: (threshold: number) => {
                  qualitySwitchThreshold = threshold;
            },
            getQualitySwitchThreshold: () => qualitySwitchThreshold
      };
};

export const CustomVideoPlayer = React.forwardRef<HTMLVideoElement, CustomVideoPlayerProps>(({
      sources,
      onTimeUpdate,
      onEnded,
      onLoadedMetadata,
      onPlay,
      onPause,
      initialTime = 0,
      isLessonCompleted = false
}, ref) => {
      const videoRef = useRef<HTMLVideoElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const timeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
      const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
      const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
      const adaptiveQualityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
      const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
      const performanceMonitorRef = useRef(createPerformanceMonitor());
      const streamingOptimizerRef = useRef(createStreamingOptimizer());
      const renderOptimizationRef = useRef<NodeJS.Timeout | null>(null);

      // Performance optimization: Use refs for frequently accessed values
      const currentTimeRef = useRef(0);
      const maxAllowedTimeRef = useRef(0);
      const isPlayingRef = useRef(false);
      const networkQualityRef = useRef(detectNetworkQuality());
      const devicePerformanceRef = useRef(1); // Default performance factor
      const lastRenderTimeRef = useRef(0);

      // State management with performance optimizations
      const [currentQuality, setCurrentQuality] = useState<string>(() => {
            const availableQualities = Object.keys(sources);
            const networkQuality = networkQualityRef.current;
            const devicePerformance = devicePerformanceRef.current;
            return selectOptimalQuality(sources, networkQuality, devicePerformance);
      });
      const [isPlaying, setIsPlaying] = useState(false);
      const [duration, setDuration] = useState(0);
      const [volume, setVolume] = useState(1);
      const [currentTime, setCurrentTime] = useState(0);
      const [isFullscreen, setIsFullscreen] = useState(false);
      const [showControls, setShowControls] = useState(true);
      const [isMuted, setIsMuted] = useState(false);
      const [maxAllowedTime, setMaxAllowedTime] = useState(0);
      const [error, setError] = useState<string | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [isBuffering, setIsBuffering] = useState(false);
      const [isChangingQuality, setIsChangingQuality] = useState(false);
      const [showSeekWarning, setShowSeekWarning] = useState(false);
      const [bufferHealth, setBufferHealth] = useState(0);
      const [networkIssues, setNetworkIssues] = useState(false);

      // Forward ref to parent component
      useEffect(() => {
            if (ref) {
                  if (typeof ref === 'function') {
                        ref(videoRef.current);
                  } else {
                        ref.current = videoRef.current;
                  }
            }
      }, [ref]);

      // Sync refs with state
      useEffect(() => {
            currentTimeRef.current = currentTime;
            maxAllowedTimeRef.current = maxAllowedTime;
            isPlayingRef.current = isPlaying;
      }, [currentTime, maxAllowedTime, isPlaying]);

      // Stable time update with minimal interruptions
      const throttledTimeUpdate = useCallback(() => {
            if (videoRef.current && isPlayingRef.current) {
                  const current = videoRef.current.currentTime;
                  currentTimeRef.current = current;

                  // Update state every 500ms for smooth UI
                  setCurrentTime(current);

                  // Update maxAllowedTime only when significant progress
                  if (current > maxAllowedTimeRef.current + 5) {
                        maxAllowedTimeRef.current = current;
                        setMaxAllowedTime(current);
                  }

                  // Use stable interval with 500ms delay for smooth updates
                  timeUpdateTimeoutRef.current = setTimeout(throttledTimeUpdate, 500);
            }
      }, []);

      // Stable buffering detection without interruptions
      const checkBufferHealth = useCallback(() => {
            if (videoRef.current && duration > 0) {
                  const buffered = videoRef.current.buffered;
                  if (buffered.length > 0) {
                        const currentTime = videoRef.current.currentTime;
                        let bufferedEnd = 0;

                        for (let i = 0; i < buffered.length; i++) {
                              if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
                                    bufferedEnd = buffered.end(i);
                                    break;
                              }
                        }

                        const bufferAhead = bufferedEnd - currentTime;
                        const bufferHealthValue = Math.min(bufferAhead / 30, 1); // Fixed 30s buffer target

                        // Only update if significant change
                        if (Math.abs(bufferHealthValue - bufferHealth) > 0.2) {
                              setBufferHealth(bufferHealthValue);
                        }

                        // Simple network issues detection
                        if (bufferHealthValue < 0.05 && isPlayingRef.current) {
                              setNetworkIssues(true);
                        } else if (bufferHealthValue > 0.3) {
                              setNetworkIssues(false);
                        }

                        // Disable automatic quality switching to prevent interruptions
                  }
            }
      }, [duration, bufferHealth]);

      // Set initial time with better error handling
      useEffect(() => {
            if (videoRef.current && initialTime > 0) {
                  const setTime = () => {
                        if (videoRef.current && videoRef.current.readyState >= 1) {
                              videoRef.current.currentTime = initialTime;
                              maxAllowedTimeRef.current = initialTime;
                              setMaxAllowedTime(initialTime);
                        } else {
                              // Use requestAnimationFrame for better performance
                              requestAnimationFrame(setTime);
                        }
                  };
                  setTime();
            }
      }, [initialTime]);

      // Stable play/pause toggle
      const togglePlay = useCallback(() => {
            const video = videoRef.current;
            if (!video) return;

            if (video.paused) {
                  // Simple hardware acceleration
                  video.style.transform = 'translateZ(0)';

                  video.play().catch(console.error);
                  setIsPlaying(true);
            } else {
                  video.pause();
                  setIsPlaying(false);
            }
      }, []);

      // Optimized volume control
      const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const newVolume = parseFloat(e.target.value);
            setVolume(newVolume);

            if (videoRef.current) {
                  videoRef.current.volume = newVolume;
                  setIsMuted(newVolume === 0);
            }
      }, []);

      // Optimized mute toggle
      const toggleMute = useCallback(() => {
            if (videoRef.current) {
                  const newMuted = !isMuted;
                  videoRef.current.volume = newMuted ? 0 : volume;
                  setIsMuted(newMuted);
            }
      }, [isMuted, volume]);

      // Enhanced seek with better performance
      const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const newTime = parseFloat(e.target.value);

            // Update UI immediately for responsiveness
            setCurrentTime(newTime);
            currentTimeRef.current = newTime;

            // Debounce actual video seeking
            if (seekTimeoutRef.current) {
                  clearTimeout(seekTimeoutRef.current);
            }

            seekTimeoutRef.current = setTimeout(() => {
                  if (videoRef.current) {
                        videoRef.current.currentTime = newTime;

                        // Sync time immediately after seeking
                        currentTimeRef.current = newTime;
                        setCurrentTime(newTime);

                        // Save progress after seeking
                        if (onTimeUpdate) {
                              setTimeout(() => onTimeUpdate({ target: videoRef.current } as any), 100);
                        }
                  }
            }, 100); // Reduced debounce for better responsiveness
      }, [onTimeUpdate]);

      // Optimized metadata handler with batched updates
      const handleLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            if (videoRef.current) {
                  // Batch state updates to reduce re-renders
                  const updates = () => {
                        setDuration(videoRef.current!.duration);
                        setIsLoading(false);
                        setError(null);
                  };

                  // Use requestAnimationFrame for batched updates
                  requestAnimationFrame(updates);

                  if (initialTime > 0) {
                        videoRef.current.currentTime = initialTime;
                        maxAllowedTimeRef.current = initialTime;
                        setMaxAllowedTime(initialTime);
                  }

                  // Sync current time immediately
                  const current = videoRef.current.currentTime;
                  currentTimeRef.current = current;
                  setCurrentTime(current);

                  // Set optimal buffer size
                  videoRef.current.preload = 'auto';
            }

            // Call parent callback with delay to avoid blocking
            setTimeout(() => onLoadedMetadata?.(e), 0);
      }, [initialTime, onLoadedMetadata]);

      // Optimized time update handler with throttling
      const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            // Call parent callback every 1 second to ensure progress is saved
            const currentTimeFloor = Math.floor(currentTimeRef.current);

            // Save progress every second (when seconds change)
            if (currentTimeFloor !== Math.floor(currentTime)) {
                  // Use setTimeout to avoid blocking the main thread
                  setTimeout(() => onTimeUpdate?.(e), 0);
            }
      }, [onTimeUpdate, currentTime]);

      // Optimized play handler
      const handlePlay = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            setIsPlaying(true);

            // Sync time immediately when play starts
            if (videoRef.current) {
                  const current = videoRef.current.currentTime;
                  currentTimeRef.current = current;
                  setCurrentTime(current);
            }

            onPlay?.(e);
      }, [onPlay]);

      // Optimized pause handler
      const handlePause = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            setIsPlaying(false);

            // Save progress immediately when paused
            if (videoRef.current && onTimeUpdate) {
                  setTimeout(() => onTimeUpdate(e), 0);
            }

            onPause?.(e);
      }, [onPause, onTimeUpdate]);

      // Optimized ended handler
      const handleEnded = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            setIsPlaying(false);
            setMaxAllowedTime(duration);

            // Save progress immediately when video ends
            if (videoRef.current && onTimeUpdate) {
                  setTimeout(() => onTimeUpdate(e), 0);
            }

            onEnded?.(e);
      }, [duration, onEnded, onTimeUpdate]);

      // Stable buffering detection
      const handleWaiting = useCallback(() => {
            // Show buffering after 500ms delay
            if (bufferingTimeoutRef.current) {
                  clearTimeout(bufferingTimeoutRef.current);
            }
            bufferingTimeoutRef.current = setTimeout(() => {
                  setIsBuffering(true);
            }, 100);
      }, []);

      const handleCanPlay = useCallback(() => {
            if (bufferingTimeoutRef.current) {
                  clearTimeout(bufferingTimeoutRef.current);
            }
            setIsBuffering(false);
      }, []);

      // Stable quality change
      const handleQualityChange = useCallback((newQuality: string) => {
            const current = videoRef.current;
            if (!current) return;

            const wasPlaying = !current.paused;
            const savedTime = current.currentTime;

            setCurrentQuality(newQuality);
            setIsChangingQuality(true);

            const newSource = sources[newQuality];
            if (newSource) {
                  current.src = newSource;
                  current.load();

                  const checkReady = () => {
                        if (videoRef.current && videoRef.current.readyState >= 2) {
                              videoRef.current.currentTime = savedTime;
                              setIsChangingQuality(false);
                              if (wasPlaying) {
                                    videoRef.current.play().catch(console.error);
                              }
                        } else {
                              setTimeout(checkReady, 50);
                        }
                  };
                  setTimeout(checkReady, 50);
            } else {
                  setIsChangingQuality(false);
                  setError('Không thể tải video với chất lượng đã chọn.');
            }
      }, [sources]);

      // Disable automatic quality switching to prevent interruptions
      // useEffect(() => {
      //       const checkNetworkQuality = () => {
      //             const newNetworkQuality = detectNetworkQuality();
      //             if (newNetworkQuality !== networkQualityRef.current) {
      //                   networkQualityRef.current = newNetworkQuality;
      //                   const optimalQuality = selectOptimalQuality(sources, newNetworkQuality);
      //                   if (optimalQuality !== currentQuality) {
      //                         handleQualityChange(optimalQuality);
      //                   }
      //             }
      //       };

      //       adaptiveQualityTimeoutRef.current = setInterval(checkNetworkQuality, 15000);

      //       return () => {
      //             if (adaptiveQualityTimeoutRef.current) {
      //                   clearInterval(adaptiveQualityTimeoutRef.current);
      //             }
      //       };
      // }, [sources, currentQuality, handleQualityChange]);

      // Buffer health monitoring with stable frequency
      useEffect(() => {
            const bufferCheckInterval = setInterval(checkBufferHealth, 3000); // Check every 3 seconds

            return () => {
                  clearInterval(bufferCheckInterval);
            };
      }, [checkBufferHealth]);

      // Start/stop time updates with better performance
      useEffect(() => {
            if (isPlaying) {
                  throttledTimeUpdate();
            } else {
                  if (timeUpdateTimeoutRef.current) {
                        clearTimeout(timeUpdateTimeoutRef.current);
                  }
            }

            return () => {
                  // Save progress when component unmounts
                  if (videoRef.current && onTimeUpdate) {
                        setTimeout(() => onTimeUpdate({ target: videoRef.current } as any), 0);
                  }

                  if (timeUpdateTimeoutRef.current) {
                        clearTimeout(timeUpdateTimeoutRef.current);
                  }
                  if (seekTimeoutRef.current) {
                        clearTimeout(seekTimeoutRef.current);
                  }
                  if (controlsTimeoutRef.current) {
                        clearTimeout(controlsTimeoutRef.current);
                  }
                  if (bufferingTimeoutRef.current) {
                        clearTimeout(bufferingTimeoutRef.current);
                  }
            };
      }, [isPlaying, throttledTimeUpdate, onTimeUpdate]);

      // Optimized controls visibility
      const handleMouseMove = useCallback(() => {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                  clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
      }, []);

      // Optimized fullscreen toggle
      const toggleFullscreen = useCallback(() => {
            if (!containerRef.current) return;

            if (!document.fullscreenElement) {
                  containerRef.current.requestFullscreen().catch(console.error);
                  setIsFullscreen(true);
            } else {
                  document.exitFullscreen().catch(console.error);
                  setIsFullscreen(false);
            }
      }, []);

      // Memoized calculations for better performance
      const formatTime = useCallback((time: number): string => {
            const minutes = Math.floor(time / 60).toString().padStart(2, '0');
            const seconds = Math.floor(time % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
      }, []);

      const progressPercentage = useMemo(() => {
            return duration > 0 ? (currentTime / duration) * 100 : 0;
      }, [currentTime, duration]);

      const currentVideoSource = useMemo(() => {
            const availableQualities = Object.keys(sources);
            if (availableQualities.length === 0) return '';
            return sources[currentQuality] || sources[availableQualities[0]] || '';
      }, [sources, currentQuality]);

      // Enhanced error handling
      const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            console.error('Video error:', e);
            const videoElement = e.target as HTMLVideoElement;
            const errorCode = videoElement.error?.code;
            let errorMessage = 'Không thể tải video. Vui lòng thử lại.';

            switch (errorCode) {
                  case 1:
                        errorMessage = 'Video bị gián đoạn do lỗi mạng. Vui lòng kiểm tra kết nối.';
                        break;
                  case 2:
                        errorMessage = 'Video không thể tải do lỗi định dạng.';
                        break;
                  case 3:
                        errorMessage = 'Video không thể phát do lỗi giải mã.';
                        break;
                  case 4:
                        errorMessage = 'Video không hỗ trợ trên trình duyệt này.';
                        break;
                  default:
                        errorMessage = 'Không thể tải video. Vui lòng thử lại.';
            }

            setError(errorMessage);
            setIsLoading(false);
      }, []);

      // Validate sources
      if (!sources || Object.keys(sources).length === 0) {
            return (
                  <div className="relative w-full bg-black rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: '300px' }}>
                        <div className="text-center text-white">
                              <div className="text-xl font-semibold mb-2">Không có video</div>
                              <div className="text-gray-300">Không tìm thấy nguồn video nào.</div>
                        </div>
                  </div>
            );
      }

      if (error) {
            return (
                  <div className="relative w-full bg-black rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: '300px' }}>
                        <div className="text-center text-white">
                              <div className="text-xl font-semibold mb-2">Lỗi tải video</div>
                              <div className="text-gray-300 mb-4">{error}</div>
                              <button
                                    onClick={() => {
                                          setError(null);
                                          setIsLoading(true);
                                          if (videoRef.current) {
                                                videoRef.current.load();
                                          }
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              >
                                    Thử lại
                              </button>
                        </div>
                  </div>
            );
      }

      return (
            <div
                  ref={containerRef}
                  className="relative w-full bg-black rounded-xl overflow-hidden group"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setShowControls(false)}
            >
                  <video
                        ref={videoRef}
                        src={currentVideoSource}
                        className="w-full h-auto cursor-pointer"
                        onClick={togglePlay}
                        onContextMenu={(e) => e.preventDefault()}
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onEnded={handleEnded}
                        onError={handleError}
                        onWaiting={handleWaiting}
                        onCanPlay={handleCanPlay}
                        preload="metadata"
                        playsInline
                        muted={isMuted}
                        crossOrigin="anonymous"
                        disablePictureInPicture
                        disableRemotePlayback
                        // Performance optimizations
                        autoPlay={false}
                        loop={false}
                        controls={false}
                        // Additional performance attributes
                        poster=""
                        style={{
                              willChange: 'auto',
                              transform: 'translateZ(0)',
                              backfaceVisibility: 'hidden',
                              // Hardware acceleration
                              WebkitTransform: 'translateZ(0)',
                              WebkitBackfaceVisibility: 'hidden',
                              WebkitPerspective: '1000px',
                              // Additional performance optimizations
                              // Reduce repaints
                              contain: 'layout style paint',
                              // Optimize for smooth playback
                              objectFit: 'contain',
                              objectPosition: 'center',
                              // GPU acceleration
                              // Memory optimization
                              WebkitTransformStyle: 'preserve-3d',
                              transformStyle: 'preserve-3d',
                              // Video rendering optimization
                              imageRendering: 'crisp-edges',
                        }}
                  />

                  {/* Network issues indicator with smooth transition */}
                  {/* <div
                        className={`absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-500 ease-in-out ${networkIssues ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                              }`}
                  >
                        ⚠️ Kết nối mạng không ổn định
                  </div> */}

                  {/* Loading indicator */}
                  {(isLoading || isChangingQuality) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="text-white text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                    <div>{isLoading ? 'Đang tải video...' : 'Đang chuyển chất lượng...'}</div>
                              </div>
                        </div>
                  )}

                  {/* Buffering indicator with smooth transition */}
                  <div
                        className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-all duration-300 ease-in-out ${isBuffering && !isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                              }`}
                  >
                        <div className="text-white text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                              <div className="text-sm">Đang tải...</div>
                        </div>
                  </div>

                  {/* Progress bar */}
                  <div
                        className={`absolute bottom-20 left-0 right-0 px-6 transition-all duration-300 ease-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                  >
                        {showSeekWarning && (
                              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-20">
                                    ⚠️ Bạn cần xem hết phần này trước khi tua tiếp
                              </div>
                        )}
                        <div className="relative w-full h-2 bg-black/30 rounded-full overflow-hidden">
                              {/* Buffer progress */}
                              <div
                                    className="absolute top-0 left-0 h-full bg-white/20 rounded-full"
                                    style={{ width: `${progressPercentage}%` }}
                              />

                              {/* Played progress */}
                              <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full progress-bar shadow-lg"
                                    style={{ width: `${progressPercentage}%` }}
                              />

                              {/* Max allowed time indicator */}
                              {!isLessonCompleted && maxAllowedTime > 0 && (
                                    <div
                                          className="absolute top-0 h-full w-0.5 bg-red-500 opacity-80"
                                          style={{ left: `${(maxAllowedTime / duration) * 100}%` }}
                                          title="Giới hạn tua - bạn chỉ có thể tua đến đây"
                                    />
                              )}

                              {/* Progress thumb */}
                              <div
                                    className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    style={{ left: `${progressPercentage}%` }}
                              />

                              <input
                                    type="range"
                                    min={0}
                                    max={duration}
                                    step={0.1}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="absolute top-0 left-0 w-full h-full cursor-pointer z-20 bg-transparent range-slider"
                                    style={{ pointerEvents: 'auto' }}
                              />
                        </div>
                  </div>

                  {/* Controls */}
                  <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white px-6 py-6 transition-all duration-300 ease-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                  >
                        <div className="flex items-center justify-between gap-6">
                              {/* Left controls */}
                              <div className="flex items-center gap-6">
                                    <button
                                          onClick={togglePlay}
                                          className="group relative p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110"
                                    >
                                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                                          {isPlaying ? (
                                                <PauseCircleOutlined className="text-2xl text-white relative z-10" />
                                          ) : (
                                                <PlayCircleOutlined className="text-2xl text-white relative z-10" />
                                          )}
                                    </button>

                                    <div className="flex items-center gap-3 text-sm font-semibold">
                                          <div className="bg-black/30 px-3 py-1.5 rounded-lg">
                                                <span className="text-white">{formatTime(Math.floor(currentTime))}</span>
                                          </div>
                                          <span className="text-white/60 text-lg">/</span>
                                          <div className="bg-black/30 px-3 py-1.5 rounded-lg">
                                                <span className="text-white/90">{formatTime(Math.floor(duration))}</span>
                                          </div>
                                    </div>

                                    <div className="relative flex items-center gap-3 group">
                                          <button
                                                onClick={toggleMute}
                                                className="p-2 rounded-lg bg-black/30 hover:bg-black/50 transition-all duration-200"
                                          >
                                                <SoundOutlined className={`text-lg ${isMuted ? 'text-white/50' : 'text-white'}`} />
                                          </button>

                                          <div className="relative w-24 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <input
                                                      type="range"
                                                      min={0}
                                                      max={1}
                                                      step={0.05}
                                                      value={isMuted ? 0 : volume}
                                                      onChange={handleVolumeChange}
                                                      className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer volume-slider"
                                                      style={{
                                                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                                                      }}
                                                />
                                          </div>
                                    </div>
                              </div>

                              {/* Right controls */}
                              <div className="flex items-center gap-4">
                                    {Object.keys(sources).length > 1 && (
                                          <div className="relative">
                                                <select
                                                      value={currentQuality}
                                                      onChange={(e) => handleQualityChange(e.target.value)}
                                                      className="bg-black/50 text-white border border-white/20 rounded-lg px-4 py-2 text-sm font-medium appearance-none cursor-pointer hover:bg-black/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                      style={{
                                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                                            backgroundPosition: 'right 0.75rem center',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundSize: '1.25em 1.25em',
                                                            paddingRight: '2.5rem'
                                                      }}
                                                >
                                                      {Object.keys(sources).map((quality) => (
                                                            <option key={quality} value={quality} className="bg-gray-800 text-white">
                                                                  {quality}
                                                            </option>
                                                      ))}
                                                </select>
                                          </div>
                                    )}

                                    <button
                                          onClick={toggleFullscreen}
                                          className="p-2 rounded-lg bg-black/30 hover:bg-black/50 transition-all duration-200 hover:scale-110"
                                    >
                                          {isFullscreen ? (
                                                <FullscreenExitOutlined className="text-lg text-white" />
                                          ) : (
                                                <FullscreenOutlined className="text-lg text-white" />
                                          )}
                                    </button>
                              </div>
                        </div>
                  </div>

                  {/* Performance optimized styles */}
                  <style>{`
                         /* Ultra-optimized video performance with streaming */
                         video {
                               -webkit-transform: translateZ(0);
                               -moz-transform: translateZ(0);
                               -ms-transform: translateZ(0);
                               -o-transform: translateZ(0);
                               transform: translateZ(0);
                               -webkit-backface-visibility: hidden;
                               -moz-backface-visibility: hidden;
                               -ms-backface-visibility: hidden;
                               backface-visibility: hidden;
                               will-change: transform, opacity;
                               -webkit-perspective: 1000;
                               -moz-perspective: 1000;
                               -ms-perspective: 1000;
                               perspective: 1000;
                               /* Enable hardware acceleration */
                               -webkit-accelerated-animation: true;
                               -webkit-accelerated-compositing: true;
                               /* Additional performance optimizations */
                               image-rendering: -webkit-optimize-contrast;
                               image-rendering: -moz-crisp-edges;
                               image-rendering: crisp-edges;
                               /* Reduce CPU usage */
                               will-change: auto;
                               /* Prevent layout shifts */
                               contain: layout style paint;
                               /* Optimize for smooth playback */
                               object-fit: contain;
                               object-position: center;
                               /* Disable unnecessary features */
                               -webkit-user-select: none;
                               -moz-user-select: none;
                               -ms-user-select: none;
                               user-select: none;
                               /* Reduce memory usage */
                               -webkit-transform-style: preserve-3d;
                               transform-style: preserve-3d;
                               /* Video streaming optimization */
                               -webkit-video-playable-inline: true;
                               /* Optimize for video decoding */
                               -webkit-backface-visibility: hidden;
                               backface-visibility: hidden;
                               /* Reduce repaints */
                               -webkit-transform: translateZ(0);
                               transform: translateZ(0);
                         }

                         /* Optimized slider styles */
                         .volume-slider::-webkit-slider-thumb {
                               appearance: none;
                               height: 14px;
                               width: 14px;
                               border-radius: 50%;
                               background: #3b82f6;
                               cursor: pointer;
                               box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
                               border: 2px solid white;
                               transform: translateZ(0);
                         }
                         
                         .volume-slider::-moz-range-thumb {
                               height: 14px;
                               width: 14px;
                               border-radius: 50%;
                               background: #3b82f6;
                               cursor: pointer;
                               border: 2px solid white;
                               box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
                         }

                         .range-slider {
                               pointer-events: auto !important;
                               cursor: pointer !important;
                         }
                          
                         .range-slider::-webkit-slider-thumb {
                               appearance: none;
                               height: 18px;
                               width: 18px;
                               border-radius: 50%;
                               background: white;
                               cursor: pointer;
                               box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                               border: 3px solid #3b82f6;
                               pointer-events: auto;
                               transform: translateZ(0);
                         }
                          
                         .range-slider::-moz-range-thumb {
                               height: 18px;
                               width: 18px;
                               border-radius: 50%;
                               background: white;
                               cursor: pointer;
                               border: 3px solid #3b82f6;
                               box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                               pointer-events: auto;
                         }
                          
                         .range-slider::-webkit-slider-track {
                               pointer-events: auto;
                               cursor: pointer;
                         }
                          
                         .range-slider::-moz-range-track {
                               pointer-events: auto;
                               cursor: pointer;
                         }

                         /* Disable transitions for performance */
                         .progress-bar {
                               transition: none !important;
                         }

                         /* Optimized hover effects */
                         .group:hover .volume-slider::-webkit-slider-thumb {
                               transform: scale(1.1) translateZ(0);
                               transition: transform 0.2s ease;
                         }

                         .group:hover .range-slider::-webkit-slider-thumb {
                               transform: scale(1.2) translateZ(0);
                               transition: transform 0.2s ease;
                         }

                         /* Reduce repaints */
                         * {
                               -webkit-backface-visibility: hidden;
                               backface-visibility: hidden;
                         }
                   `}</style>
            </div>
      );
});
