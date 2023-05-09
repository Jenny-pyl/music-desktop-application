import {
  FC,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  type MenuProps,
  Avatar,
  Dropdown,
  Menu,
} from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  CaretRightOutlined,
  CheckOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  BofangIcon,
  ZantingIcon,
  ShangyishouIcon,
  XiayishouIcon,
  AixinIcon,
  ShezhiIcon,
  PifuIcon,
  LiebiaoIcon,
} from '@/components/icons'
import CreateListModal from './components/createListModal'
import {
  useGlobalColor,
  useMusicInfo,
} from '@/store'
import { menuItems, themeItems } from '@/constants'
import { SongSearch } from '@/pages/search'
import { locaStorage } from '@/utils'
import { ROUTER_PATH } from '@/routes/router'

import styles from './index.module.scss'

export type UserInfo = {
  id: string;
  username: string;
  avatarUrl: string;
  age: number;
  gender: 0 | 1;
  isVip: boolean;
  level: number;
}

const Layouts: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { color, setColor } = useGlobalColor();
  const { playing, setPlaying } = useMusicInfo();
  const userInfo = locaStorage.get<UserInfo | null>('userInfo');
  const [activeMenuKey, setActiveMenuKey] = useState<string>(ROUTER_PATH.home);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const menuItemClick: MenuProps['onClick'] = (e) => {
    const pathname = Number.isInteger(+e.keyPath[0]) ? `/myCreate/${e.key}` : e.key;
    setActiveMenuKey(e.key)
    navigate(`${pathname}`);
  }

  const loginRedirect = () => {
    navigate('/login')
  }

  const skinItems = useMemo(() => themeItems!.map(({ label, key }) => ({
    label: (
      <div className='skin-item'>
        <div
          className='dot'
          style={{ background: key }}
          onClick={() => setColor(key)}
        >{color === key ? <CheckOutlined /> : null}</div>
        <div>{label}</div>
      </div>
    ),
    key,
  })), [themeItems, color])


  useEffect(() => {
    if (location.pathname === '/') {
      navigate(ROUTER_PATH.home)
    }
    // else if (location.pathname === '/playList') {
    //   setActiveMenuKey(ROUTER_PATH.home)
    // }
  }, [location.pathname]);

  return (
    <div className={styles.layouts}>
      <div className="header d-flex" style={{ background: color }}>
        <div className="h-left d-flex">
          <div className='flex-fill app-drag' />
          <div className='navigate d-flex align-items-center'>
            <LeftOutlined onClick={() => navigate(-1)} />
            <RightOutlined onClick={() => navigate(1)} />
          </div>
        </div>
        <div className="h-right d-flex align-items-center">
          <div className='flex-fill h-100 app-drag' />
          <div className='search'>
            <SongSearch />
          </div>
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
                <Avatar size="large" icon={<UserOutlined />} src={userInfo.avatarUrl} />
                <span className='word'>{userInfo.username}</span>
                <CaretRightOutlined className='right-arrow' />
              </div>) : (<div className='a-content' onClick={loginRedirect}>
                <Avatar size="large" icon={<UserOutlined />} />
                <span className='word'>未登录</span>
                <CaretRightOutlined className='right-arrow' />
              </div>)
            }
          </div>
          <Menu
            items={[...menuItems!, {
              label: (<div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>我创建的歌单</div>
                <PlusOutlined onClick={() => setModalOpen(true)} />
              </div>),
              key: 'myCreate',
              // icon: <LiebiaoIcon />,
              type: 'group',
              children: [
                {
                  key: '1',
                  label: '歌单1',
                  icon: <LiebiaoIcon />,
                },
                {
                  key: '2',
                  label: '歌单2',
                  icon: <LiebiaoIcon />,
                },
              ]
            }]}
            onClick={menuItemClick}
            selectedKeys={activeMenuKey ? [activeMenuKey] : undefined}
          />
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
      <div className="footer" onClick={() => navigate('/musicPlayer')}>
        <div className="process" style={{ background: color }} />
        <div className='bar'>
          <div className="b-left">
            <AixinIcon />
          </div>
          <div className="b-center">
            <ShangyishouIcon style={{ color }} />
            {playing
              ? <ZantingIcon style={{ color, fontSize: 38 }} onClick={() => setPlaying(!playing)} />
              : <BofangIcon style={{ color, fontSize: 38 }} onClick={() => setPlaying(!playing)} />
            }
            <XiayishouIcon style={{ color }} />
          </div>
          <div className="b-right"></div>
        </div>
      </div>
      <CreateListModal modalOpen={modalOpen} setModalOpen={setModalOpen}/>
    </div>
  )
}

export default Layouts