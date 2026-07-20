import TvOutlinedIcon from "@mui/icons-material/TvOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import InputOutlinedIcon from "@mui/icons-material/InputOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

function getStatusDetails(status) {
  const value = String(status || "").toLowerCase();

  if (value === "on" || value === "online") {
    return {
      label: "Online",
      color: "success",
      accent: "#2e7d32",
      background: "#edf8f0",
    };
  }

  if (value === "standby") {
    return {
      label: "Standby",
      color: "warning",
      accent: "#ed6c02",
      background: "#fff7eb",
    };
  }

  if (value === "sleep") {
    return {
      label: "Sleep",
      color: "info",
      accent: "#0288d1",
      background: "#eef8fd",
    };
  }

  return {
    label: "Unavailable",
    color: "default",
    accent: "#7b8794",
    background: "#f4f6f8",
  };
}

function InfoRow({ icon, label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        color="text.secondary"
      >
        {icon}
        <Typography variant="body2">
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        fontWeight={600}
        textAlign="right"
      >
        {value}
      </Typography>
    </Stack>
  );
}

function ClassroomCard({ classroom, onOpen }) {
  const status = getStatusDetails(classroom.status);

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid #dfe7ef",
        boxShadow: "0 8px 24px rgba(28, 55, 90, 0.08)",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 14px 30px rgba(28, 55, 90, 0.14)",
        },
      }}
    >
      <CardActionArea
        onClick={() => onOpen(classroom)}
        sx={{ height: "100%" }}
      >
        <Box
          sx={{
            height: 5,
            backgroundColor: status.accent,
          }}
        />

        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={750}
                  color="#17324d"
                >
                  {classroom.classroom}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {classroom.screenName}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 3,
                  backgroundColor: status.background,
                  color: status.accent,
                }}
              >
                <TvOutlinedIcon />
              </Box>
            </Stack>

            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{
                alignSelf: "flex-start",
                fontWeight: 700,
              }}
            />

            <Divider />

            <Stack spacing={1.6}>
              <InfoRow
                icon={<TvOutlinedIcon fontSize="small" />}
                label="Power"
                value={classroom.power}
              />

              <InfoRow
                icon={<VolumeUpOutlinedIcon fontSize="small" />}
                label="Volume"
                value={classroom.volume}
              />

              <InfoRow
                icon={<InputOutlinedIcon fontSize="small" />}
                label="Input source"
                value={classroom.source}
              />

              <InfoRow
                icon={<AccessTimeOutlinedIcon fontSize="small" />}
                label="Last updated"
                value={classroom.lastPolled}
              />
            </Stack>

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 1,
                py: 1.15,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#0b5fa5",
              }}
            >
              View screen details
            </Button>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ClassroomCard;
