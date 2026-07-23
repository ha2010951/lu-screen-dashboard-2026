import {
  AccessTimeOutlined,
  InfoOutlined,
  InputOutlined,
  PowerSettingsNewOutlined,
  RefreshOutlined,
  TvOutlined,
  VolumeDownOutlined,
  VolumeOffOutlined,
  VolumeUpOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  getStatusImageUrl,
  refreshPanelStatus,
  sendPanelCommand,
} from "../../api/panelsApi";

function getStatusDetails(status) {
  const value = String(status || "").toLowerCase();

  if (value === "on" || value === "online" || value === "tcp_reachable") {
    return { label: "Online", color: "success" };
  }

  if (value === "off" || value === "offline") {
    return { label: "Offline", color: "error" };
  }

  return { label: "Unavailable", color: "default" };
}

function DetailItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
      >
        {label}
      </Typography>

      <Typography fontWeight={600}>
        {value || "Not available"}
      </Typography>
    </Box>
  );
}

function ClassroomDetailsModal({
  open,
  onClose,
  classroom,
  onPanelUpdated,
}) {
  const [volume, setVolume] = useState(0);
  const [source, setSource] = useState("HDMI1");
  const [loadingCommand, setLoadingCommand] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [imageVersion, setImageVersion] = useState(Date.now());

  useEffect(() => {
    if (!classroom) return;

    setVolume(
      typeof classroom.volume === "number"
        ? classroom.volume
        : 0
    );

    setSource(
      classroom.source &&
      classroom.source !== "Unknown"
        ? classroom.source
        : "HDMI1"
    );
  }, [classroom]);

  if (!classroom) return null;

  const status = getStatusDetails(classroom.status);

  async function executeCommand(command, value) {
    setLoadingCommand(command);
    setError("");

    try {
      const response = await sendPanelCommand(
        classroom.id,
        command,
        value
      );

      const updatedPanel =
        response.panel ||
        response.data ||
        response;

      if (updatedPanel?.id && onPanelUpdated) {
        onPanelUpdated(updatedPanel);
      }

      setMessage("Command sent successfully.");
      setImageVersion(Date.now());
    } catch (commandError) {
      setError(
        commandError.response?.data?.error ||
        commandError.response?.data?.message ||
        commandError.message ||
        "Unable to send the command."
      );
    } finally {
      setLoadingCommand("");
    }
  }

  async function handleRefresh() {
    setLoadingCommand("refresh_status");
    setError("");

    try {
      const response = await refreshPanelStatus(classroom.id);

      const updatedPanel =
        response.panel ||
        response.data ||
        response;

      if (updatedPanel?.id && onPanelUpdated) {
        onPanelUpdated(updatedPanel);
      }

      setMessage("Screen status refreshed.");
      setImageVersion(Date.now());
    } catch (refreshError) {
      setError(
        refreshError.response?.data?.error ||
        refreshError.message ||
        "Unable to refresh the screen."
      );
    } finally {
      setLoadingCommand("");
    }
  }

  const auditLog = Array.isArray(classroom.auditLog)
    ? classroom.auditLog.slice(0, 5)
    : [];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            backgroundColor: "#0b2f57",
            color: "white",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={750}>
                {classroom.classroom}
              </Typography>

              <Typography
                variant="body2"
                sx={{ opacity: 0.75 }}
              >
                {classroom.screenName}
              </Typography>
            </Box>

            <Chip
              label={status.label}
              color={status.color}
              sx={{
                backgroundColor:
                  status.color === "default"
                    ? "rgba(255,255,255,0.16)"
                    : undefined,
                color:
                  status.color === "default"
                    ? "white"
                    : undefined,
              }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 3 }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <InfoOutlined color="primary" />
                <Typography variant="h6">
                  Current screen status
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 2.5,
                }}
              >
                <DetailItem
                  label="POWER"
                  value={classroom.power}
                />

                <DetailItem
                  label="VOLUME"
                  value={classroom.volume}
                />

                <DetailItem
                  label="MUTE"
                  value={classroom.muted ? "Muted" : "Not muted"}
                />

                <DetailItem
                  label="INPUT SOURCE"
                  value={classroom.source}
                />
              </Box>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 3 }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <TvOutlined color="primary" />
                <Typography variant="h6">
                  Device information
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                  },
                  gap: 2.5,
                }}
              >
                <DetailItem
                  label="MODEL"
                  value={classroom.model}
                />

                <DetailItem
                  label="SERIAL NUMBER"
                  value={classroom.serial}
                />

                <DetailItem
                  label="LAST POLLED"
                  value={classroom.lastPolled}
                />

                <DetailItem
                  label="SCREEN ID"
                  value={classroom.id}
                />
              </Box>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 3 }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2.5 }}
              >
                <PowerSettingsNewOutlined color="primary" />
                <Typography variant="h6">
                  Screen controls
                </Typography>
              </Stack>

              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                >
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PowerSettingsNewOutlined />}
                    disabled={Boolean(loadingCommand)}
                    onClick={() =>
                      executeCommand("power_on")
                    }
                  >
                    Power on
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<PowerSettingsNewOutlined />}
                    disabled={Boolean(loadingCommand)}
                    onClick={() =>
                      executeCommand("power_off")
                    }
                  >
                    Power off
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<VolumeOffOutlined />}
                    disabled={Boolean(loadingCommand)}
                    onClick={() =>
                      executeCommand("mute_toggle")
                    }
                  >
                    {classroom.muted ? "Unmute" : "Mute"}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<RefreshOutlined />}
                    disabled={Boolean(loadingCommand)}
                    onClick={handleRefresh}
                  >
                    Refresh status
                  </Button>
                </Stack>

                <Divider />

                <Box>
                  <Typography
                    fontWeight={700}
                    gutterBottom
                  >
                    Volume control
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <VolumeDownOutlined color="action" />

                    <Slider
                      value={volume}
                      min={0}
                      max={100}
                      valueLabelDisplay="auto"
                      onChange={(_, value) =>
                        setVolume(value)
                      }
                    />

                    <VolumeUpOutlined color="action" />
                  </Stack>

                  <Button
                    variant="contained"
                    disabled={Boolean(loadingCommand)}
                    onClick={() =>
                      executeCommand("volume_set", volume)
                    }
                  >
                    Set volume to {volume}
                  </Button>
                </Box>

                <Divider />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <FormControl fullWidth>
                    <InputLabel>Input source</InputLabel>

                    <Select
                      value={source}
                      label="Input source"
                      onChange={(event) =>
                        setSource(event.target.value)
                      }
                    >
                      <MenuItem value="HDMI1">HDMI 1</MenuItem>
                      <MenuItem value="HDMI2">HDMI 2</MenuItem>
                      <MenuItem value="USB-C">USB-C</MenuItem>
                      <MenuItem value="VGA">VGA</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    startIcon={<InputOutlined />}
                    disabled={Boolean(loadingCommand)}
                    onClick={() =>
                      executeCommand("source_set", source)
                    }
                  >
                    Change source
                  </Button>
                </Stack>

                {loadingCommand && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <CircularProgress size={20} />
                    <Typography variant="body2">
                      Sending command...
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 3 }}
            >
              <Typography variant="h6" gutterBottom>
                Recent commands
              </Typography>

              {auditLog.length === 0 ? (
                <Typography color="text.secondary">
                  No recent command history is available.
                </Typography>
              ) : (
                <Stack spacing={1.2}>
                  {auditLog.map((entry, index) => (
                    <Stack
                      key={`${entry.time}-${index}`}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#f7f9fb",
                      }}
                    >
                      <Box>
                        <Typography fontWeight={600}>
                          {entry.command}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <AccessTimeOutlined
                            sx={{ fontSize: 15 }}
                            color="action"
                          />

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {entry.time}
                          </Typography>
                        </Stack>
                      </Box>

                      <Chip
                        size="small"
                        label={entry.result}
                        color={
                          entry.result === "Success"
                            ? "success"
                            : "error"
                        }
                      />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 3 }}
            >
              <Typography variant="h6" gutterBottom>
                Status image
              </Typography>

              <Box
                component="img"
                src={`${getStatusImageUrl(
                  classroom.id
                )}&v=${imageVersion}`}
                alt={`${classroom.classroom} status`}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                sx={{
                  width: "100%",
                  maxHeight: 400,
                  objectFit: "contain",
                  borderRadius: 2,
                  backgroundColor: "#f7f9fb",
                }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
              >
                The status image will appear when the backend image
                endpoint is available.
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3000}
        message={message}
        onClose={() => setMessage("")}
      />
    </>
  );
}

export default ClassroomDetailsModal;
