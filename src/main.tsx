import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import router from './routes/router'
import './ipc'

import './main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#73d13d',
      },
    }}
  >
    <RouterProvider router={router} />
  </ConfigProvider>
)

postMessage({ payload: 'removeLoading' }, '*')
