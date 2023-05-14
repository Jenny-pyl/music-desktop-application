import type { MenuProps } from 'antd';
import {
  YinYue1Icon,
  XiazaiIcon,
  AixinIcon,
  ShoucangIcon,
} from '@/components/icons';

export const menuItems: MenuProps['items'] = [
  {
    key: '/findMusic',
    label: '发现音乐',
    icon: <YinYue1Icon />,
  },
  {
    key: '/myCollect',
    label: '收藏',
    icon: <ShoucangIcon />,
  },
  { type: 'divider' },
  {
    key: '/download',
    label: '下载',
    icon: <XiazaiIcon />,
  },
  {
    key: '/myPrefer',
    label: '我喜欢的音乐',
    icon: <AixinIcon />,
  },
  { type: 'divider' },
]

export const themeItems: {label: string, key: string}[] = [
  {
    label: '绿',
    key: '#73d13d',
  },
  {
    label: '橙',
    key: '#ff7a45',
  },
  {
    label: '黄',
    key: '#ffc53d',
  },
  {
    label: '玫',
    key: '#f759ab',
  },
  {
    label: '紫',
    key: '#9254de',
  }
]