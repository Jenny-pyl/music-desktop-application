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
  Modal,
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
  ShezhiIcon,
  PifuIcon,
  LiebiaoIcon,
} from '@/components/icons'
import { FooterController } from '@/components/song/controller'
import { useGlobalColor } from '@/store'
import CreateListModal from './components/createListModal'
import { menuItems, themeItems } from '@/constants'
import { SongSearch } from '@/pages/search'
import { locaStorage } from '@/utils'
import { ROUTER_PATH } from '@/routes/router'
import { useSongList } from '@/hooks/use-songList';

import styles from './index.module.scss'

export type UserInfo = {
  id: number;
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
  const userInfo = locaStorage.get<UserInfo | null>('userInfo');
  const [activeMenuKey, setActiveMenuKey] = useState<string>(ROUTER_PATH.home);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  // 避免按钮不适用主题色
  const [modal, contextHolder] = Modal.useModal();
  const [songList] = useSongList(userInfo?.id);

  const menuItemClick: MenuProps['onClick'] = (e) => {
    const pathname = Number.isInteger(+e.keyPath[0]) ? `/myCreate/${e.key}` : e.key;
    setActiveMenuKey(e.key)
    navigate(`${pathname}`);
  }

  const loginRedirect = () => {
    navigate('/login')
  }

  const handleCreate = () => {
    if (!userInfo?.id) {
      modal.confirm({
        title: '您还未登录',
        content: '确定跳转至登录页面',
        onOk() {
          navigate('/login')
        },
      })
    } else {
      setModalOpen(true)
    }
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
          <Dropdown
            overlayClassName='skin-menu'
            menu={{ items: skinItems }}
            arrow
          >
            <PifuIcon style={{ marginLeft: 10}}/>
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
                <PlusOutlined onClick={() => handleCreate()} />
              </div>),
              key: 'myCreate',
              type: 'group',
              children: songList?.map((item) => ({
                key: item.listId,
                label: item.listName,
                icon: <LiebiaoIcon />,
              }))
            }]}
            onClick={menuItemClick}
            selectedKeys={activeMenuKey ? [activeMenuKey] : undefined}
          />
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
      <div className="footer">
        <FooterController />
      </div>
      <CreateListModal modalOpen={modalOpen} setModalOpen={setModalOpen}/>
      {contextHolder}
    </div>
  )
}

export default Layouts