import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Profile from './pages/Profile';

function App() {
  // ✅ Load saved theme
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  // ✅ Save theme on change
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: { main: '#1976d2' },
          secondary: { main: '#dc004e' }
        }
      }),
    [darkMode]
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* REMOVED: /dashboard route */}
            
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Tasks />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute requireHead={true}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Team />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* UPDATED: Redirect to /analytics instead of /dashboard */}
            <Route path="/" element={<Navigate to="/analytics" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;