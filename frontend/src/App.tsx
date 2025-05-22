// Component gốc của ứng dụng với routing và Redux
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from '@store/index';
import theme from './theme';

// Components
import Header from '@components/layout/Header';
import ProtectedRoute from '@components/auth/ProtectedRoute';

// Pages
import Login from '@pages/auth/Login';
import Dashboard from '@pages/dashboard/Dashboard';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Header />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect to login if no route matches */}
            <Route path="*" element={<Login />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App; 