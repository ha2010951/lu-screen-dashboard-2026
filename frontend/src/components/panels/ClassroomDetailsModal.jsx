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

function getStatusColor(status) {
  const value = String(status || "").toLowerCase();

  if (value === "online" || value === "on") return "success";
  if (value === "standby") return "warning";
  if (value === "sleep") return "info";
  if (value === "offline") return "error";

  return "default";
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
      classroom.source !== "Unknown" &&
      classroom.source !== "--"
        ? classroom.source
        : "HDMI1"
    );
  }, [classroom]);

  if (!classroom) return null;

  async function runCommand(command, value) {
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

      if (onPanelUpdated && updatedPanel?.id) {
        onPanelUpdated(updatedPanel);
      }

      setMessage(
        `${command.replaceAll("_", " ")} command sent successfully.`
      );

      setImageVersion(Date.now());
    } catch (commandError) {
      console.error(commandError);

      setError(
        commandError.response?.data?.message ||
        commandError.message ||
        "The command could not be completed."
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

      if (onPanelUpdated && updatedPanel?.id) {
        onPanelUpdated(updatedPanel);
      }

      setMessage("Screen status refreshed.");
      setImageVersion(Date.now());
    } catch (refreshError) {
      console.error(refreshError);

      setError(
        refreshError.response?.data?.message ||
        refreshError.message ||
        "Unable to refresh the screen status."
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
      >
        <DialogTitle>
          {classroom.classroom} — {classroom.screenName}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Box>
              <Typography variant="h6" gutterBottom>
                Screen Status
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
                flexWrap="wrap"
              >
                <Chip
                  label={classroom.status}
                  color={getStatusColor(classroom.status)}
                />

                <Typography>
                  Power: <strong>{classroom.power}</strong>
                </Typography>

                <Typography>
                  Volume: <strong>{classroom.volume}</strong>
                </Typography>

                <Typography>
                  Mute:{" "}
                  <strong>
                    {classroom.muted ? "Yes" : "No"}
                  </strong>
                </Typography>

                <Typography>
                  Source: <strong>{classroom.source}</strong>
                </Typography>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Device Information
              </Typography>

              <Typography>
                Model: {classroom.model}
              </Typography>

              <Typography>
                Serial number: {classroom.serial}
              </Typography>

              <Typography>
                Last polled: {classroom.lastPolled}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Power Controls
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
              >
                <Button
                  variant="contained"
                  color="success"
                  disabled={Boolean(loadingCommand)}
                  onClick={() => runCommand("power_on")}
                >
                  Power On
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  disabled={Boolean(loadingCommand)}
                  onClick={() => runCommand("power_off")}
                >
                  Power Off
                </Button>

                <Button
                  variant="outlined"
                  disabled={Boolean(loadingCommand)}
                  onClick={() => runCommand("mute_toggle")}
                >
                  {classroom.muted ? "Unmute" : "Mute"}
                </Button>

                <Button
                  variant="outlined"
                  disabled={Boolean(loadingCommand)}
                  onClick={handleRefresh}
                >
                  Refresh Status
                </Button>
              </Stack>

              {loadingCommand && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 2 }}
                >
                  <CircularProgress size={20} />
                  <Typography variant="body2">
                    Sending command...
                  </Typography>
                </Stack>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Volume
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
                <Button
                  variant="outlined"
                  disabled={Boolean(loadingCommand)}
                  onClick={() =>
                    runCommand(
                      "volume_set",
                      Math.max(0, volume - 5)
                    )
                  }
                >
                  Volume Down
                </Button>

                <Slider
                  value={volume}
                  onChange={(_, value) => setVolume(value)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                  sx={{ flexGrow: 1 }}
                />

                <Button
                  variant="outlined"
                  disabled={Boolean(loadingCommand)}
                  onClick={() =>
                    runCommand(
                      "volume_set",
                      Math.min(100, volume + 5)
                    )
                  }
                >
                  Volume Up
                </Button>
              </Stack>

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                disabled={Boolean(loadingCommand)}
                onClick={() =>
                  runCommand("volume_set", volume)
                }
              >
                Set Volume to {volume}
              </Button>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Input Source
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
              >
                <FormControl fullWidth>
                  <InputLabel>Input source</InputLabel>

                  <Select
                    label="Input source"
                    value={source}
                    onChange={(event) =>
                      setSource(event.target.value)
                    }
                  >
                    <MenuItem value="HDMI1">HDMI1</MenuItem>
                    <MenuItem value="HDMI2">HDMI2</MenuItem>
                    <MenuItem value="USB-C">USB-C</MenuItem>
                    <MenuItem value="VGA">VGA</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  disabled={Boolean(loadingCommand)}
                  onClick={() =>
                    runCommand("source_set", source)
                  }
                >
                  Change Source
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Last 5 Commands
              </Typography>

              {auditLog.length === 0 ? (
                <Typography color="text.secondary">
                  No command history is available.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {auditLog.map((entry, index) => (
                    <Box
                      key={`${entry.time}-${index}`}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box>
                          <Typography fontWeight="medium">
                            {entry.command}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {entry.time}
                          </Typography>
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
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Status Image
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
                  maxWidth: 600,
                  minHeight: 180,
                  objectFit: "contain",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                The image will appear when the backend
                `/api/status/image` endpoint is available.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
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
