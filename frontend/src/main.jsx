import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './pages/App.jsx';
import AdminRoute from './pages/AdminRoute.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {/* Hidden admin path – change as desired */}
        <Route path="/aetherium" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
