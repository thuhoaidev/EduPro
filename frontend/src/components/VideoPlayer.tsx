import React, { useState } from 'react';
import { Modal, Button, Select, Space, message } from 'antd';
import { PlayCircleOutlined, FullscreenOutlined } from '@ant-design/icons';

interface VideoPlayerProps {
      video: {
            id: string;
            title: string;
            duration: number;
            quality_urls?: Map<string, { url: string; public_id: string }>;
      };
      visible: boolean;
      onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, visible, onClose }) => {
      const [selectedQuality, setSelectedQuality] = useState<string>('720p');
      const [isPlaying, setIsPlaying] = useState(false);

      // Lấy danh sách chất lượng có sẵn
      const availableQualities = video.quality_urls
            ? Array.from(video.quality_urls.keys())
            : [];

      // Lấy URL video theo chất lượng được chọn
      const getVideoUrl = () => {
            if (!video.quality_urls) return null;

            // Ưu tiên chất lượng được chọn, nếu không có thì lấy chất lượng đầu tiên
            const selectedUrl = video.quality_urls.get(selectedQuality)?.url;
            if (selectedUrl) return selectedUrl;

            // Fallback to first available quality
            const firstQuality = availableQualities[0];
            return firstQuality ? video.quality_urls.get(firstQuality)?.url : null;
      };

      const videoUrl = getVideoUrl();

      const formatDuration = (seconds: number): string => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;

            if (hours > 0) {
                  return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
            }
            return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
      };

      const handlePlay = () => {
            setIsPlaying(true);
      };

      const handlePause = () => {
            setIsPlaying(false);
      };

      const handleFullscreen = () => {
            const videoElement = document.querySelector('video');
            if (videoElement) {
                  if (videoElement.requestFullscreen) {
                        videoElement.requestFullscreen();
                  } else if ((videoElement as any).webkitRequestFullscreen) {
                        (videoElement as any).webkitRequestFullscreen();
                  } else if ((videoElement as any).msRequestFullscreen) {
                        (videoElement as any).msRequestFullscreen();
                  }
            }
      };

      if (!videoUrl) {
            return (
                  <Modal
                        title="Video Player"
                        open={visible}
                        onCancel={onClose}
                        footer={null}
                        width={800}
                  >
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                              <p>Không có video nào được tìm thấy</p>
                        </div>
                  </Modal>
            );
      }

      return (
            <Modal
                  title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{video.title}</span>
                              <Space>
                                    {availableQualities.length > 1 && (
                                          <Select
                                                value={selectedQuality}
                                                onChange={setSelectedQuality}
                                                style={{ width: 100 }}
                                                size="small"
                                          >
                                                {availableQualities.map(quality => (
                                                      <Select.Option key={quality} value={quality}>
                                                            {quality}
                                                      </Select.Option>
                                                ))}
                                          </Select>
                                    )}
                                    <Button
                                          icon={<FullscreenOutlined />}
                                          size="small"
                                          onClick={handleFullscreen}
                                    >
                                          Fullscreen
                                    </Button>
                              </Space>
                        </div>
                  }
                  open={visible}
                  onCancel={onClose}
                  footer={null}
                  width={900}
                  bodyStyle={{ padding: 0 }}
            >
                  <div style={{ position: 'relative' }}>
                        <video
                              src={videoUrl}
                              controls
                              style={{ width: '100%', height: 'auto', maxHeight: '500px' }}
                              onPlay={handlePlay}
                              onPause={handlePause}
                              onLoadedMetadata={() => {
                                    // Auto play khi video load xong
                                    const videoElement = document.querySelector('video');
                                    if (videoElement) {
                                          videoElement.play().catch(() => {
                                                // Auto play bị chặn, không làm gì
                                          });
                                    }
                              }}
                        />
                        <div style={{
                              position: 'absolute',
                              bottom: 10,
                              left: 10,
                              background: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px'
                        }}>
                              {formatDuration(video.duration)}
                        </div>
                  </div>
            </Modal>
      );
};

export default VideoPlayer; 