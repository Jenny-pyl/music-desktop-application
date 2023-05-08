import { createHashRouter } from "react-router-dom";
import Layouts from "@/components/layouts";
import FindMusic from "@/pages/findMusic";
import PersonalFM from "@/pages/personalFM";
import Singer from "@/pages/singer";
import Download from "@/pages/download";
import MyPrefer from "@/pages/myPrefer";
import MyCollect from "@/pages/myCollect";
import MyCreate from "@/pages/myCreate";
import Login from "@/pages/login";
import Search from "@/pages/search";
import PlayList from "@/pages/playList";
import IndexPage from "@/pages/indexPage";
import MusicPlayer from "@/pages/musicPlayer";

const router = createHashRouter([
  {
    path: '/',
    element: <Layouts />,
    children: [
      {
        path: 'indexPage',
        element: <IndexPage />,
        children: [
          {
            path: 'findMusic',
            element: <FindMusic />
          },
          {
            path: 'personalFM',
            element: <PersonalFM />
          },
          {
            path: 'singer',
            element: <Singer />
          },
          {
            path: 'download',
            element: <Download />
          },
          {
            path: 'myPrefer',
            element: <MyPrefer />
          },
          {
            path: 'myCollect',
            element: <MyCollect />
          },
          {
            path: 'myCreate/:id',
            element: <MyCreate />,
          },
          {
            path: 'search',
            element: <Search />,
          },
          {
            path: 'playList',
            element: <PlayList />,
          },
        ],
      },
      {
        path: 'musicPlayer',
        element: <MusicPlayer />
      },
    ],
  },
  {
    path: '/login',
    element: <Login />
  }
])

export default router;