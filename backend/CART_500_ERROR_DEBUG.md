# Hướng dẫn debug lỗi 500 (Internal Server Error) - Cart API

## Mô tả lỗi
Lỗi 500 xảy ra khi xóa item khỏi giỏ hàng:
- `DELETE /api/carts/:itemId` trả về 500
- Frontend hiển thị "Lỗi khi xóa nhiều: AxiosError"

## Nguyên nhân có thể

### 1. Route Conflict
- Có 2 route DELETE trong cart.routes.js
- Route `router.delete('/:itemId', ...)` match với route `router.delete('/', ...)`
- **Đã sửa**: Đổi thứ tự route để route cụ thể đặt trước

### 2. ObjectId Comparison
- So sánh ObjectId không đúng cách
- **Đã sửa**: Sử dụng `toString()` để so sánh

### 3. Database Session Issues
- MongoDB session không được xử lý đúng
- **Đã sửa**: Sử dụng `findOneAndUpdate` thay vì session

### 4. Race Condition
- Multiple concurrent DELETE requests gây xung đột
- **Đã sửa**: Thêm bulk delete API và cải thiện logic

### 5. Missing Error Handling
- Không xử lý các trường hợp lỗi cụ thể
- **Đã sửa**: Thêm logging và error handling chi tiết

## Các thay đổi đã thực hiện

### 1. Backend (cart.routes.js)

#### Sửa route DELETE /:itemId
```javascript
// Sử dụng findOneAndUpdate thay vì session để tránh race condition
const result = await Cart.findOneAndUpdate(
  { 
    user: req.user._id,
    'items._id': req.params.itemId 
  },
  { 
    $pull: { 
      items: { _id: req.params.itemId } 
    } 
  },
  { 
    new: true,
    runValidators: true
  }
);
```

#### Thêm bulk delete API
```javascript
// @desc    Xóa nhiều khóa học khỏi giỏ hàng
// @route   DELETE /api/carts/bulk
// @access  Private
router.delete('/bulk', auth, async (req, res) => {
  const { itemIds } = req.body;
  
  const result = await Cart.findOneAndUpdate(
    { 
      user: req.user._id,
      'items._id': { $in: itemIds }
    },
    { 
      $pull: { 
        items: { _id: { $in: itemIds } } 
      } 
    },
    { 
      new: true,
      runValidators: true
    }
  );
});
```

### 2. Frontend (CartPage.tsx)

#### Sử dụng bulk delete API
```javascript
const handleRemoveSelected = async () => {
  try {
    // Sử dụng bulk delete API
    const response = await apiClient.delete('/carts/bulk', {
      data: { itemIds: selectedItems }
    });
    
    if (response.data.success) {
      const { deletedCount, itemCount } = response.data.data;
      
      // Cập nhật state
      setCartItems(cartItems.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      
      // Hiển thị thông báo
      if (deletedCount === selectedItems.length) {
        message.success(`Đã xóa ${deletedCount} khóa học khỏi giỏ hàng!`);
      } else {
        message.warning(`Đã xóa ${deletedCount}/${selectedItems.length} khóa học khỏi giỏ hàng`);
      }
    }
  } catch (err: any) {
    // Error handling
  }
};
```

#### Cải thiện error handling
```javascript
const removeItem = async (id: string) => {
  try {
    console.log('Removing item with ID:', id);
    const response = await apiClient.delete(`/carts/${id}`);
    console.log('Remove response:', response.data);
    // ...
  } catch (err: any) {
    console.error('Lỗi khi xóa:', err);
    console.error('Error response:', err.response?.data);
    
    if (err.response?.status === 404) {
      message.error('Không tìm thấy sản phẩm trong giỏ hàng');
    } else if (err.response?.status === 401) {
      message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    } else {
      message.error('Không thể xóa khóa học');
    }
  }
};
```

## Cách debug

### 1. Kiểm tra server logs
```bash
# Trong terminal backend
npm start
# Hoặc
node server.js
```

### 2. Kiểm tra browser console
```javascript
// Trong browser console
// Xem logs từ frontend
console.log('Removing item with ID:', id);
console.log('Remove response:', response.data);
```

### 3. Test API trực tiếp
```bash
# Test single delete
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/carts/ITEM_ID

# Test bulk delete
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemIds":["ID1","ID2","ID3"]}' \
  http://localhost:5000/api/carts/bulk
```

### 4. Sử dụng test script
```bash
# Chạy test script
node test-cart-api.js
```

## Các bước khắc phục

### 1. Restart server
```bash
# Dừng server (Ctrl+C)
# Khởi động lại
npm start
```

### 2. Kiểm tra database
```javascript
// Trong MongoDB shell
use your_database_name
db.carts.find({ user: ObjectId("USER_ID") })
```

### 3. Kiểm tra token
```javascript
// Trong browser console
localStorage.getItem('token')
```

### 4. Clear cache
```javascript
// Trong browser console
localStorage.clear()
// Refresh trang và đăng nhập lại
```

## Monitoring

### 1. Server logs
- Theo dõi console logs trong terminal backend
- Kiểm tra các log messages đã thêm

### 2. Network tab
- Mở Developer Tools > Network
- Kiểm tra request/response cho DELETE /api/carts/:itemId
- Kiểm tra request/response cho DELETE /api/carts/bulk

### 3. Database logs
- Kiểm tra MongoDB logs nếu có
- Theo dõi các operations trên collection carts

## Best Practices

### 1. Error Handling
```javascript
try {
  // API call
} catch (error) {
  console.error('Error details:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data
  });
}
```

### 2. Logging
```javascript
console.log('Operation details:', {
  userId: req.user._id,
  itemId: req.params.itemId,
  timestamp: new Date().toISOString()
});
```

### 3. Validation
```javascript
// Kiểm tra ObjectId hợp lệ
const mongoose = require('mongoose');
if (!mongoose.Types.ObjectId.isValid(itemId)) {
  return res.status(400).json({
    success: false,
    error: 'Invalid item ID format'
  });
}
```

### 4. Bulk Operations
```javascript
// Sử dụng bulk delete thay vì multiple single deletes
const result = await Cart.findOneAndUpdate(
  { user: req.user._id, 'items._id': { $in: itemIds } },
  { $pull: { items: { _id: { $in: itemIds } } } },
  { new: true, runValidators: true }
);
```

## Troubleshooting Checklist

- [ ] Server đang chạy
- [ ] Database connection OK
- [ ] Token hợp lệ
- [ ] Route không bị conflict
- [ ] ObjectId format đúng
- [ ] User có quyền truy cập
- [ ] Item tồn tại trong giỏ hàng
- [ ] Session được xử lý đúng
- [ ] Error handling đầy đủ
- [ ] Logs được ghi đúng
- [ ] Bulk delete API hoạt động
- [ ] Race condition được xử lý

## Notes
- Lỗi 500 thường do server-side issues
- Kiểm tra logs trước khi debug frontend
- Sử dụng proper error handling để tránh crash
- Test API trực tiếp để isolate vấn đề
- Sử dụng bulk operations để tránh race condition
- MongoDB `findOneAndUpdate` với `$pull` operator hiệu quả hơn session 