import type { MenuProps } from 'antd';
import {
  YinYue1Icon,
  ShouyinjiIcon,
  GuanzhuIcon,
  XiazaiIcon,
  AixinIcon,
  ShoucangIcon,
  YinyueIcon,
  LiebiaoIcon,
} from '@/components/icons';

export const menuItems: MenuProps['items'] = [
  {
    key: '/findMusic',
    label: '发现音乐',
    icon: <YinYue1Icon />,
  },
  {
    key: '/personalFM',
    label: '私人电台',
    icon: <ShouyinjiIcon />,
  },
  {
    key: '/singer',
    label: '歌手',
    icon: <GuanzhuIcon />,
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
  {
    key: '/myCollect',
    label: '我的收藏',
    icon: <ShoucangIcon />,
  },
  { type: 'divider' },
  {
    label: '我创建的歌单',
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
  }
]