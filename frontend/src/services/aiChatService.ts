// src/services/aiChatService.ts
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  message: string;
  error?: string;
}

class AIChatService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    // Lấy API key từ environment variables hoặc config
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseURL = 'https://api.openai.com/v1';
    
    // Debug: Kiểm tra API key
    console.log('🔍 AIChatService - API Key loaded:', this.apiKey ? 'YES' : 'NO');
    console.log('🔍 AIChatService - API Key length:', this.apiKey.length);
    console.log('🔍 AIChatService - API Key starts with:', this.apiKey.substring(0, 10) + '...');
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    console.log('🚀 AIChatService - Making request to:', endpoint);
    console.log('🚀 AIChatService - Request data:', data);
    
    if (!this.apiKey) {
      console.error('❌ AIChatService - No API key found!');
      throw new Error('OpenAI API key không được cấu hình. Vui lòng thêm VITE_OPENAI_API_KEY vào file .env');
    }

    if (!this.apiKey.startsWith('sk-')) {
      console.error('❌ AIChatService - Invalid API key format!');
      throw new Error('API key không đúng định dạng. Phải bắt đầu bằng "sk-"');
    }

    try {
      console.log('📡 AIChatService - Sending request to OpenAI...');
      const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });
      
      console.log('✅ AIChatService - OpenAI response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ AIChatService - OpenAI API Error:', error);
      console.error('❌ AIChatService - Error response:', error.response?.data);
      console.error('❌ AIChatService - Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('API key không hợp lệ hoặc đã hết hạn');
      } else if (error.response?.status === 429) {
        throw new Error('Đã vượt quá giới hạn API calls');
      } else if (error.response?.status === 500) {
        throw new Error('Lỗi server OpenAI');
      } else {
        throw new Error(error.response?.data?.error?.message || 'Có lỗi khi kết nối với AI');
      }
    }
  }

  async sendMessage(
    userMessage: string, 
    lessonContext: string = '', 
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    console.log('💬 AIChatService - sendMessage called');
    console.log('💬 AIChatService - User message:', userMessage);
    console.log('💬 AIChatService - Lesson context:', lessonContext);
    console.log('💬 AIChatService - Conversation history length:', conversationHistory.length);
    
    try {
      // Tạo system message với context bài học
      const systemMessage: ChatMessage = {
        role: 'system',
        content: `Bạn là một trợ lý AI thông minh, chuyên gia về giáo dục trực tuyến. 
        Bạn sẽ trả lời bằng tiếng Việt và giúp học viên hiểu rõ hơn về bài học.
        
        Context bài học hiện tại: ${lessonContext}
        
        Hướng dẫn:
        - Luôn trả lời bằng tiếng Việt
        - Giải thích rõ ràng, dễ hiểu
        - Đưa ra ví dụ thực tế khi có thể
        - Khuyến khích học viên đặt câu hỏi thêm
        - Nếu không biết, hãy thành thật nói không biết
        - Giữ câu trả lời ngắn gọn nhưng đầy đủ thông tin`
      };

      // Tạo messages array cho API
      const messages: ChatMessage[] = [
        systemMessage,
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      console.log('📝 AIChatService - Final messages array:', messages);

      const response = await this.makeRequest('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        console.error('❌ AIChatService - No AI response in choices');
        throw new Error('Không nhận được phản hồi từ AI');
      }

      console.log('✅ AIChatService - AI response:', aiResponse);
      return { message: aiResponse };
    } catch (error: any) {
      console.error('❌ AIChatService - Error in sendMessage:', error);
      return { 
        message: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        error: error.message 
      };
    }
  }

  // Fallback method khi không có API key
  async sendMessageFallback(userMessage: string, lessonTitle: string): Promise<ChatResponse> {
    console.log('🔄 AIChatService - Using fallback response');
    const responses = [
      `Xin chào! Tôi có thể giúp gì cho bạn về bài học "${lessonTitle}"?`,
      `Cảm ơn câu hỏi của bạn. Về bài học này, tôi có thể giải thích thêm về: ${userMessage.toLowerCase().includes('php') ? 'PHP và Laravel Framework' : 'nội dung bài học'}.`,
      `Đây là một câu hỏi rất hay! Trong bài học này, chúng ta sẽ học về ${userMessage.toLowerCase().includes('framework') ? 'Laravel Framework' : 'các khái niệm quan trọng'}.`,
      `Tôi hiểu thắc mắc của bạn. Hãy để tôi giải thích chi tiết hơn về ${userMessage.toLowerCase().includes('code') ? 'code' : 'nội dung'} trong bài học này.`,
      `Đây là một điểm quan trọng! Trong bài học "${lessonTitle}", chúng ta sẽ tìm hiểu sâu về ${userMessage.toLowerCase().includes('web') ? 'phát triển web' : 'các kỹ thuật mới'}.`
    ];
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fallbackResponse = responses[Math.floor(Math.random() * responses.length)];
    console.log('🔄 AIChatService - Fallback response:', fallbackResponse);
    
    return { 
      message: fallbackResponse 
    };
  }
}

export default new AIChatService(); 