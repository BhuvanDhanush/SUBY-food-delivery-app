import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './suby/context/AuthContext'
import { CartProvider } from './suby/context/CartContext'
import ProtectedRoute from './suby/components/ProtectedRoute'
import LandingPage from './suby/pages/LandingPage'
import ProductMenu from './suby/components/ProductMenu'
import LoginPage from './suby/pages/LoginPage'
import SignupPage from './suby/pages/SignupPage'
import CheckoutPage from './suby/pages/CheckoutPage'
import OrderSuccessPage from './suby/pages/OrderSuccessPage'
import './App.css'

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-shell">
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
            <Route path='/products/:firmId/:firmName' element={<ProductMenu />} />
            <Route
              path='/checkout'
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/order-success/:orderId'
              element={
                <ProtectedRoute>
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
