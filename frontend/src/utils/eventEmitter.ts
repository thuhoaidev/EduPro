// Event emitter utility để quản lý realtime events
export class EventEmitter {
  // Dispatch event khi follow/unfollow user
  static emitFollowStatusChanged(data?: any) {
    window.dispatchEvent(new CustomEvent('followStatusChanged', { detail: data }));
  }

  // Dispatch event khi nhận tin nhắn mới
  static emitMessageReceived(data?: any) {
    window.dispatchEvent(new CustomEvent('messageReceived', { detail: data }));
  }

  // Dispatch event khi gửi tin nhắn
  static emitMessageSent(data?: any) {
    window.dispatchEvent(new CustomEvent('messageSent', { detail: data }));
  }

  // Dispatch event khi có thay đổi trong danh sách conversations
  static emitConversationsChanged(data?: any) {
    window.dispatchEvent(new CustomEvent('conversationsChanged', { detail: data }));
  }

  // Helper methods để listen events
  static on(eventName: string, handler: (event: CustomEvent) => void) {
    window.addEventListener(eventName, handler as EventListener);
  }

  static off(eventName: string, handler: (event: CustomEvent) => void) {
    window.removeEventListener(eventName, handler as EventListener);
  }
}
