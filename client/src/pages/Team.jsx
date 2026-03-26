import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { userAPI, groupAPI, analyticsAPI } from '../services/api';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [group, setGroup] = useState(null);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, groupRes, analyticsRes] = await Promise.all([
        userAPI.getUsers(),
        groupAPI.getGroup(),
        analyticsAPI.getTeamAnalytics()
      ]);

      setUsers(usersRes.data.filter(u => u.role === 'User'));
      setGroup(groupRes.data);

      const stats = {};
      analyticsRes.data.tasksPerUser.forEach(user => {
        stats[user.userId] = user;
      });
      setUserStats(stats);
    } catch (err) {
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(group.group_pin);
    setSuccess('Group PIN copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await userAPI.deleteUser(userId);
        setSuccess('Team member removed successfully');
        fetchData();
      } catch (err) {
        setError('Failed to remove team member');
      }
    }
  };

  const handleViewUser = (userId) => {
    navigate(`/analytics?userId=${userId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Team Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {group && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Group Information
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <Typography variant="body1">
                <strong>Group Name:</strong> {group.group_name}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <Typography variant="body1">
                <strong>Group PIN:</strong> {group.group_pin}
              </Typography>
              <IconButton
                size="small"
                color="primary"
                onClick={handleCopyPin}
                title="Copy PIN"
              >
                <CopyIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Share this PIN with team members so they can join your group
            </Typography>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Total Tasks</TableCell>
              <TableCell align="center">Completed</TableCell>
              <TableCell align="center">Pending</TableCell>
              <TableCell align="center">Completion Rate</TableCell>
              <TableCell align="center">Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => {
                const stats = userStats[user.id] || { total: 0, completed: 0, pending: 0, completionRate: 0 };
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="center">{stats.total}</TableCell>
                    <TableCell align="center">{stats.completed}</TableCell>
                    <TableCell align="center">{stats.pending}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${stats.completionRate}%`}
                        size="small"
                        color={
                          stats.completionRate >= 70 ? 'success' :
                          stats.completionRate >= 40 ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewUser(user.id)}
                        title="View dashboard"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Remove user"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No team members yet. Share your group PIN to invite members.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Team;
