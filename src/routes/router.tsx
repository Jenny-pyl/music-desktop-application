import { createBrowserRouter } from "react-router-dom";
import Layouts from "@/components/layouts";
import FindMusic from "@/pages/findMusic";
import PersonalFM from "@/pages/personalFM";
import Singer from "@/pages/singer";
import Download from "@/pages/download";
import MyPrefer from "@/pages/myPrefer";
import MyCollect from "@/pages/myCollect";
import MyCreate from "@/pages/myCreate";
import Login from "@/pages/login";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layouts />,
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
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  }
])

export default router;