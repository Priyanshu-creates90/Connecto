import { Button } from './components/ui/button'
import Singup from './components/Singup.jsx'
import Login from './components/Login'
import {createBrowserRouter,RouterProvider } from 'react-router-dom'
import MainLayout from './components/MainLayout'

import Profile from './components/Profile'
import Home from './components/Home'


const browserRouter=createBrowserRouter([
  {
    path: "/",
    element:<MainLayout />,
    children:[
      {
        path:'/',
        element:<Home/>
      },
      {
        path:'/profile',
        element:<Profile />
      },
    ]
  },
      {
        path:'/login',
        element: <Login />
      },
      {
        path:'/singup',
        element: <Singup />
  }
])

function App() {

  return (
    <>
      <RouterProvider router={browserRouter}/>
    </>
  )
}

export default App
