
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { HomePage } from "@/routes/home.page";


const router = createBrowserRouter([
  {
    path: "*",
    element: <HomePage />,
  },
]);


export const Routes = () => {
  return <RouterProvider router={router} />;
};
