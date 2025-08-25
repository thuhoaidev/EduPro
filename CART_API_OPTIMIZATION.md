# Cart API Optimization - Giảm thiểu API calls quá mức

## Vấn đề
Hệ thống đang gọi API `/api/carts` quá nhiều lần, gây ra:
- Tải server không cần thiết
- Trải nghiệm người dùng chậm
- Lãng phí tài nguyên

## Nguyên nhân
1. **CartContext useEffect dependency issue**: `[localStorage.getItem('token')]` gây re-render liên tục
2. **Header component có nhiều useEffect** gọi `refreshCart()`:
   - On mount và user change
   - Window focus/visibility change
   - 30-second interval
   - Multiple custom events
3. **Thiếu debouncing/throttling** cho API calls
4. **Không kiểm tra data thay đổi** trước khi gọi API

## Giải pháp đã áp dụng

### 1. Sửa CartContext useEffect
```typescript
// Trước
useEffect(() => {
  // ...
}, [localStorage.getItem('token')]); // ❌ Gây re-render liên tục

// Sau
useEffect(() => {
  // ...
}, []); // ✅ Chỉ chạy 1 lần

// Thêm listener cho token changes
useEffect(() => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'token') {
      // Handle token change
    }
  };
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### 2. Thêm Throttling trong CartContext
```typescript
const updateCartCount = async () => {
  // Throttle: chỉ cho phép gọi API mỗi 2 giây
  const now = Date.now();
  if (isUpdating || (now - lastUpdateTime.current < 2000)) {
    console.log('Cart update throttled - skipping API call');
    return;
  }
  // ... rest of function
};
```

### 3. Thêm Debouncing trong Header
```typescript
// Debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Sử dụng debounced version
const debouncedRefreshCart = useRef(debounce(refreshCart, 1000)).current;
```

### 4. Tăng interval time
```typescript
// Trước: 30 giây
const interval = setInterval(() => {
  refreshCart();
}, 30000);

// Sau: 2 phút
const interval = setInterval(() => {
  debouncedRefreshCart();
}, 120000);
```

### 5. Kiểm tra data thay đổi
```typescript
// Chỉ cập nhật nếu data thực sự thay đổi
if (newCount !== cartCount || JSON.stringify(items) !== JSON.stringify(cartItems)) {
  setCartCount(newCount);
  setCartItems(items);
  window.dispatchEvent(new CustomEvent('cart-updated'));
} else {
  console.log('Cart data unchanged, skipping update');
}
```

### 6. Thêm API Monitor
Tạo utility để monitor và debug cart API calls:
```typescript
// Sử dụng trong CartContext
cartApiMonitor.logCall('CartContext', 'updateCartCount');

// Debug trong console
window.cartApiMonitor.getStats();
```

## Kết quả mong đợi
- **Giảm 80-90%** số lượng API calls
- **Tăng performance** của ứng dụng
- **Giảm tải server**
- **Cải thiện UX** với debouncing

## Cách test
1. Mở DevTools Console
2. Theo dõi log: `🛒 Cart API Call #X from source: reason`
3. Kiểm tra warning: `⚠️ Too many cart API calls`
4. Debug với: `window.cartApiMonitor.getStats()`

## Files đã thay đổi
- `frontend/src/contexts/CartContext.tsx`
- `frontend/src/pages/layout/Header.tsx`
- `frontend/src/utils/cartApiMonitor.ts` (mới)
- `CART_API_OPTIMIZATION.md` (mới)
