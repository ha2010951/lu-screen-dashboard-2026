import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  IconButton,
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
      }}
    >
      <Toolbar>
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
          <Typography variant="h6">
            LU Screen Dashboard
          </Typography>

          <Typography
            variant="caption"
            sx={{ opacity: 0.8 }}
          >
            IT Screen Monitoring and Control
          </Typography>
        </Box>

        <Typography variant="body2">
          IT Staff
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
