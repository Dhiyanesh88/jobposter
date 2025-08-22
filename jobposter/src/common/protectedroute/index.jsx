import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import apiEndpoints from '../../apiconfig';
import { ShieldAlert, Clock, LogOut, Handshake } from 'lucide-react';

const ProtectedRoute = () => {
  const [isValidToken, setIsValidToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(30);

  // Separate refs for Token validation and idle timers
  const tokenValidationRef = React.useRef(null);
  const idleTimeoutRef = React.useRef(null);
  const idleCountdownRef = React.useRef(null);

  // Function to validate Token
  const validateToken = async () => {
   
    const token = sessionStorage.getItem('token');
    if (!token) {
      setIsValidToken(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiEndpoints.validateToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        if (data.new_token) {
          sessionStorage.setItem('token', data.new_token);
        }
        setIsValidToken(true);
      } else {
        clearSessionAndRedirect();
      }
    } catch (error) {
      console.error('token validation error:', error);
      clearSessionAndRedirect();
    } finally {
      setIsLoading(false);
    }
  };

  const clearSessionAndRedirect = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setIsValidToken(false);
    clearAllTimers();
  };

  const clearAllTimers = () => {
    if (tokenValidationRef.current !== null) clearInterval(tokenValidationRef.current);
    if (idleTimeoutRef.current !== null) clearTimeout(idleTimeoutRef.current);
    if (idleCountdownRef.current !== null) clearInterval(idleCountdownRef.current);
  };

  // Idle timeout functions
  const resetIdleTimer = () => {
    // Clear existing idle timers
    if (idleTimeoutRef.current !== null) clearTimeout(idleTimeoutRef.current);
    if (idleCountdownRef.current !== null) clearInterval(idleCountdownRef.current);

    setShowIdleModal(false);
    setIdleCountdown(30);

    // Set new idle timeout (1 minute)
    idleTimeoutRef.current = setTimeout(() => {
      setShowIdleModal(true);

      // Start countdown (30 seconds)
      idleCountdownRef.current = setInterval(() => {
        setIdleCountdown(prev => {
          if (prev <= 1) {
            clearSessionAndRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 900000); // 15 minutes
  };

  const handleStayLoggedIn = () => {
    resetIdleTimer();
  };

  const handleSignOut = () => {
    clearSessionAndRedirect();
  };

  useEffect(() => {
    const events = ['keypress', 'scroll', 'touchstart'];

    const handleUserActivity = () => {
      if (isValidToken) {
        resetIdleTimer();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isValidToken]);

  // Initial setup and cleanup
  useEffect(() => {
    validateToken();
    tokenValidationRef.current = setInterval(validateToken, 15000);

    // Set up initial idle timer
    if (isValidToken) {
      resetIdleTimer();
    }

    return () => {
      clearAllTimers();
    };
  }, [isValidToken]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Checking authentication...</div>
      </div>
    );
  }

  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Outlet />
      {showIdleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            width: '420px',
            maxWidth: '90%',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
          }}>
            <div style={{
              backgroundColor: '#E0F2FE',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldAlert size={24} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1E3A8A' }}>Session Timeout Warning</h3>
            </div>

            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Clock size={40} color="#2563eb" />
              <p style={{ margin: '20px 0', color: '#334155' }}>
                You've been idle for a while. You will be logged out in <b>{idleCountdown}</b> seconds.
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button
                  onClick={handleStayLoggedIn}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <Handshake size={18} /> Stay Logged In
                </button>
                <button
                  onClick={handleSignOut}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProtectedRoute;