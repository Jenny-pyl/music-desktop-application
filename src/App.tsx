import { useState } from 'react'
import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import router from './routes/router'
import Layouts from '@/components/layouts'
import styles from 'styles/app.module.scss'

const App: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#73d13d',
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </div>
  )
}

export default App
