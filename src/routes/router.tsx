import { createHashRouter } from "react-router-dom";
import Layouts from "@/components/layouts";
import FindMusic from "@/pages/findMusic";
import MyCollect from "@/pages/myCollect";
import Download from "@/pages/download";
import MyPrefer from "@/pages/myPrefer";
import MyCreate from "@/pages/myCreate";
import Login from "@/pages/login";
import Search from "@/pages/search";
import PlayList from "@/pages/playList";

const router = createHashRouter([
  {
    path: '/',
    element: <Layouts />,
    children: [
      {
        path: 'findMusic',
        element: <FindMusic />
      },
      {
        path: 'myCollect',
        element: <MyCollect />
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
    path: '/login',
    element: <Login />
  }
])

export default router;

export const ROUTER_PATH = {
  home: '/findMusic',
  search: '/search',
  play: '/playList',
};
