import axios from 'axios';
import config from '../config/config';

export interface CourseRecommendation {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  rating: number;
  instructor: { fullname: string; avatar?: string };
  level: string;
  category: { name: string };
  recommendScore: number;
}

export interface AIRecommendationResponse {
  success: boolean;
  data: {
    recommendations: CourseRecommendation[];
    reasons: { id: string; title: string; description: string }[];
  };
}

class AIRecommendationService {
  private baseURL: string;
  constructor() {
    this.baseURL = config.apiUrl;
  }
  async getRecommendations(userId: string): Promise<AIRecommendationResponse> {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${this.baseURL}/ai/recommendations/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
  async updateUserBehavior(userId: string, behavior: any): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.post(`${this.baseURL}/ai/user-behavior/${userId}`, behavior, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
export default new AIRecommendationService(); 