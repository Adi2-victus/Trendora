import React, { useContext } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Registration from './pages/Registration'
import Home from './pages/Home'
import Login from './pages/Login'
import Nav from './component/Nav'
import { userDataContext } from './context/UserContext'
import { adminDataContext } from './context/AdminContext'
import About from './pages/About'
import Collections from './pages/Collections'
import Product from './pages/Product'
import Contact from './pages/Contact'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import PlaceOrder from './pages/PlaceOrder'
import Order from './pages/Order'
import { ToastContainer } from 'react-toastify'
import NotFound from './pages/NotFound'
import Ai from './component/Ai'
import AdminHome from './admin/pages/AdminHome'
import AdminAdd from './admin/pages/AdminAdd'
import AdminLists from './admin/pages/AdminLists'
import AdminOrders from './admin/pages/AdminOrders'

function App() {
  let { userData } = useContext(userDataContext)
  let { adminData } = useContext(adminDataContext)
  let location = useLocation()

  return (
    <>
      <ToastContainer />
      {userData && !adminData && <Nav />}
      <Routes>
        <Route path='/login'
          element={
            adminData ? <Navigate to="/admin" /> :
              userData ? <Navigate to={location.state?.from && !location.state?.from.startsWith('/admin') && location.state?.from !== '/login' ? location.state?.from : "/"} /> :
                <Login />
          } />

        <Route path='/signup'
          element={
            adminData ? <Navigate to="/admin" /> :
              userData ? <Navigate to={location.state?.from && !location.state?.from.startsWith('/admin') && location.state?.from !== '/signup' ? location.state?.from : "/"} /> :
                <Registration />
          } />

        <Route path='/admin'
          element={adminData ? <AdminHome /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/admin/add'
          element={adminData ? <AdminAdd /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/admin/lists'
          element={adminData ? <AdminLists /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/admin/orders'
          element={adminData ? <AdminOrders /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/'
          element={userData && !adminData ? <Home /> : adminData ? <Navigate to="/admin" /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/about'
          element={userData && !adminData ? <About /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/collection'
          element={userData && !adminData ? <Collections /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/product'
          element={userData && !adminData ? <Product /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/contact'
          element={userData && !adminData ? <Contact /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/productdetail/:productId'
          element={userData && !adminData ? <ProductDetail /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/cart'
          element={userData && !adminData ? <Cart /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/placeorder'
          element={userData && !adminData ? <PlaceOrder /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='/order'
          element={userData && !adminData ? <Order /> : <Navigate to="/login" state={{ from: location.pathname }} />} />

        <Route path='*' element={<NotFound />} />
      </Routes>
      {userData && !adminData && <Ai />}
    </>
  )
}

export default App
