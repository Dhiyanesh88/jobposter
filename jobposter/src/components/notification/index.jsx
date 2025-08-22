import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Badge,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Person,
  Message,
  Settings,
  Notifications as NotificationIcon,
  MoreVert,
  MarkEmailRead,
  Delete,
  FilterList,
  CheckCircle
} from '@mui/icons-material';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const menuRef = useRef(null);
  const menuContainerRef = useRef(null);


  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'application',
      title: 'New Application Received',
      message: 'Sarah Johnson applied for Senior React Developer position',
      time: '2 minutes ago',
      isRead: false,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      color: '#2563eb'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'Mike Chen sent you a message about the Full Stack Developer role',
      time: '15 minutes ago',
      isRead: false,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      color: '#059669'
    },
    {
      id: 3,
      type: 'application',
      title: 'Application Withdrawn',
      message: 'John Smith withdrew his application for UI/UX Designer position',
      time: '1 hour ago',
      isRead: true,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      color: '#dc2626'
    },
    {
      id: 4,
      type: 'system',
      title: 'Job Posted Successfully',
      message: 'Your job "Mobile App Developer" has been published and is now live',
      time: '2 hours ago',
      isRead: true,
      color: '#7c3aed'
    },
    {
      id: 5,
      type: 'application',
      title: 'New Application Received',
      message: 'Emily Davis applied for Mobile App Developer position',
      time: '3 hours ago',
      isRead: false,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      color: '#2563eb'
    },
    {
      id: 6,
      type: 'system',
      title: 'Payment Processed',
      message: 'Payment of $5,000 has been processed for completed project',
      time: '1 day ago',
      isRead: true,
      color: '#059669'
    },
    {
      id: 7,
      type: 'message',
      title: 'New Message',
      message: 'Alex Johnson replied to your message about project requirements',
      time: '1 day ago',
      isRead: true,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      color: '#059669'
    },
    {
      id: 8,
      type: 'application',
      title: 'Application Status Update',
      message: 'Lisa Wong updated her application for Senior React Developer',
      time: '2 days ago',
      isRead: true,
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150',
      color: '#2563eb'
    }
  ]);

  useEffect(() => {
    if (!menuOpen) return;

    const appRoot = document.getElementById("root");
    if (!appRoot) return;

    const handleScroll = () => {
      setMenuOpen(false);
    };

    appRoot.addEventListener("scroll", handleScroll, true);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      appRoot.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menuOpen, selectedNotification]);


  const categories = [
    { label: 'All', count: notifications.length },
    { label: 'Applications', count: notifications.filter(n => n.type === 'application').length },
    { label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
    { label: 'System', count: notifications.filter(n => n.type === 'system').length }
  ];

  const getFilteredNotifications = () => {
    if (activeTab === 0) return notifications;

    const typeMap = {
      1: 'application',
      2: 'message',
      3: 'system'
    };

    return notifications.filter(notification =>
      notification.type === typeMap[activeTab]
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case 'application': return <Person />;
      case 'message': return <Message />;
      case 'system': return <Settings />;
      default: return <NotificationIcon />;
    }
  };

  const handleTabChange = (event, newValue) => { setActiveTab(newValue); };

  const handleMenuOpen = useCallback((event, notification) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    let container = event.currentTarget.closest(".notifications-container");
    if (!container) container = document.body;

    const containerRect = container.getBoundingClientRect();
    if (!containerRect) return;

    menuContainerRef.current = container;
    setMenuPosition({
      top: buttonRect.top - containerRect.top + 30,
      left: buttonRect.left - containerRect.left - 160,
    });
    setSelectedNotification({
      ...notification,
      buttonRef: event.currentTarget
    }
    );
    setMenuOpen(true);
  }, []);

  const handleMenuClose = () => {
    setMenuOpen(false);
    setSelectedNotification(null);
  };

  const handleClickOutside = useCallback((event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      handleMenuClose();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
    if (selectedNotification) {
      showSnackbar(`Marked "${selectedNotification.title}" as read`, 'success');
    }
    handleMenuClose();
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    if (selectedNotification) {
      showSnackbar(`Deleted "${selectedNotification.title}"`, 'info');
    }
    handleMenuClose();
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
    showSnackbar('All notifications marked as read', 'success');
  };

  const NotificationItem = ({ notification }) => (
    <ListItem
      sx={{
        padding: { xs: '12px 16px', sm: '16px 20px' },
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: notification.isRead ? 'transparent' : '#fefbff',
        borderLeft: notification.isRead ? 'none' : `4px solid ${notification.color}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: '#f8fafc'
        }
      }}
    >
      <ListItemAvatar>
        {notification.avatar ? (
          <Avatar
            src={notification.avatar}
            alt="User"
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 }
            }}
          />
        ) : (
          <Avatar
            sx={{
              backgroundColor: notification.color,
              color: 'white',
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 }
            }}
          >
            {getIcon(notification.type)}
          </Avatar>
        )}
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: notification.isRead ? 500 : 700,
                color: '#1f2937',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                lineHeight: 1.4,
                flex: 1
              }}
            >
              {notification.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              {!notification.isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: notification.color,
                    flexShrink: 0
                  }}
                />
              )}
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, notification)}
                sx={{
                  padding: '4px',
                  color: '#9ca3af',
                  '&:hover': {
                    color: '#6b7280',
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                marginBottom: '8px',
                lineHeight: 1.4,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {notification.message}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#9ca3af',
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                }}
              >
                {notification.time}
              </Typography>
              <Chip
                label={notification.type}
                size="small"
                sx={{
                  backgroundColor: `${notification.color}15`,
                  color: notification.color,
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                  height: { xs: 18, sm: 20 },
                  textTransform: 'capitalize',
                  fontWeight: 500,
                  '& .MuiChip-label': {
                    padding: { xs: '0 6px', sm: '0 8px' }
                  }
                }}
              />
            </Box>
          </Box>
        }
      />
    </ListItem>
  );

  return (
    <Container
      sx={{
        ml: { xs: 0, sm: '10px' },
        px: { xs: 0, sm: 2 },
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 3 },
          marginBottom: 2,
          flexShrink: 0,
          width: '100%',

        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 1,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
            }}
          >
            Notifications
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Stay updated with your job postings and applications
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flexShrink: 0 }}>
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={markAllAsRead}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#2563eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              padding: { xs: '6px 12px', sm: '8px 16px' },
              '&:hover': {
                backgroundColor: '#1d4ed8',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Mark All Read
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Mark All
            </Box>
          </Button>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#d1d5db',
              color: '#374151',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              padding: { xs: '6px 12px', sm: '8px 16px' },
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      {/* Notification Card */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            backgroundColor: 'white',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            width: '100%',
          }}
        >
          {/* Tabs */}
          <Box
            sx={{
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              flexShrink: 0
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                padding: { xs: '0 8px', sm: '0 15px' },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  color: '#6b7280',
                  '&.Mui-selected': {
                    color: '#2563eb'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#2563eb',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {categories.map((category, index) => (
                <Tab
                  key={category.label}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {category.label}
                      {category.count > 0 && (
                        <Badge
                          badgeContent={category.count}
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: activeTab === index ? '#dbeafe' : '#f3f4f6',
                              color: activeTab === index ? '#1d4ed8' : '#6b7280',
                              fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                              height: { xs: 16, sm: 18 },
                              minWidth: { xs: 16, sm: 18 },
                              fontWeight: 700
                            }
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Notifications List */}
          <Box sx={{
            flexGrow: 1,
            overflowY: 'auto',
            maxHeight: {
              xs: '63vh',   // mobile
              sm: '70vh',   // tablet
              md: '67vh',   // laptop
              lg: '78vh',   // desktop
              xl: '100vh'    // big screens
            },
          }}>
            <List sx={{ padding: 0 }}>
              {getFilteredNotifications().length > 0 ? (
                getFilteredNotifications().map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: { xs: '40px 20px', sm: '60px 20px' },
                    textAlign: 'center',
                    flexGrow: "1 1 auto",
                    variant: "scrollable"
                  }}
                >
                  <NotificationIcon
                    sx={{
                      fontSize: { xs: 48, sm: 64 },
                      color: '#d1d5db',
                      marginBottom: 2
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#6b7280',
                      marginBottom: 1,
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      fontWeight: 600
                    }}
                  >
                    No notifications
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#9ca3af',
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                    }}
                  >
                    You're all caught up! Check back later for updates.
                  </Typography>
                </Box>
              )}
            </List>
          </Box>

        </Paper>
      </Box>

      {/* Context Menu */}
      <div className="notifications-container">
        {menuOpen && selectedNotification && ReactDOM.createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              zIndex: 2000,
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              minWidth: '180px'
            }}
          >
            {!selectedNotification.isRead && (
              <div
                onClick={() => markAsRead(selectedNotification.id)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <MarkEmailRead style={{ marginRight: '12px', fontSize: '18px', color: '#059669' }} />
                Mark as Read
              </div>
            )}
            <div
              onClick={() => deleteNotification(selectedNotification.id)}
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Delete style={{ marginRight: '12px', fontSize: '18px' }} />
              Delete
            </div>
          </div>,
          menuContainerRef.current || document.body
        )}

      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            borderRadius: 2,
            fontWeight: 500
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Notifications;