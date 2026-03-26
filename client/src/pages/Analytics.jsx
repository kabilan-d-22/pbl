import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Container,
  Divider,
  useTheme,
  alpha,
  Stack,
  TextField,
  Button,
  Avatar
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as CompleteIcon,
  PendingActions as PendingIcon,
  TrendingUp as ProductivityIcon,
  PieChart as StatusIcon,
  BarChart as CategoryIcon,
  Timeline as TrendIcon,
  Group as TeamIcon,
  SmartToy as AIIcon,
  Send as SendIcon
} from '@mui/icons-material';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, CartesianGrid
} from 'recharts';
import { analyticsAPI, aiAPI } from '../services/api'; // Ensure aiAPI is exported from api.js

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, value, icon, color }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* LEFT SIDE (TEXT) */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>

        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </Box>

      {/* RIGHT SIDE (ICON) */}
      <Box
        sx={{
          backgroundColor: color,
          color: '#fff',
          borderRadius: '50%',
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
    </Paper>
  );
};

const ChartWrapper = ({ title, subtitle, icon, children }) => (
  <Card sx={{ width: '100%', mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
    <CardHeader
      avatar={<Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>}
      title={<Typography variant="h6" fontWeight="bold">{title}</Typography>}
      subheader={subtitle}
      sx={{ pb: 0 }}
    />
    <CardContent sx={{ pt: 3 }}>
      <Box sx={{ width: '100%', height: 400 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

const Analytics = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const { isHead } = useAuth(); // Check if the user is a Head
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const userId = searchParams.get('userId');

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (isHead && !userId) {
        const response = await analyticsAPI.getTeamAnalytics();
        setAnalytics(response.data);
      } else {
        const response = await analyticsAPI.getUserAnalytics(userId);
        setAnalytics(response.data);
      }
    } catch (err) {
      setError('Failed to load analytics engine');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim() || !isHead) return;

    setAiLoading(true);
    try {
      const response = await aiAPI.askAssistant(aiQuery);
      setAiResponse(response.data.answer);
    } catch (err) {
      setAiResponse("I'm sorry, I couldn't process that request right now.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={50} thickness={5} />
          <Typography color="text.secondary">Analyzing data...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="error" variant="filled">{error}</Alert>
      </Container>
    );
  }

  const isTeamView = isHead && !userId;

  const pieData = [
    { name: 'Completed', value: analytics.completedTasks },
    { name: 'Pending', value: analytics.pendingTasks }
  ];

  const categoryData = Object.entries(analytics.categoryStats || {}).map(([category, stats]) => ({
    category,
    total: stats.total,
    completed: stats.completed,
    highTotal: stats.highTotal,
    highCompleted: stats.highCompleted,
    mediumTotal: stats.mediumTotal,
    mediumCompleted: stats.mediumCompleted,
    lowTotal: stats.lowTotal,
    lowCompleted: stats.lowCompleted
  }));

  const trendData = Object.entries(analytics.completionTrend || {}).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count: count
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h3" fontWeight="900" gutterBottom>
            {isTeamView ? 'Team Insights' : 'Progress'}
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="400">
            Visualizing performance and task distribution metrics.
          </Typography>
        </Box>
      </Box>

      {/* Gemini AI Assistant Section - ONLY FOR HEADS */}
      {isHead && (
        <Card sx={{ mb: 6, borderRadius: 3, border: `1px dashed ${theme.palette.primary.main}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><AIIcon /></Avatar>}
            title={<Typography variant="h6" fontWeight="bold">AI Team Assistant</Typography>}
            subheader="Ask me to analyze your team's workload or suggest improvements."
          />
          <CardContent>
            <Box component="form" onSubmit={handleAskAI} sx={{ display: 'flex', gap: 2, mb: aiResponse ? 3 : 0 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ex: Who has the most pending tasks? or How is our productivity trend?"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                disabled={aiLoading}
              />
              <Button
                variant="contained"
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                startIcon={aiLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              >
                Analyze
              </Button>
            </Box>

            {aiResponse && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="bold">Gemini Analysis:</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{aiResponse}</Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Row */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Task Load" value={analytics.totalTasks} icon={<TaskIcon />} color={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Finished" value={analytics.completedTasks} icon={<CompleteIcon />} color={theme.palette.success.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="In Progress" value={analytics.pendingTasks} icon={<PendingIcon />} color={theme.palette.warning.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Productivity" value={`${analytics.productivity}%`} icon={<ProductivityIcon />} color={theme.palette.secondary.main} />
        </Grid>
      </Grid>

      {/* Charts */}
      <Box>
        <ChartWrapper title="Task Status Distribution" subtitle="Percentage of tasks completed vs pending" icon={<StatusIcon />}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={100} outerRadius={140} paddingAngle={8} dataKey="value" animationDuration={1500}>
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: theme.shadows[3] }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Tasks by Category" subtitle="Workload distribution across different areas" icon={<CategoryIcon />}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
              <XAxis dataKey="category" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }} />
              <Legend />

              {/* Existing Bars */}
              <Bar dataKey="total" fill="#9e9e9e" name="Total Tasks" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill={theme.palette.success.main} name="Total Completed" radius={[4, 4, 0, 0]} />

              {/* High Priority Bars */}
              <Bar dataKey="highTotal" fill="#ff1744" name="High Priority Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highCompleted" fill="#b2102f" name="High Priority Done" radius={[4, 4, 0, 0]} />

              {/* Medium Priority Bars */}
              <Bar dataKey="mediumTotal" fill="#ff9800" name="Medium Priority Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mediumCompleted" fill="#b26a00" name="Medium Priority Done" radius={[4, 4, 0, 0]} />

              {/* Low Priority Bars */}
              <Bar dataKey="lowTotal" fill="#2196f3" name="Low Priority Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lowCompleted" fill="#145ea8" name="Low Priority Done" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Task Completion Trend" subtitle="Daily output and velocity over time" icon={<TrendIcon />}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: theme.shadows[3] }} />
              <Area type="monotone" dataKey="count" stroke={theme.palette.success.main} strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" name="Tasks Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {analytics.tasksPerUser && (
          <ChartWrapper title="Team Performance Overview" subtitle="Efficiency and output per team member" icon={<TeamIcon />}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.tasksPerUser} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: theme.shadows[3] }} />
                <Legend />
                <Bar dataKey="completed" fill={theme.palette.success.main} radius={[0, 6, 6, 0]} name="Completed" />
                <Bar dataKey="pending" fill={theme.palette.warning.main} radius={[0, 6, 6, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </Box>
    </Container>
  );
};

export default Analytics;