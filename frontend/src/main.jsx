import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

import { store } from './store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
); 