import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Work,
  Notifications,
  Chat,
  Settings,
  Analytics,
  Logout,
  Person,
} from "@mui/icons-material";
import apiEndpoints from "../../apiconfig";

const Layout = ({ children, showSnackbar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for counts
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Hardcoded user data
  const layoutData = {
    user: {
      name: "John Doe",
      email: "john@company.com",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    menuItems: [
      { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
      { text: "Create Job", icon: <Work />, path: "/create-job" },
      { text: "Notifications", icon: <Notifications />, path: "/notifications" },
      { text: "Messages", icon: <Chat />, path: "/chat" },
      { text: "Analytics", icon: <Analytics />, path: "/analysis" },
      { text: "Settings", icon: <Settings />, path: "/settings" },
    ],
  };

  // Fetch counts on mount and route change
  useEffect(() => {
    fetchCounts();
    
    // Set up interval for periodic updates (every 30 seconds)
    const intervalId = setInterval(fetchCounts, 3000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [location.pathname]);

  const fetchCounts = async () => {
    try {
      await Promise.all([
        fetchUnreadMessagesCount(),
      ]);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${apiEndpoints.send_message}?action=getUnreadCount`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadMessagesCount(data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching unread messages count:", err);
    }
  };
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    showSnackbar("Logged out successfully", "success");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    if (path === "/notifications") {
    }
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div
      style={{
        height: "100%",
        background: "linear-gradient(180deg, #667eea 100%, #1e40af 100%)",
        overflow : "hidden"
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h6"
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: "20px",
          }}
        >
          JobPoster
        </Typography>
      </div>

      <List style={{ padding: "20px 0" }}>
        {layoutData.menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            style={{
              margin: "4px 12px",
              overflowY: "auto",
              borderRadius: "12px",
              backgroundColor:
                location.pathname === item.path
                  ? "rgba(255, 255, 255, 0.15)"
                  : "transparent",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon style={{ color: "white", minWidth: "40px" }}>
              {item.path === "/notifications" ? (
                <Badge badgeContent={notificationCount} color="error">
                  {item.icon}
                </Badge>
              ) : item.path === "/chat" ? (
                <Badge badgeContent={unreadMessagesCount} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              style={{
                color: "white",
                "& .MuiTypography-root": {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" ,width:'100%'}}>
      <AppBar
        position="fixed"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar style={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              style={{
                marginRight: "16px",
                color: "#2563eb",
              }}
            >
              <MenuIcon />
            </IconButton>
            {!isMobile && (
              <Typography
                variant="h6"
                style={{
                  color: "#2563eb",
                  fontWeight: 700,
                }}
              >
                JobPoster Platform
              </Typography>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap="16px">
            <IconButton
              onClick={() => {
                navigate("/notifications");
              }}
              style={{ color: "#64748b" }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton
              onClick={() => navigate("/chat")}
              style={{ color: "#64748b" }}
            >
              <Badge badgeContent={unreadMessagesCount} color="error">
                <Chat />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar
                src={layoutData.user.avatar}
                alt={layoutData.user.name}
                style={{
                  width: "40px",
                  height: "40px",
                  border: "2px solid #e5e7eb",
                }}
              />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        style={{ marginTop: "8px" }}
      >
        <MenuItem
          onClick={() => {
            handleProfileMenuClose();
            navigate("/settings");
          }}
        >
          <Person style={{ marginRight: "12px", color: "#64748b" }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout style={{ marginRight: "12px", color: "#64748b" }} />
          Logout
        </MenuItem>
      </Menu>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        style={{
          width: 280,
          flexShrink: 0,
        }}
        PaperProps={{
          style: {
            width: 280,
            border: "none",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        style={{
          flex: "1 1 auto",
          padding: "clamp(18px,2vh,24px)",
          marginTop: "64px",
          marginLeft: isMobile ? 0 : 0,
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#f8fafc",
          transition: "margin-left 0.3s ease",
          overflowX: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;