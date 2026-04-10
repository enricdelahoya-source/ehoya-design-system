import React from "react"
import ReactDOM from "react-dom/client"
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"
import CasesPage from "./cases/list/CasesListPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/playground" replace />,
  },
  {
    path: "/playground",
    element: <App />,
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
