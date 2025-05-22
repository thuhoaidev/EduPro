# EduPro Frontend

Frontend cho nền tảng học trực tuyến EduPro, được xây dựng với React, TypeScript và Material-UI.

## Công nghệ sử dụng

### Core
- React 18
- TypeScript
- Redux Toolkit (State Management)
- React Router v6 (Routing)
- Material-UI v5 (UI Components)

### Development Tools
- ESLint (Code Linting)
- Prettier (Code Formatting)
- SASS (Styling)
- Jest & React Testing Library (Testing)

## Yêu cầu hệ thống

- Node.js (version >= 14.0.0)
- npm (version >= 6.0.0)

## Cài đặt

```bash
# Clone repository
git clone [repository-url]

# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Cấu hình các biến môi trường trong .env
# REACT_APP_API_URL=http://localhost:5000/api
# ...

# Khởi chạy development server
npm start
```

## Cấu trúc thư mục

```
frontend/
├── public/                     # Static files
├── src/
│   ├── assets/                # Images, icons, styles
│   │   ├── common/           # Basic components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature-specific components
│   ├── config/               # App configuration
│   ├── hooks/                # Custom hooks
│   ├── interfaces/           # TypeScript interfaces
│   ├── pages/                # Page components
│   ├── services/             # API services
│   ├── store/                # Redux store
│   ├── utils/                # Utility functions
│   ├── App.tsx              # Root component
│   └── index.tsx            # Entry point
```

## Scripts

```bash
# Khởi chạy development server
npm start

# Build cho production
npm run build

# Chạy tests
npm test

# Kiểm tra linting
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm run format
```

## Tính năng chính

- Đăng nhập/Đăng ký
- Quản lý khóa học
- Học trực tuyến
- Quản lý profile
- Thanh toán
- Đánh giá và bình luận
- Thông báo
- Tìm kiếm và lọc khóa học

## Quy ước code

- Sử dụng TypeScript cho type safety
- Tuân thủ ESLint rules
- Format code với Prettier
- Sử dụng functional components và hooks
- Tách biệt logic và UI
- Sử dụng Redux cho state management
- Viết test cho các components quan trọng

## API Integration

Frontend giao tiếp với backend thông qua REST API. Các endpoints chính:

- Authentication: /api/auth/*
- Users: /api/users/*
- Courses: /api/courses/*
- Orders: /api/orders/*
- Lessons: /api/lessons/*

## Deployment

```bash
# Build cho production
npm run build

# Kiểm tra build locally
serve -s build
```

## Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

[MIT License](LICENSE) 