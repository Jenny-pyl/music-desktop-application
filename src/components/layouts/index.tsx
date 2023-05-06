import { FC, useMemo, useState } from 'react'
import {
  Menu,
  Button,
  Space,
  Input,
  Avatar,
  MenuProps,
  Dropdown,
} from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  CaretRightOutlined,
  CheckOutlined,
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
import { menuItems, themeItems } from '@/constants'
import { useGlobalColor } from '@/store'
import { getLocalItem } from '@/utils'
import styles from './index.module.scss'

export type UserInfo = {
  id: string;
  username: string;
  imgUrl: string;
  age: number;
  gender: 0 | 1;
  isVip: boolean;
  level: number;
}

const { Search } = Input;

const Layouts: FC = () => {
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false)
  const { color, setColor } = useGlobalColor()
  const userInfo: UserInfo | null = getLocalItem('userInfo')

  const menuItemClick: MenuProps['onClick'] = (e) => {
    const pathname = Number.isInteger(+e.keyPath[0]) ? `/myCreate/${e.key}` : e.key;
    navigate(pathname);
  }

  const loginRedirect = () => {
    navigate('/login')
  }

  const skinItems = useMemo(() => themeItems!.map(({ label, key }) => ({
    label: <div className='skin-item'>
      <div
        className='dot'
        style={{ background: key }}
        onClick={() => setColor(key)}
      >{ color === key ? <CheckOutlined /> : null}</div>
      <div>{label}</div>
    </div>,
    key
  })), [themeItems, color]);

  return (
    <div className={styles.layouts}>
      <div className="header" style={{ background: color}}>
        <div className="h-left">
          <Space>
            <LeftOutlined />
            <RightOutlined />
          </Space>
        </div>
        <div className="h-right">
          <Search className='search' />
          <ShezhiIcon className='setting' />
          <Dropdown
            overlayClassName='skin-menu'
            menu={{ items: skinItems }}
            arrow
          >
            <PifuIcon />
          </Dropdown>
        </div>
      </div>
      <div className="middle">
        <div className="sider">
          <div className="avator">
            {
              userInfo ? (<div className='a-content'>
                <Avatar size="large" icon={<UserOutlined />} src={userInfo.imgUrl} />
                <span className='word'>{userInfo.username}</span>
                <CaretRightOutlined className='right-arrow'/>
              </div>) : (<div className='a-content' onClick={loginRedirect}>
                <Avatar size="large" icon={<UserOutlined />} />
                <span className='word'>未登录</span>
                <CaretRightOutlined className='right-arrow'/>
              </div>)
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
        <div className="process" style={{ background: color}}/>
        <div className='bar'>
          <div className="b-left">
            <AixinIcon />
          </div>
          <div className="b-center">
            <ShangyishouIcon style={{ color }} />
            {isPlaying
              ? <ZantingIcon style={{ color, fontSize: 38 }} />
              : <BofangIcon style={{ color, fontSize: 38 }} />
            }
            <XiayishouIcon style={{ color }} />
          </div>
          <div className="b-right"></div>
        </div>
      </div>
    </div>
  )
}

export default Layouts