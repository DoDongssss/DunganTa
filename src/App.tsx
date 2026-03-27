import { GuestRoute, ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AuthPage from '@/pages/auth/authPage';
import AuthCallbackPage from '@/pages/auth/authCallbackPage';
import {BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/guest/homePage';

function App() {

  return (
    <Router>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/home" element={<ProtectedRoute />}>
          <Route index element={<HomePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  )
}

export default App
