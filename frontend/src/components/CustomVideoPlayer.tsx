import React, { useRef, useState, useEffect } from 'react';
import {
      PlayCircleOutlined,
      PauseCircleOutlined,
      SoundOutlined,
      FullscreenOutlined,
} from '@ant-design/icons';
interface VideoQualitySources {
      [quality: string]: string; // '360p': 'https://...'
}

interface CustomVideoPlayerProps {
      videoSources: VideoQualitySources;
      subtitlesUrl?: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ videoSources, subtitlesUrl }) => {
      const videoRef = useRef<HTMLVideoElement>(null);
      const [isPlaying, setIsPlaying] = useState(false);
      const [currentTime, setCurrentTime] = useState(0);
      const [duration, setDuration] = useState(0);
      const [volume, setVolume] = useState(1);
      const [isControlsVisible, setIsControlsVisible] = useState(true);
      const [currentQuality, setCurrentQuality] = useState<'360p' | '720p' | '1080p'>('720p');
      const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
      useEffect(() => {
            if (videoSources['720p']) {
                  setVideoUrl(videoSources['720p']);
            }
      }, [videoSources]);

      useEffect(() => {
            if (!videoSources[currentQuality]) return;

            const currentTime = videoRef.current?.currentTime || 0;
            const wasPaused = videoRef.current?.paused;

            setVideoUrl(videoSources[currentQuality]);

            setTimeout(() => {
                  if (videoRef.current) {
                        videoRef.current.currentTime = currentTime;
                        if (!wasPaused) videoRef.current.play();
                  }
            }, 100);
      }, [currentQuality]);

      useEffect(() => {
            let timeout: NodeJS.Timeout;
            const handleMouseMove = () => {
                  setIsControlsVisible(true);
                  clearTimeout(timeout);
                  timeout = setTimeout(() => setIsControlsVisible(false), 3000);
            };
            document.addEventListener('mousemove', handleMouseMove);
            return () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  clearTimeout(timeout);
            };
      }, []);

      const togglePlayPause = () => {
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

      const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
            const time = parseFloat(e.target.value);
            if (videoRef.current) {
                  videoRef.current.currentTime = time;
                  setCurrentTime(time);
            }
      };

      const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const vol = parseFloat(e.target.value);
            setVolume(vol);
            if (videoRef.current) {
                  videoRef.current.volume = vol;
            }
      };

      const handleFullscreen = () => {
            if (!document.fullscreenElement) {
                  videoRef.current?.parentElement?.requestFullscreen();
                  setIsControlsVisible(true); // đảm bảo hiện control khi vào fullscreen
            } else {
                  document.exitFullscreen();
            }
      };

      return (
            <div
                  style={{
                        position: 'relative',
                        backgroundColor: '#000',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        maxHeight: 480,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
            >
                  <video
                        ref={videoRef}
                        src={videoUrl || ''}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        style={{ width: '100%', display: 'block' }}
                        controls={false}
                        controlsList="nodownload noplaybackrate nofullscreen"
                  >
                        {subtitlesUrl && (
                              <track
                                    src={subtitlesUrl}
                                    kind="subtitles"
                                    srcLang="vi"
                                    label="Phụ đề tiếng Việt"
                                    default
                              />
                        )}
                        Trình duyệt của bạn không hỗ trợ video.
                  </video>

                  {/* Custom Controls */}
                  <div
                        style={{
                              position: 'absolute',
                              bottom: 0,
                              width: '100%',
                              background: isControlsVisible ? 'rgba(0, 0, 0, 0.65)' : 'transparent',
                              color: '#fff',
                              padding: isControlsVisible ? '10px 16px' : '0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              opacity: isControlsVisible ? 1 : 0,
                              transition: 'all 0.3s ease',
                              pointerEvents: isControlsVisible ? 'auto' : 'none',
                        }}
                  >
                        {/* Play/Pause */}
                        <button
                              onClick={togglePlayPause}
                              style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: 22,
                                    cursor: 'pointer',
                              }}
                        >
                              {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        </button>

                        {/* Seek Bar */}
                        <input
                              type="range"
                              min={0}
                              max={duration}
                              step={0.1}
                              value={currentTime}
                              onChange={handleSeek}
                              style={{
                                    flex: 1,
                                    appearance: 'none',
                                    height: '5px',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    background: `linear-gradient(to right, #00bcd4 0%, #00bcd4 ${duration ? (currentTime / duration) * 100 : 0}%, #555 ${duration ? (currentTime / duration) * 100 : 0}%, #555 100%)`,
                              }}
                        />
                        <select
                              value={currentQuality}
                              onChange={(e) => setCurrentQuality(e.target.value as '360p' | '720p' | '1080p')}
                              style={{
                                    background: '#222',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                              }}
                        >
                              {Object.keys(videoSources).map((q) => (
                                    <option key={q} value={q}>
                                          {q}
                                    </option>
                              ))}
                        </select>

                        {/* Fullscreen */}
                        <button
                              onClick={handleFullscreen}
                              style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: 20,
                                    cursor: 'pointer',
                              }}
                        >
                              <FullscreenOutlined />
                        </button>

                        {/* Volume */}
                        <SoundOutlined />
                        <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={volume}
                              onChange={handleVolumeChange}
                              style={{
                                    width: 80,
                                    appearance: 'none',
                                    height: '5px',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    background: `linear-gradient(to right, #00bcd4 0%, #00bcd4 ${volume * 100}%, #555 ${volume * 100}%, #555 100%)`,
                              }}
                        />

                  </div>
                  <style>
                        {`
    video::-webkit-media-controls {
      display: none !important;
    }

    video::-moz-media-controls {
      display: none !important;
    }

  `}
                  </style>

            </div>
      );
};

export default CustomVideoPlayer;
