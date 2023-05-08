import {
  FC,
  useEffect,
} from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  BofangIcon,
  ZantingIcon,
  ShangyishouIcon,
  XiayishouIcon,
  AixinIcon,
} from '@/components/icons'
import {
  useGlobalColor,
  useMusicInfo,
} from '@/store'
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
  const { color } = useGlobalColor();
  const {playing, setPlaying} = useMusicInfo();

  useEffect(() => {
    if(location.pathname === '/') {
      navigate('/indexPage')
    }
  }, [location.pathname]);

  return (
    <div className={styles.layouts}>
      <Outlet />
      <div className="footer" onClick={() => navigate('/musicPlayer')}>
        <div className="process" style={{ background: color }} />
        <div className='bar'>
          <div className="b-left">
            <AixinIcon />
          </div>
          <div className="b-center">
            <ShangyishouIcon style={{ color }} />
            {playing
              ? <ZantingIcon style={{ color, fontSize: 38 }} onClick={() => setPlaying(!playing)}/>
              : <BofangIcon style={{ color, fontSize: 38 }} onClick={() => setPlaying(!playing)}/>
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