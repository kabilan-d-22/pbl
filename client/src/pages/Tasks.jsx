import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Container,
  Card,
  Tooltip,
  useTheme,
  alpha,
  Grid
} from '@mui/material';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

import { taskAPI, userAPI } from '../services/api';

const Tasks = () => {
  const theme = useTheme();
  const { isHead } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Medium',
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tasksRes = await taskAPI.getTasks();
      setTasks(tasksRes.data);

      if (isHead) {
        const usersRes = await userAPI.getUsers();
        setUsers(usersRes.data.filter(u => u.role === 'User'));
      }
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleDescription = (taskId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      description: '',
      category: 'General',
      priority: 'Medium',
      assignedTo: '',
      dueDate: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.createTask(formData);
      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await taskAPI.completeTask(taskId);
      fetchData();
    } catch {
      setError('Failed to complete task');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskAPI.deleteTask(taskId);
        fetchData();
      } catch {
        setError('Failed to delete task');
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const search = searchTerm.toLowerCase();
    return (
      (task.title?.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search)) &&
      (filterStatus === 'All' || task.status === filterStatus) &&
      (filterPriority === 'All' || task.priority === filterPriority)
    );
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return theme.palette.error.main;
      case 'Medium': return theme.palette.warning.main;
      case 'Low': return theme.palette.success.main;
      default: return theme.palette.text.secondary;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Task Management</Typography>
          <Typography color="text.secondary">
            Organize and track your tasks
          </Typography>
        </Box>
        {isHead && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Create Task
          </Button>
        )}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Table */}
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="center">Description</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTasks.length > 0 ? filteredTasks.map(task => (
              <TableRow key={task.id} hover>

                {/* Title */}
                <TableCell>
                  <Typography fontWeight="bold">{task.title}</Typography>
                </TableCell>

                <TableCell> <Typography variant="body2"> {task.assigned_to?.name || 'Unassigned'} </Typography> </TableCell>

                {/* 🔥 Improved Description */}
                <TableCell align="center">
                  {task.description ? (
                    <Box
                      sx={{
                        maxWidth: 280,
                        mx: "auto",
                        textAlign: "left",
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: expandedDescriptions[task.id] ? "none" : 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          color: "text.secondary"
                        }}
                      >
                        {task.description}
                      </Typography>

                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          size="small"
                          onClick={() => toggleDescription(task.id)}
                          endIcon={
                            expandedDescriptions[task.id]
                              ? <ExpandLessIcon />
                              : <ExpandMoreIcon />
                          }
                          sx={{ textTransform: "none", fontSize: "0.75rem" }}
                        >
                          {expandedDescriptions[task.id] ? "Show less" : "Read more"}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.disabled">No description</Typography>
                  )}
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <Typography color={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Typography>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Chip
                    label={task.status}
                    color={task.status === 'Completed' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>

                {/* Due */}
                <TableCell>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : 'No deadline'}
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  {!isHead && task.status === 'Pending' && (
                    <IconButton onClick={() => handleComplete(task.id)} color="success">
                      <CheckIcon />
                    </IconButton>
                  )}
                  {isHead && (
                    <IconButton onClick={() => handleDelete(task.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>

              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Create Task</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>

            <TextField fullWidth label="Title" name="title" onChange={handleChange} required />
            <TextField fullWidth label="Description" name="description" multiline rows={3} onChange={handleChange} />

            <TextField select fullWidth label="Priority" name="priority" onChange={handleChange}>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>

            <TextField select fullWidth label="Assign To" name="assignedTo" onChange={handleChange}>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
              ))}
            </TextField>

            <TextField type="date" fullWidth name="dueDate" onChange={handleChange} />

          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

    </Container>
  );
};

export default Tasks;