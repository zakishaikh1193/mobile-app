import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/adminAPI';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';

type Role = 'admin' | 'teacher' | 'parent';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'admin' as Role
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminFlow, setIsAdminFlow] = useState(false);
  const [maxChildren, setMaxChildren] = useState(3); // Default to 3 children for parents
  const { user, register, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're in admin user creation flow
  useEffect(() => {
    console.log('RegisterPage - Auth loading:', authLoading, 'User:', user);
    
    // Don't process until auth is loaded
    if (authLoading) return;
    
    const isAdmin = user?.role === 'admin';
    console.log('RegisterPage - Is admin:', isAdmin);
    setIsAdminFlow(isAdmin);
    
    // If not admin and trying to access admin route, redirect
    if (location.pathname.startsWith('/admin/') && !isAdmin && user) {
      console.log('RegisterPage - Not an admin, redirecting to login');
      navigate('/login');
    }
  }, [user, authLoading, location.pathname, navigate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent<Role>) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value as Role
    }));
  };

  const handleMaxChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setMaxChildren(Math.max(1, Math.min(10, value))); // Limit between 1 and 10
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      if (isAdminFlow) {
        // Use admin API to create user
        const userData: any = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName
        };

        // Add max_children for parents
        if (formData.role === 'parent') {
          userData.maxChildren = maxChildren;
          console.log('Parent max_children:', userData.maxChildren);
        }

        console.log('Creating user with data:', userData);
        const result = await adminAPI.createUser(userData);
        console.log('User created successfully:', result);
        
        // Show success message and redirect to admin dashboard
        alert(`${formData.role} user created successfully!`);
        navigate('/admin/dashboard');
      } else {
        // Regular user registration
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        // Navigation is handled in the AuthContext after successful registration
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to create account';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        console.error('Server error:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
        console.error('No response:', error.request);
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error occurred';
        console.error('Error:', error.message);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {isAdminFlow ? 'Create New User Account' : 'Create New Account'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Box>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </Select>
            </FormControl>
            
            {isAdminFlow && formData.role === 'parent' && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="maxChildren"
                label="Maximum Children Allowed"
                name="maxChildren"
                type="number"
                inputProps={{ min: 1, max: 10 }}
                value={maxChildren}
                onChange={handleMaxChildrenChange}
                helperText="Enter the maximum number of children this parent can create (1-10)"
              />
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" color="primary">
                Sign in
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;
