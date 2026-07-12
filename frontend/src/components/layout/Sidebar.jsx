import {
  Dashboard,
  Description,
  History,
  Logout,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  {
    text: "Dashboard",
    path: "/",
    icon: <Dashboard />,
  },
  {
    text: "Command Log",
    path: "/commands",
    icon: <History />,
  },
  {
    text: "Documentation",
    path: "/documentation",
    icon: <Description />,
  },
];

function Sidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleNavigation(path) {
    navigate(path);

    if (onNavigate) {
      onNavigate();
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Box sx={{ width: 260 }}>
      <Toolbar>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Lusail University
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Screen Management
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <List sx={{ px: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: "error.main",
          }}
        >
          <ListItemIcon>
            <Logout color="error" />
          </ListItemIcon>

          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );
}

export default Sidebar;
