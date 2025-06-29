# Hướng dẫn Luồng Voucher và Order - EduPro

## Tổng quan

Dự án EduPro đã được tích hợp đầy đủ luồng voucher và order với các tính năng:

### Backend Features
- ✅ Voucher Management (CRUD)
- ✅ Voucher Validation
- ✅ Voucher Usage Tracking
- ✅ Order Creation với Voucher
- ✅ Order Management
- ✅ Cart Integration

### Frontend Features
- ✅ Voucher Display (Homepage)
- ✅ Voucher Application (Cart)
- ✅ Checkout Process
- ✅ Order History
- ✅ Order Details

## Cấu trúc Database

### 1. Voucher Model
```javascript
{
  code: String,           // Mã voucher (unique)
  title: String,          // Tiêu đề voucher
  description: String,    // Mô tả
  discountType: String,   // 'percentage' | 'fixed'
  discountValue: Number,  // Giá trị giảm
  maxDiscount: Number,    // Giảm tối đa (cho percentage)
  minOrderValue: Number,  // Đơn hàng tối thiểu
  usageLimit: Number,     // Số lượt sử dụng tối đa
  usedCount: Number,      // Số lượt đã sử dụng
  startDate: Date,        // Ngày bắt đầu
  endDate: Date,          // Ngày kết thúc
  categories: [String],   // Danh mục áp dụng
  tags: [String],         // Tags
  isNew: Boolean,         // Voucher mới
  isHot: Boolean,         // Voucher hot
  isVipOnly: Boolean      // Chỉ cho VIP
}
```

### 2. VoucherUsage Model
```javascript
{
  userId: ObjectId,       // User sử dụng
  voucherId: ObjectId,    // Voucher được sử dụng
  orderId: ObjectId,      // Order sử dụng voucher
  usedAt: Date           // Thời gian sử dụng
}
```

### 3. Order Model
```javascript
{
  userId: ObjectId,       // User đặt hàng
  items: [{               // Danh sách khóa học
    courseId: ObjectId,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,    // Tổng tiền gốc
  discountAmount: Number, // Số tiền giảm
  finalAmount: Number,    // Tổng tiền cuối
  voucherId: ObjectId,    // Voucher sử dụng
  status: String,         // 'pending' | 'paid' | 'cancelled' | 'refunded'
  paymentMethod: String,  // 'cod' | 'bank_transfer' | 'credit_card'
  paymentStatus: String,  // 'pending' | 'paid' | 'failed'
  shippingAddress: {      // Địa chỉ giao hàng
    fullName: String,
    phone: String,
    address: String,
    city: String,
    district: String,
    ward: String
  },
  notes: String          // Ghi chú
}
```

## API Endpoints

### Voucher APIs

#### 1. GET /api/vouchers
**Mô tả:** Lấy tất cả voucher (admin)
**Auth:** Cần (Bearer token)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "code": "WELCOME50",
      "title": "Giảm 50% cho người mới",
      "discountType": "percentage",
      "discountValue": 50,
      "usedCount": 234,
      "usageLimit": 1000
    }
  ]
}
```

#### 2. GET /api/vouchers/available
**Mô tả:** Lấy voucher khả dụng (client)
**Auth:** Không cần
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "code": "WELCOME50",
      "isValid": true,
      "status": "available",
      "statusMessage": "Có thể sử dụng"
    }
  ]
}
```

#### 3. POST /api/vouchers/validate
**Mô tả:** Kiểm tra voucher có thể sử dụng
**Auth:** Cần (Bearer token)
**Body:**
```json
{
  "code": "WELCOME50",
  "orderAmount": 200000
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "voucher": {
      "id": "...",
      "code": "WELCOME50",
      "discountType": "percentage",
      "discountValue": 50
    },
    "discountAmount": 100000,
    "finalAmount": 100000
  }
}
```

### Order APIs

#### 1. POST /api/orders
**Mô tả:** Tạo đơn hàng mới
**Auth:** Cần (Bearer token)
**Body:**
```json
{
  "items": [
    {
      "courseId": "...",
      "quantity": 1
    }
  ],
  "voucherCode": "WELCOME50",
  "paymentMethod": "cod",
  "shippingAddress": {
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789",
    "address": "123 Đường ABC",
    "city": "hcm",
    "district": "district1",
    "ward": "ward1"
  },
  "notes": "Ghi chú đơn hàng"
}
```

#### 2. GET /api/orders
**Mô tả:** Lấy danh sách đơn hàng của user
**Auth:** Cần (Bearer token)
**Query:** `?page=1&limit=10&status=pending`

#### 3. GET /api/orders/:id
**Mô tả:** Lấy chi tiết đơn hàng
**Auth:** Cần (Bearer token)

#### 4. PUT /api/orders/:id/cancel
**Mô tả:** Hủy đơn hàng
**Auth:** Cần (Bearer token)

## Luồng Sử dụng

### 1. User xem voucher trên Homepage
```javascript
// Frontend: Homepage.tsx
const [vouchers, setVouchers] = useState([]);

useEffect(() => {
  const fetchVouchers = async () => {
    try {
      const response = await voucherService.getAvailable();
      setVouchers(response.data);
    } catch (error) {
      // Fallback to mock data
    }
  };
  fetchVouchers();
}, []);
```

### 2. User thêm khóa học vào cart
```javascript
// Frontend: CourseDetailPage.tsx
const handleAddToCart = async () => {
  try {
    await cartService.addToCart(courseId, token);
    message.success('Đã thêm vào giỏ hàng');
  } catch (error) {
    message.error('Lỗi khi thêm vào giỏ hàng');
  }
};
```

### 3. User áp dụng voucher trong cart
```javascript
// Frontend: CartPage.tsx
const handleApplyVoucher = async () => {
  try {
    const orderAmount = selectedItems.reduce((acc, item) => 
      acc + item.priceAtAddition * item.quantity, 0
    );
    
    const validation = await voucherService.validate(
      { code: voucherCode, orderAmount },
      token
    );
    
    setVoucherValidation(validation);
    message.success('Áp dụng voucher thành công');
  } catch (error) {
    message.error(error.response?.data?.message);
  }
};
```

### 4. User checkout với voucher
```javascript
// Frontend: CheckoutPage.tsx
const handleSubmit = async (values) => {
  try {
    const orderData = {
      items: checkoutData.items,
      voucherCode: checkoutData.voucherCode,
      paymentMethod: values.paymentMethod,
      shippingAddress: {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        city: values.city,
        district: values.district,
        ward: values.ward
      },
      notes: values.notes
    };

    const response = await orderService.createOrder(orderData, token);
    setOrderSuccess(true);
    setOrderId(response.order.id);
  } catch (error) {
    message.error(error.message);
  }
};
```

### 5. Backend xử lý tạo order
```javascript
// Backend: order.controller.js
static async createOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Tính toán tổng tiền
    let totalAmount = 0;
    for (const item of items) {
      const course = await Course.findById(item.courseId);
      const finalPrice = course.price * (1 - course.discount / 100);
      totalAmount += finalPrice * item.quantity;
    }

    // 2. Xử lý voucher
    let discountAmount = 0;
    let voucherId = null;
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode });
      if (voucher && isVoucherValid(voucher)) {
        // Tính discount
        if (voucher.discountType === 'percentage') {
          discountAmount = (totalAmount * voucher.discountValue) / 100;
          if (voucher.maxDiscount > 0) {
            discountAmount = Math.min(discountAmount, voucher.maxDiscount);
          }
        } else {
          discountAmount = voucher.discountValue;
        }
        voucherId = voucher._id;
      }
    }

    // 3. Tạo order
    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      totalAmount,
      discountAmount,
      finalAmount: totalAmount - discountAmount,
      voucherId,
      paymentMethod: values.paymentMethod,
      shippingAddress: values.shippingAddress
    });

    await order.save({ session });

    // 4. Tạo voucher usage record
    if (voucherId) {
      const voucherUsage = new VoucherUsage({
        userId: req.user.id,
        voucherId,
        orderId: order._id
      });
      await voucherUsage.save({ session });
      
      // Cập nhật số lượt sử dụng
      await Voucher.findByIdAndUpdate(voucherId, {
        $inc: { usedCount: 1 }
      }, { session });
    }

    // 5. Xóa items khỏi cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = cart.items.filter(item => 
        !items.map(i => i.courseId).includes(item.course.toString())
      );
      await cart.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json({ success: true, data: { order } });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  }
}
```

## Cách chạy và test

### 1. Khởi động Backend
```bash
cd backend
node server.js
```

### 2. Khởi động Frontend
```bash
cd frontend
npm run dev
```

### 3. Test API
```bash
cd backend
node test-complete-voucher-flow.js
```

### 4. Test Frontend
1. Truy cập http://localhost:5173
2. Đăng ký/đăng nhập
3. Thêm khóa học vào cart
4. Áp dụng voucher trong cart
5. Checkout và tạo order
6. Xem order history tại /profile/orders

## Validation Rules

### Voucher Validation
1. **Thời gian:** `startDate <= now <= endDate`
2. **Số lượt sử dụng:** `usedCount < usageLimit`
3. **Đơn hàng tối thiểu:** `orderAmount >= minOrderValue`
4. **User chưa sử dụng:** Kiểm tra VoucherUsage
5. **Voucher tồn tại:** Kiểm tra code

### Order Validation
1. **Items không rỗng:** Phải có ít nhất 1 khóa học
2. **Khóa học tồn tại:** Kiểm tra courseId
3. **User đã đăng nhập:** Kiểm tra token
4. **Voucher hợp lệ:** Nếu có voucherCode

## Error Handling

### Common Errors
- `400`: Dữ liệu không hợp lệ
- `401`: Chưa đăng nhập
- `404`: Không tìm thấy resource
- `409`: Voucher đã được sử dụng
- `500`: Lỗi server

### Error Messages
```javascript
// Voucher errors
"Vui lòng nhập mã giảm giá"
"Mã giảm giá không tồn tại"
"Voucher đã hết hạn"
"Đơn hàng tối thiểu 100,000đ để sử dụng voucher này"
"Bạn đã sử dụng voucher này rồi"

// Order errors
"Giỏ hàng trống"
"Khóa học không tồn tại"
"Vui lòng đăng nhập để thanh toán"
```

## Security Features

1. **Authentication:** Tất cả API đều yêu cầu token
2. **Authorization:** Kiểm tra quyền truy cập
3. **Input Validation:** Validate dữ liệu đầu vào
4. **Transaction:** Sử dụng MongoDB transaction
5. **Rate Limiting:** Giới hạn số request
6. **SQL Injection Protection:** Sử dụng Mongoose

## Performance Optimization

1. **Indexing:** Tạo index cho các field thường query
2. **Pagination:** Phân trang cho danh sách
3. **Caching:** Cache voucher data
4. **Lazy Loading:** Load data khi cần
5. **Compression:** Nén response

## Monitoring & Logging

1. **Error Logging:** Log tất cả errors
2. **API Logging:** Log API calls
3. **Performance Monitoring:** Monitor response time
4. **Usage Analytics:** Track voucher usage
5. **Order Analytics:** Track order metrics

## Future Enhancements

1. **Bulk Operations:** Bulk create/update vouchers
2. **Advanced Filtering:** Filter by date, category, etc.
3. **Email Notifications:** Notify users about orders
4. **Payment Integration:** Integrate payment gateways
5. **Analytics Dashboard:** Admin analytics
6. **Mobile App:** React Native app
7. **Webhook Support:** External integrations
8. **Multi-language:** Internationalization 