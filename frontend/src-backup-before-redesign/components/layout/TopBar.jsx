import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import {
  AppBar,
  Box,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

function TopBar({ onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#0b2f57",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Toolbar sx={{ minHeight: 68 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{
            mr: 2,
            display: { md: "none" },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ letterSpacing: 0.3 }}
          >
            Lusail University
          </Typography>

          <Typography
            variant="caption"
            sx={{ opacity: 0.78 }}
          >
            Smart Classroom Screen Management System
          </Typography>
        </Box>

        <Chip
          icon={<AccountCircleOutlinedIcon />}
          label="IT Staff"
          sx={{
            color: "white",
            backgroundColor: "rgba(255,255,255,0.12)",
            fontWeight: 600,
            "& .MuiChip-icon": {
              color: "white",
            },
          }}
        />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
