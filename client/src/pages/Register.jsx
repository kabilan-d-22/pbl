import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
    groupPin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [generatedPin, setGeneratedPin] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register(formData);

      if (formData.role === 'Head' && response.groupPin) {
        setGeneratedPin(response.groupPin);
        setShowPinDialog(true);
      } else {
        navigate('/analytics');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePinDialogClose = () => {
    setShowPinDialog(false);
    navigate('/analytics');
  };

  return (
    <>
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Task Tracker
            </Typography>
            <Typography variant="h5" gutterBottom align="center" color="text.secondary">
              Register
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="User">User (Team Member)</MenuItem>
                  <MenuItem value="Head">Head (Team Leader)</MenuItem>
                </Select>
              </FormControl>

              {formData.role === 'User' && (
                <TextField
                  fullWidth
                  label="Group PIN"
                  name="groupPin"
                  value={formData.groupPin}
                  onChange={handleChange}
                  margin="normal"
                  required
                  helperText="Enter the 6-digit PIN provided by your team leader"
                />
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>

              <Typography align="center">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                  Login
                </Link>
              </Typography>
            </form>
          </Paper>
        </Box>
      </Container>

      <Dialog open={showPinDialog} onClose={handlePinDialogClose}>
        <DialogTitle>Team Created Successfully!</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your team has been created. Share this PIN with your team members:
          </Typography>
          <Box
            sx={{
              p: 3,
              mt: 2,
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h3" component="div">
              {generatedPin}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Team members will need this PIN to join your group during registration.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePinDialogClose} variant="contained">
            Continue to dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Register;
