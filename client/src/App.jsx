import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import PhysioDashboard from './pages/PhysioDashboard';
import PatientDetailPage from './pages/PatientDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/physio/dashboard" element={<PhysioDashboard />} />
        <Route path="/physio/patients/:id" element={<PatientDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
