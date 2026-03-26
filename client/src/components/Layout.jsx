import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Switch,
  Avatar,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Assignment as TaskIcon,
  BarChart as AnalyticsIcon,
  Group as TeamIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const Layout = ({ children, darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isHead } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
    ...(isHead ? [{ text: 'Team', icon: <TeamIcon />, path: '/team' }] : []),
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: [2, 3], mb: 2 }}>
        <Typography 
          variant="h5" 
          fontWeight="800" 
          color="primary" 
          sx={{ letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1 }} />
          TaskAnalytics
        </Typography>
      </Toolbar>

      {/* Profile Section */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Box sx={{ 
          p: 2, 
          borderRadius: 3, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          textAlign: 'center'
        }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              margin: '0 auto', 
              mb: 1.5, 
              bgcolor: 'primary.main',
              boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.4)}`
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="700">{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
            {user?.role}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ px: 2, flexGrow: 1 }}>
        <List sx={{ pt: 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) }
                    },
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'primary.main' : 'text.secondary',
                      minWidth: 40
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontWeight: isActive ? '700' : '500' }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Actions */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <List sx={{ pt: 0 }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton onClick={toggleDarkMode} sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {darkMode ? <LightModeIcon color="warning" /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText primary={darkMode ? "Light" : "Dark"} />
              <Switch size="small" checked={darkMode} onChange={toggleDarkMode} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout}
              sx={{ 
                borderRadius: 2, 
                color: 'error.main',
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar
        elevation={0} // Force remove shadow
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(8px)',
          borderBottom: 'none !important', // Strictly remove the top horizontal line
          boxShadow: 'none !important',
          color: theme.palette.text.primary
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="700">
              {menuItems.find(item => item.path === location.pathname)?.text || 'Application'}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
             <Tooltip title={user?.name}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'primary.main',
                    cursor: 'pointer' 
                  }}
                  onClick={() => navigate('/profile')}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
             </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              border: 'none !important' // Strictly remove lines
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH,
              borderRight: 'none !important', // Strictly remove the vertical line
              bgcolor: 'background.paper',
              boxShadow: 'none !important'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;