import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import router from './routes/router'
import { useGlobalColor } from './store'
import './ipc'

import 'antd/dist/reset.css'
import './main.scss'

const RootNode = () => {
  const { color } = useGlobalColor();
  // const color = '#73d13d'
  return (
    <ConfigProvider
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
