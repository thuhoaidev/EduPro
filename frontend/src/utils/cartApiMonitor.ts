// Utility to monitor cart API calls
class CartApiMonitor {
  private static instance: CartApiMonitor;
  private callCount = 0;
  private lastCallTime = 0;
  private callLog: Array<{ timestamp: number; source: string; reason: string }> = [];

  static getInstance(): CartApiMonitor {
    if (!CartApiMonitor.instance) {
      CartApiMonitor.instance = new CartApiMonitor();
    }
    return CartApiMonitor.instance;
  }

  logCall(source: string, reason: string) {
    this.callCount++;
    this.lastCallTime = Date.now();
    this.callLog.push({
      timestamp: this.lastCallTime,
      source,
      reason
    });

    // Keep only last 50 calls
    if (this.callLog.length > 50) {
      this.callLog = this.callLog.slice(-50);
    }

    console.log(`🛒 Cart API Call #${this.callCount} from ${source}: ${reason}`);
    
    // Log warning if too many calls in short time
    const recentCalls = this.callLog.filter(
      call => this.lastCallTime - call.timestamp < 10000
    );
    
    if (recentCalls.length > 5) {
      console.warn(`⚠️ Too many cart API calls (${recentCalls.length} in 10s) from:`, 
        recentCalls.map(call => `${call.source}: ${call.reason}`));
    }
  }

  getStats() {
    return {
      totalCalls: this.callCount,
      lastCallTime: this.lastCallTime,
      recentCalls: this.callLog.slice(-10)
    };
  }

  reset() {
    this.callCount = 0;
    this.lastCallTime = 0;
    this.callLog = [];
  }
}

export const cartApiMonitor = CartApiMonitor.getInstance();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).cartApiMonitor = cartApiMonitor;
}
