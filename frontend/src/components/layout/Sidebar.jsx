import {
  DashboardOutlined,
  DescriptionOutlined,
  HistoryOutlined,
  LogoutOutlined,
  TvOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { text: "Dashboard", description: "Screen overview", path: "/", icon: <DashboardOutlined /> },
  { text: "Command Log", description: "Recent screen actions", path: "/commands", icon: <HistoryOutlined /> },
  { text: "Documentation", description: "Help and instructions", path: "/documentation", icon: <DescriptionOutlined /> },
];

function Sidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();

  function handleNavigation(path) {
    navigate(path);
    if (onNavigate) onNavigate();
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Box
      sx={{
        width: 270,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
      }}
    >
      <Toolbar sx={{ minHeight: "68px !important", px: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              backgroundColor: "primary.light",
              color: "primary.main",
            }}
          >
            <TvOutlined />
          </Box>

          <Box>
            <Typography fontWeight={750} color="text.primary">
              Screen Control
            </Typography>
            <Typography variant="caption" color="text.secondary">
              IT Operations
            </Typography>
          </Box>
        </Stack>
      </Toolbar>

      <Divider />

      <Box sx={{ px: 1.5, py: 2 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ px: 1.5, fontWeight: 700, letterSpacing: 1 }}
        >
          Navigation
        </Typography>

        <List sx={{ mt: 0.5 }}>
          {menuItems.map((item) => {
            const selected = location.pathname === item.path;

            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mb: 0.7,
                  px: 1.5,
                  py: 1.2,
                  borderRadius: 2.5,
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    color: "primary.main",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#dcecf9",
                  },
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 42, color: selected ? "primary.main" : "text.secondary" }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.text}
                  secondary={item.description}
                  primaryTypographyProps={{ fontWeight: selected ? 700 : 600, fontSize: "0.95rem" }}
                  secondaryTypographyProps={{ fontSize: "0.72rem" }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            px: 1.5,
            py: 1.2,
            borderRadius: 2.5,
            color: "error.main",
            "&:hover": {
              backgroundColor: theme.palette.mode === "dark" ? "rgba(211,47,47,0.12)" : "#fff1f0",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 42, color: "error.main" }}>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText
            primary="Sign out"
            secondary="End current session"
            primaryTypographyProps={{ fontWeight: 700 }}
            secondaryTypographyProps={{ fontSize: "0.72rem" }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default Sidebar;