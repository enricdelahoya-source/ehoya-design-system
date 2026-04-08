import React from "react"
import ReactDOM from "react-dom/client"
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom"
import "./index.css"
import CasesPage from "./pages/CasesPage"
import PlaygroundPage from "./pages/PlaygroundPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/playground" replace />,
  },
  {
    path: "/playground",
    element: <PlaygroundPage />,
  },
  {
    path: "/cases",
    element: <CasesPage />,
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
