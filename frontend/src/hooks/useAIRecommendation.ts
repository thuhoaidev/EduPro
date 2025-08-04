import { useState, useEffect, useCallback } from 'react';
import aiRecommendationService from '../services/aiRecommendationService';
import type { CourseRecommendation, AIRecommendationResponse } from '../services/aiRecommendationService';
import { message } from 'antd';

export const useAIRecommendation = (userId: string) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [reasons, setReasons] = useState<{ id: string; title: string; description: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasShownRecommendation, setHasShownRecommendation] = useState(false);

  const loadRecommendations = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res: AIRecommendationResponse = await aiRecommendationService.getRecommendations(userId);
      if (res.success) {
        setRecommendations(res.data.recommendations);
        setReasons(res.data.reasons);
        
        // Hiển thị thông báo nếu có khóa học được gợi Ý
        if (res.data.recommendations.length > 0) {
          message.success(`Đã tìm thấy ${res.data.recommendations.length} khóa học phù hợp cho bạn!`);
        }
      } else {
        setError('Không thể tải dữ liệu gợi Ý');
        message.error('Không thể tải dữ liệu gợi Ý');
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu gợi Ý');
      message.error('Có lỗi xảy ra khi tải dữ liệu gợi Ý');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || hasShownRecommendation) return;
    
    // Hiển thị modal sau 5 giây chỉ một lần
    const timer = setTimeout(() => {
      setVisible(true);
      setHasShownRecommendation(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [userId, hasShownRecommendation]);

  useEffect(() => {
    if (visible && !loading && recommendations.length === 0 && reasons.length === 0) {
      loadRecommendations();
    }
  }, [visible, loading, recommendations.length, reasons.length, loadRecommendations]);

  const handleClose = () => {
    setVisible(false);
    setError(null);
  };

  return { 
    visible, 
    loading, 
    recommendations, 
    reasons, 
    error,
    setVisible: handleClose 
  };
}; 