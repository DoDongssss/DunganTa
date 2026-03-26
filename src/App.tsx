import { GuestRoute, ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AuthPage from '@/pages/auth/authPage';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {

  return (
    <Router>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* more protected routes */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App
