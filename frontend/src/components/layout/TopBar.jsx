import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import {
  AppBar,
  Badge,
  Box,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useThemeMode } from "../../context/ThemeModeContext";

function TopBar({ onMenuClick }) {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary.dark,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ minHeight: 68 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.3 }}>
            Lusail University
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.78 }}>
            Smart Classroom Screen Management System
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge color="error" variant="dot">
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Chip
            icon={<AccountCircleOutlinedIcon />}
            label="IT Staff"
            sx={{
              color: "white",
              backgroundColor: "rgba(255,255,255,0.12)",
              fontWeight: 600,
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;