import { createBrowserRouter } from "react-router-dom";
import Layouts from "@/components/layouts";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layouts />,
  }
])

export default router;