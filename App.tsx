
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';

const App: React.FC = () => {
      return (
            <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth/signup" element={<Auth type="register" />} />
                  <Route path="/auth/login" element={<Auth type="login" />} />
                  <Route path="/auth/profile" element={<Auth type="profile" />} />
            </Routes>
      );
};

export default App;
