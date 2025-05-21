# EduPro Frontend

## Công nghệ và Thư viện sử dụng

### 1. UI Framework và Components
- **Ant Design** (@ant-design/icons, antd)
  - UI component library chính
  - Cung cấp các components đẹp, responsive và dễ tùy chỉnh
  - Version: ^5.0.0
  - Icons: ^5.0.0

- **Material-UI** (@mui/material, @mui/icons-material)
  - Framework UI components bổ sung
  - Cung cấp thêm các components đẹp và responsive
  - Version: ^5.12.1

- **Emotion** (@emotion/react, @emotion/styled)
  - CSS-in-JS styling solution
  - Cho phép viết CSS trực tiếp trong JavaScript/TypeScript
  - Version: ^11.10.6

### 2. State Management
- **Redux Toolkit** (@reduxjs/toolkit)
  - State management chính của ứng dụng
  - Cung cấp các tools để quản lý state hiệu quả
  - Version: ^1.9.5

- **React Redux** (react-redux)
  - Redux bindings cho React
  - Kết nối React components với Redux store
  - Version: ^8.0.5

### 3. Routing
- **React Router** (react-router-dom)
  - Client-side routing
  - Quản lý navigation và routing trong ứng dụng
  - Version: ^6.11.1

### 4. Form Handling
- **Formik**
  - Form management
  - Giúp xử lý form dễ dàng hơn
  - Version: ^2.2.9

- **Yup**
  - Form validation
  - Schema validation cho forms
  - Version: ^1.1.1

### 5. HTTP Client
- **Axios**
  - HTTP client cho API requests
  - Xử lý các request đến backend
  - Version: ^1.3.6

### 6. Core Libraries
- **React** (react, react-dom)
  - Core React library
  - Version: ^18.2.0

- **TypeScript**
  - Type checking và development
  - Cung cấp type safety cho ứng dụng
  - Version: ^4.9.5

- **React Scripts**
  - Development scripts và configuration
  - Version: ^5.0.1

### 7. Testing
- **Jest** (@testing-library/jest-dom)
  - Testing framework
  - Version: ^5.16.5

- **React Testing Library** (@testing-library/react)
  - Testing utilities cho React components
  - Version: ^13.4.0

- **User Event Testing** (@testing-library/user-event)
  - Testing user interactions
  - Version: ^13.5.0

### 8. Development Tools
- **TypeScript Types** (@types/*)
  - Type definitions cho các thư viện
  - Bao gồm: @types/jest, @types/node, @types/react, @types/react-dom

- **Web Vitals**
  - Performance monitoring
  - Theo dõi và đo lường hiệu suất ứng dụng
  - Version: ^2.1.4

## Scripts

```bash
# Khởi chạy development server
npm start

# Build cho production
npm run build

# Chạy tests
npm test

# Eject từ create-react-app
npm run eject
```

## Cấu trúc thư mục

```
frontend/
├── public/          # Static files
├── src/             # Source code
│   ├── assets/      # Images, styles, etc.
│   ├── components/  # Reusable components
│   ├── config/      # Configuration files
│   ├── hooks/       # Custom hooks
│   ├── pages/       # Page components
│   ├── redux/       # Redux store, slices
│   ├── services/    # API services
│   ├── types/       # TypeScript types
│   └── utils/       # Utility functions
└── package.json     # Dependencies và scripts
```

## Yêu cầu hệ thống

- Node.js (version >= 14.0.0)
- npm (version >= 6.0.0)

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Khởi chạy development server
npm start
```

## Browser Support

Ứng dụng hỗ trợ các trình duyệt sau:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest) 