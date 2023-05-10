import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import zhCN from 'antd/locale/zh_CN';
import router from './routes/router'
import { useGlobalColor } from './store'

import 'antd/dist/reset.css'
import './main.scss'

const RootNode = () => {
  const { color } = useGlobalColor();
  // const color = '#73d13d'
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: color,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<RootNode />)

postMessage({ payload: 'removeLoading' }, '*')
