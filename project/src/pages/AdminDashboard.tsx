import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  CardActions,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  MenuBook as ChapterIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const dashboardItems = [
    {
      title: 'User Management',
      description: 'Manage teachers, students, and administrators',
      icon: <PeopleIcon fontSize="large" color="primary" />,
      path: '/admin/users'
    },
    {
      title: 'Content Management',
      description: 'Manage educational content and activities',
      icon: <BookIcon fontSize="large" color="primary" />,
      path: '/admin/content'
    },
    {
      title: 'Chapter Management',
      description: 'Release chapters and control content availability',
      icon: <ChapterIcon fontSize="large" color="primary" />,
      path: '/admin/chapters'
    },
    {
      title: 'Learning Progress',
      description: 'Monitor student progress and analytics',
      icon: <TimelineIcon fontSize="large" color="primary" />,
      path: '/admin/progress'
    },
    {
      title: 'School Management',
      description: 'Manage schools, classes, and enrollments',
      icon: <SchoolIcon fontSize="large" color="primary" />,
      path: '/admin/schools'
    },
    {
      title: 'Reports & Analytics',
      description: 'View usage statistics and performance metrics',
      icon: <AssessmentIcon fontSize="large" color="primary" />,
      path: '/admin/reports'
    },
    {
      title: 'System Settings',
      description: 'Configure application settings',
      icon: <SettingsIcon fontSize="large" color="primary" />,
      path: '/admin/settings'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1">
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage the learning platform and user accounts
            </Typography>
          </Box>
          <IconButton 
            onClick={handleLogout} 
            color="inherit"
            aria-label="logout"
            sx={{
              p: 1.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <LogoutIcon color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
              Logout
            </Typography>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Grid container spacing={3}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              variant="outlined" 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {item.icon}
                  <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
                    {item.title}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate(item.path)}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/admin/users/new')}
          >
            Add New User
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate('/admin/content/new')}
          >
            Create Content
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => navigate('/admin/reports')}
          >
            View Reports
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => navigate('/admin/portal')}
          >
            View Admin Dashboard
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => navigate('/admin/chapters')}
          >
            Manage Chapters
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
