import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Snackbar, Alert } from '@mui/material'
import Login from './components/auth/login'
import Register from './components/auth/register'
import ForgotPassword from './components/auth/forgotpassword'
import Dashboard from './components/dashboard'
import CreateEditJob from './components/createeditJob'
import Notifications from './components/notification'
import Chatting from './components/chat'
import Settings from './components/settings'
import Analysis from './components/analysis'
import Layout from '../src/common/layout'
import ProtectedRoute from './common/protectedroute' // Import the ProtectedRoute component
import AnalyticsPage from './components/proposal'

function App() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Router>
        <Routes>
          <Route 
            path="/login" 
            element={<Login showSnackbar={showSnackbar} />}
          />
          <Route 
            path="/register" 
            element={<Register showSnackbar={showSnackbar} />}
          />
          <Route 
            path="/forgot-password" 
            element={<ForgotPassword showSnackbar={showSnackbar} />}
          />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route 
              path="/" 
              element={
                <Layout showSnackbar={showSnackbar}>
                  <Dashboard />
                </Layout>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <Layout showSnackbar={showSnackbar}>
                  <Dashboard />
                </Layout>
              } 
            />
            <Route 
              path="/create-job" 
              element={
                <Layout showSnackbar={showSnackbar}>
                  <CreateEditJob showSnackbar={showSnackbar} />
                </Layout>
              } 
            />
             <Route 
              path="/proposals/:job_guid" 
              element={
                <Layout showSnackbar={showSnackbar}>
                  <AnalyticsPage showSnackbar={showSnackbar} />
                </Layout>
              } 
            />
            <Route 
              path="/edit-job/:id" 
              element={
                <Layout showSnackbar={showSnackbar}>
                  <CreateEditJob showSnackbar={showSnackbar} />
                </Layout>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <Layout showSnackbar={showSnackbar}>
                  <Notifications />
                </Layout>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <Layout showSnackbar={showSnackbar}>
                  <Chatting />
                </Layout>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <Layout showSnackbar={showSnackbar}>
                  <Settings showSnackbar={showSnackbar} />
                </Layout>
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <Layout showSnackbar={showSnackbar}>
                  <Analysis />
                </Layout>
              } 
            />
          </Route>
        </Routes>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          style={{ marginTop: "60px" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
    </Router>
  );
}

export default App;
