import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContext from './context/AuthContext.jsx'
import UserContext from './context/UserContext.jsx'
import AdminContext from './context/AdminContext.jsx'
import ShopContext from './context/ShopContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthContext>
      <UserContext>
        <AdminContext>
          <ShopContext>
            <App />
          </ShopContext>
        </AdminContext>
      </UserContext>
    </AuthContext>
  </BrowserRouter>
)
