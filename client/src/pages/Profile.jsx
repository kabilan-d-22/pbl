import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Avatar,
  Container,
  Stack,
  useTheme,
  alpha,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Security as RoleIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { groupAPI } from '../services/api';

const InfoRow = ({ icon, label, value, color, secondaryAction }) => {
  const theme = useTheme();
  return (
    <Box display="flex" alignItems="center" gap={2} mb={3}>
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 2, 
        bgcolor: alpha(color || theme.palette.primary.main, 0.1),
        color: color || theme.palette.primary.main,
        display: 'flex'
      }}>
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" fontWeight="500">
            {value}
          </Typography>
          {secondaryAction}
        </Box>
      </Box>
    </Box>
  );
};

const Profile = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);

  useEffect(() => {
    fetchGroup();
  }, []);

  const fetchGroup = async () => {
    try {
      const response = await groupAPI.getGroup();
      setGroup(response.data);
    } catch (err) {
      console.error('Failed to load group');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header Hero */}
      <Box sx={{ 
        mb: 5, 
        p: 4, 
        borderRadius: 4, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        boxShadow: `0 10px 30px -10px ${alpha(theme.palette.primary.main, 0.5)}`,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: 3
      }}>
        <Avatar 
          sx={{ 
            width: 100, 
            height: 100, 
            bgcolor: alpha('#fff', 0.2), 
            border: '4px solid rgba(255,255,255,0.3)',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box textAlign={{ xs: 'center', sm: 'left' }}>
          <Typography variant="h4" fontWeight="800">
            {user?.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <Chip 
              icon={<RoleIcon sx={{ color: 'inherit !important', fontSize: '1rem' }} />}
              label={user?.role} 
              sx={{ 
                bgcolor: alpha('#fff', 0.2), 
                color: 'white', 
                fontWeight: 'bold',
                backdropFilter: 'blur(4px)'
              }} 
            />
            {group && (
              <Chip 
                label={group.group_name} 
                variant="outlined" 
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} 
              />
            )}
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Personal Details Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                Account Information
              </Typography>
              
              <InfoRow 
                icon={<PersonIcon />} 
                label="Full Name" 
                value={user?.name} 
              />
              <InfoRow 
                icon={<EmailIcon />} 
                label="Email Address" 
                value={user?.email} 
              />
              <InfoRow 
                icon={<RoleIcon />} 
                label="Permissions Level" 
                value={user?.role === 'Head' ? 'Group Administrator' : 'Standard User'}
                color={user?.role === 'Head' ? theme.palette.secondary.main : theme.palette.info.main}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Group Management Card */}
        {group && (
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
                  Team Workspace
                </Typography>

                <InfoRow 
                  icon={<GroupIcon />} 
                  label="Assigned Group" 
                  value={group.group_name} 
                />

                {user?.role === 'Head' && (
                  <Box sx={{ 
                    mt: 2, 
                    mb: 4, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                    border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`
                  }}>
                    <Typography variant="caption" color="warning.main" fontWeight="bold" display="flex" alignItems="center" gap={0.5} sx={{ mb: 1 }}>
                      <InfoIcon sx={{ fontSize: '1rem' }} /> MANAGEMENT ACCESS
                    </Typography>
                    <InfoRow 
                      icon={<RoleIcon />} 
                      label="Security PIN" 
                      value={group.group_pin}
                      color={theme.palette.warning.main}
                      secondaryAction={
                        <Tooltip title="Copy PIN">
                          <IconButton size="small" onClick={() => copyToClipboard(group.group_pin)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      Provide this PIN to new members so they can join this workspace.
                    </Typography>
                  </Box>
                )}

                <InfoRow 
                  icon={<CalendarIcon />} 
                  label="Member Since" 
                  value={new Date(group.created_at).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} 
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Profile;