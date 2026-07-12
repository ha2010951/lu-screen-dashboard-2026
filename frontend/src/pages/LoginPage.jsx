import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Enter both username and password.");
      return;
    }

    if (username === "admin" && password === "admin123") {
      login("temporary-demo-jwt-token");
      navigate(destination, { replace: true });
      return;
    }

    setError("Invalid username or password.");
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        backgroundColor: "grey.100",
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Lusail University
              </Typography>

              <Typography color="text.secondary">
                Smart Screen Management Dashboard
              </Typography>
            </Box>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
            >
              Sign In
            </Button>

            <Alert severity="info">
              Demo login: admin / admin123
            </Alert>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
