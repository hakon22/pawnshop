import { App, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { AppRouter } from '@web/app/router';
import { makeStore } from '@web/store/index';

const store = makeStore();

const routerBasename = (() => {
  const raw = import.meta.env.VITE_BASE_PATH || '/';
  if (raw === '/') {
    return '/';
  }

  return raw.replace(/\/$/, '');
})();

export const AppProviders = () => {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={ruRU}
        modal={{
          centered: true,
        }}
        theme={{
          token: {
            colorPrimary: '#1E3A5F',
            colorSuccess: '#059669',
            colorError: '#DC2626',
            colorBgContainer: '#FFFFFF',
            colorText: '#0F172A',
            colorTextSecondary: '#64748B',
            colorBorder: '#E4E7EB',
            borderRadius: 8,
            fontFamily: '"IBM Plex Sans", sans-serif',
          },
          components: {
            Button: {
              primaryShadow: 'none',
              defaultShadow: 'none',
            },
          },
        }}
      >
        <App>
          <BrowserRouter basename={routerBasename}>
            <AppRouter />
          </BrowserRouter>
        </App>
      </ConfigProvider>
    </Provider>
  );
};
