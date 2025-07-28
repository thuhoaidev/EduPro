import React, { useRef, useState, useEffect, useMemo } from 'react';
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

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
      sources,
      onTimeUpdate,
      onEnded,
      onLoadedMetadata,
      onPlay,
      onPause,
      initialTime = 0,
      isLessonCompleted = false
}) => {
      const videoRef = useRef<HTMLVideoElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const animationFrameRef = useRef<number | null>(null);

      const [currentQuality, setCurrentQuality] = useState<string>('720p');
      const [isPlaying, setIsPlaying] = useState(false);
      const [duration, setDuration] = useState(0);
      const [volume, setVolume] = useState(1);
      const [currentTime, setCurrentTime] = useState(0);
      const [isFullscreen, setIsFullscreen] = useState(false);
      const [showControls, setShowControls] = useState(true);
      const [lastTime, setLastTime] = useState(0);
      const [isMuted, setIsMuted] = useState(false);
      const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
      const [maxAllowedTime, setMaxAllowedTime] = useState(0);


      // Set initial time when video loads
      useEffect(() => {
            if (videoRef.current && initialTime > 0) {
                  const setTime = () => {
                        if (videoRef.current && videoRef.current.readyState >= 1) {
                              console.log('Setting initial time in CustomVideoPlayer:', initialTime);
                              videoRef.current.currentTime = initialTime;
                        } else {
                              // Retry after a short delay if video not ready
                              setTimeout(setTime, 100);
                        }
                  };
                  setTime();
            }
      }, [initialTime]);

      const togglePlay = () => {
            const video = videoRef.current;
            if (!video) return;

            if (video.paused) {
                  video.play();
                  setIsPlaying(true);
            } else {
                  video.pause();
                  setIsPlaying(false);
            }
      };

      const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newVolume = parseFloat(e.target.value);
            setVolume(newVolume);
            if (videoRef.current) {
                  videoRef.current.volume = newVolume;
                  if (newVolume === 0) {
                        setIsMuted(true);
                  } else {
                        setIsMuted(false);
                  }
            }
      };

      const toggleMute = () => {
            if (videoRef.current) {
                  if (isMuted) {
                        videoRef.current.volume = volume;
                        setIsMuted(false);
                  } else {
                        videoRef.current.volume = 0;
                        setIsMuted(true);
                  }
            }
      };

      const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newTime = parseFloat(e.target.value);

            // Nếu bài đã hoàn thành, cho phép tua tự do
            if (!isLessonCompleted && newTime > maxAllowedTime) {
                  return;
            }

            setCurrentTime(newTime);

            if (seekTimeoutRef.current) {
                  clearTimeout(seekTimeoutRef.current);
            }

            seekTimeoutRef.current = setTimeout(() => {
                  if (videoRef.current) {
                        videoRef.current.currentTime = newTime;
                  }
            }, 50);
      };


      const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                  // Set initial time when metadata is loaded
                  if (initialTime > 0) {
                        console.log('Setting time in handleLoadedMetadata:', initialTime);
                        videoRef.current.currentTime = initialTime;
                  }
            }
            onLoadedMetadata?.(e);
      };

      const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            const current = videoRef.current?.currentTime || 0;
            setCurrentTime(current);

            if (current > maxAllowedTime) {
                  setMaxAllowedTime(current); // Cập nhật đoạn đã xem
            }

            onTimeUpdate?.(e);
      };

      const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            setIsPlaying(true);
            onPlay?.(e);
      };

      const handlePause = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            setIsPlaying(false);
            onPause?.(e);
      };

      const handleEnded = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
            setIsPlaying(false);
            setMaxAllowedTime(duration); // Cho phép tua toàn bộ sau khi xem xong
            onEnded?.(e);
      };


      const updateTime = () => {
            if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                  animationFrameRef.current = requestAnimationFrame(updateTime);
            }
      };

      useEffect(() => {
            if (isPlaying) {
                  animationFrameRef.current = requestAnimationFrame(updateTime);
            } else {
                  if (animationFrameRef.current) {
                        cancelAnimationFrame(animationFrameRef.current);
                  }
            }

            return () => {
                  if (animationFrameRef.current) {
                        cancelAnimationFrame(animationFrameRef.current);
                  }
                  if (seekTimeoutRef.current) {
                        clearTimeout(seekTimeoutRef.current);
                  }
            };
      }, [isPlaying]);

      const toggleFullscreen = () => {
            if (!containerRef.current) return;

            if (!document.fullscreenElement) {
                  containerRef.current.requestFullscreen();
                  setIsFullscreen(true);
            } else {
                  document.exitFullscreen();
                  setIsFullscreen(false);
            }
      };

      const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout((window as any).hideControlsTimeout);
            (window as any).hideControlsTimeout = setTimeout(() => setShowControls(false), 3000);
      };

      const handleQualityChange = (newQuality: string) => {
            const current = videoRef.current;
            if (!current) return;

            const wasPlaying = !current.paused;
            const savedTime = current.currentTime;

            setLastTime(savedTime);
            setCurrentQuality(newQuality);

            setTimeout(() => {
                  if (videoRef.current) {
                        videoRef.current.currentTime = savedTime;
                        if (wasPlaying) videoRef.current.play();
                  }
            }, 200);
      };

      const formatTime = (time: number): string => {
            const minutes = Math.floor(time / 60)
                  .toString()
                  .padStart(2, '0');
            const seconds = Math.floor(time % 60)
                  .toString()
                  .padStart(2, '0');
            return `${minutes}:${seconds}`;
      };

      // Memoize progress calculations
      const progressPercentage = useMemo(() => {
            return duration > 0 ? (currentTime / duration) * 100 : 0;
      }, [currentTime, duration]);



      return (
            <div
                  ref={containerRef}
                  className="relative w-full bg-black rounded-xl overflow-hidden group"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setShowControls(false)}
            >
                  <video
                        ref={videoRef}
                        src={sources[currentQuality]}
                        className="w-full h-auto cursor-pointer"
                        onClick={togglePlay}
                        onContextMenu={(e) => e.preventDefault()}
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onEnded={handleEnded}
                        preload="auto"
                  />

                  {/* Progress bar */}
                  <div
                        className={`absolute bottom-16 left-0 right-0 px-4 transition-all duration-500 ease-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                              }`}
                  >
                        <div className="relative w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                              {/* Buffered progress */}
                              <div className="absolute top-0 left-0 h-full bg-white/20 rounded-full transition-all duration-300" style={{ width: '60%' }} />
                              {/* Viewed progress */}
                              <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-150 ease-linear shadow-lg"
                                    style={{ width: `${progressPercentage}%` }}
                              />

                              <input
                                    type="range"
                                    min={0}
                                    max={duration}
                                    step={0.1}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="absolute top-0 left-0 w-full h-full cursor-pointer z-10 bg-transparent"
                              />


                        </div>
                  </div>

                  {/* Controls */}
                  <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent text-white px-6 py-4 transition-all duration-500 ease-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                              }`}
                  >
                        <div className="flex items-center justify-between gap-4">
                              {/* Left side controls */}
                              <div className="flex items-center gap-4">
                                    {/* Play/Pause button */}
                                    <button
                                          onClick={togglePlay}
                                          className="outline-none focus:outline-none hover:scale-110 transition-transform duration-200 group/play"
                                    >
                                          {isPlaying ? (
                                                <PauseCircleOutlined className="text-3xl text-white group-hover/play:text-blue-400 transition-colors drop-shadow-lg" />
                                          ) : (
                                                <PlayCircleOutlined className="text-3xl text-white group-hover/play:text-blue-400 transition-colors drop-shadow-lg" />
                                          )}
                                    </button>

                                    {/* Time display */}
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                          <span className="text-white/90">{formatTime(Math.floor(currentTime))}</span>
                                          <span className="text-white/50">/</span>
                                          <span className="text-white/70">{formatTime(Math.floor(duration))}</span>
                                    </div>

                                    {/* Volume control */}
                                    <div className="relative flex items-center gap-2">
                                          <button
                                                onClick={toggleMute}
                                                className="outline-none focus:outline-none hover:scale-110 transition-transform duration-200"
                                          >
                                                <SoundOutlined className={`text-xl transition-colors drop-shadow-lg ${isMuted ? 'text-white/50' : 'text-white'}`} />
                                          </button>

                                          <div className="relative w-20">
                                                <input
                                                      type="range"
                                                      min={0}
                                                      max={1}
                                                      step={0.05}
                                                      value={isMuted ? 0 : volume}
                                                      onChange={handleVolumeChange}
                                                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                                                      style={{
                                                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                                                      }}
                                                />
                                          </div>
                                    </div>
                              </div>

                              {/* Right side controls */}
                              <div className="flex items-center gap-3">
                                    {/* Quality selector */}
                                    <div className="relative">
                                          <select
                                                value={currentQuality}
                                                onChange={(e) => handleQualityChange(e.target.value)}
                                                className="bg-black/50 text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm font-medium appearance-none cursor-pointer hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                style={{
                                                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                                      backgroundPosition: 'right 0.5rem center',
                                                      backgroundRepeat: 'no-repeat',
                                                      backgroundSize: '1.5em 1.5em',
                                                      paddingRight: '2.5rem'
                                                }}
                                          >
                                                {Object.keys(sources).map((quality) => (
                                                      <option key={quality} value={quality} className="bg-black text-white">
                                                            {quality}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    {/* Fullscreen button */}
                                    <button
                                          onClick={toggleFullscreen}
                                          className="outline-none focus:outline-none hover:scale-110 transition-transform duration-200 group/fullscreen"
                                    >
                                          {isFullscreen ? (
                                                <FullscreenExitOutlined className="text-xl text-white group-hover/fullscreen:text-blue-400 transition-colors drop-shadow-lg" />
                                          ) : (
                                                <FullscreenOutlined className="text-xl text-white group-hover/fullscreen:text-blue-400 transition-colors drop-shadow-lg" />
                                          )}
                                    </button>
                              </div>
                        </div>
                  </div>

                  {/* Custom styles for range inputs */}
                  <style>{`
                        .slider::-webkit-slider-thumb {
                              appearance: none;
                              height: 12px;
                              width: 12px;
                              border-radius: 50%;
                              background: #3b82f6;
                              cursor: pointer;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                        
                        .slider::-moz-range-thumb {
                              height: 12px;
                              width: 12px;
                              border-radius: 50%;
                              background: #3b82f6;
                              cursor: pointer;
                              border: none;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                  `}</style>
            </div>
      );
};
