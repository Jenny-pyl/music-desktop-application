import { FC, useState } from 'react'
import {
  Menu,
  Button,
  Space,
  Input,
  Avatar,
  MenuProps,
} from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  CaretRightOutlined,
} from '@ant-design/icons'
import {
  ShezhiIcon,
  PifuIcon,
  BofangIcon,
  ZantingIcon,
  ShangyishouIcon,
  XiayishouIcon,
  AixinIcon,
} from '@/components/icons'
import { Outlet, useNavigate } from "react-router-dom"
import { menuItems } from '@/constants'
import { useUserStore } from '@/store';
import styles from './index.module.scss'

const { Search } = Input;

const Layouts: FC = () => {
  const { user } = useUserStore()
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const menuItemClick: MenuProps['onClick'] = (e) => {
    const pathname = Number.isInteger(+e.keyPath[0]) ? `/myCreate/${e.key}` : e.key;
    navigate(pathname);
  }

  const loginRedirect = () => {
    navigate('/login')
  }

  console.log('user', user);

  return (
    <div className={styles.layouts}>
      <div className="header">
        <div className="h-left">
          <Space>
            <LeftOutlined />
            <RightOutlined />
          </Space>
        </div>
        <div className="h-right">
          <Space>
            <Search />
            <ShezhiIcon />
            <PifuIcon />
          </Space>
        </div>
      </div>
      <div className="middle">
        <div className="sider">
          <div className="avator">
            {
              user ? (<Space>
                <Avatar size="large" icon={<UserOutlined />} src={user.imgUrl}/>
                <span>{user.username}</span>
                <CaretRightOutlined /> 
              </Space>) : (<Space onClick={loginRedirect}>
                <Avatar size="large" icon={<UserOutlined />} />
                <span>未登录</span>
                <CaretRightOutlined />
              </Space>)
            }
          </div>
          <Menu
            items={menuItems}
            onClick={menuItemClick}
          />
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
      <div className="footer">
        <div className="process"></div>
        <div className='bar'>
          <div className="b-left">
            <AixinIcon />
          </div>
          <div className="b-center">
            <ShangyishouIcon style={{ color: '#389e0d' }} />
            {isPlaying
              ? <ZantingIcon style={{ color: '#389e0d', fontSize: 38 }} />
              : <BofangIcon style={{ color: '#389e0d', fontSize: 38 }} />
            }
            <XiayishouIcon style={{ color: '#389e0d' }} />
          </div>
          <div className="b-right"></div>
        </div>
      </div>
    </div>
  )
}

export default Layouts