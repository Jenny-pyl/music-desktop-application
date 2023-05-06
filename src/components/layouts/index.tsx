import {
  FC,
  useMemo,
  useState,
} from 'react'
import {
  Outlet,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import {
  type MenuProps,
  Avatar,
  Dropdown,
  Input,
  Menu,
  Space,
  message,
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
import { menuItems, themeItems } from '@/constants'
import {
  useGlobalColor,
  useUserStore,
  useSearch,
} from '@/store'
import { search as searchQQ } from '@/fetch-music/qq'
import styles from './index.module.scss'

const { Search } = Input

const Layouts: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();
  const { color, setColor } = useGlobalColor();
  const {
    loading,
    setLoading,
    setData,
  } = useSearch();
  const [isPlaying, setIsPlaying] = useState(false);

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
      >{color === key ? <CheckOutlined /> : null}</div>
      <div>{label}</div>
    </div>,
    key
  })), [themeItems, color]);

  const searchMusic = async (value: string) => {
    if (!value) {
      message.warning('请输入关键词搜索 ^_^');
      return;
    }
    if (location.pathname !== '/search') {
      navigate('/search')
    }

    setLoading(true);
    setData(await searchQQ({ keywords: value }));
    setLoading(false);
  };

  return (
    <div className={styles.layouts}>
      <div className="header d-flex" style={{ background: color }}>
        <div className="h-left d-flex">
          <div className='flex-fill app-drag' />
          <Space>
            <LeftOutlined />
            <RightOutlined />
          </Space>
        </div>
        <div className="h-right d-flex align-items-center">
          <div className='flex-fill h-100 app-drag' />
          <Search
            placeholder='歌名、歌手'
            loading={loading}
            className='search'
            onSearch={searchMusic}
          />
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
              user ? (<Space>
                <Avatar size="large" icon={<UserOutlined />} src={user.imgUrl} />
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
        <div className="process" style={{ background: color }} />
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