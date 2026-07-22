import {
  Box,
  Chip,
  Container,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCommandLabel(command, value) {
  const labels = {
    power_on: "Power On",
    power_off: "Power Off",
    power_standby: "Power Standby",
    power_sleep: "Power Sleep",
    volume_up: "Volume Up",
    volume_down: "Volume Down",
    volume_set: value != null ? `Volume Set to ${value}` : "Volume Set",
    mute_on: "Mute On",
    mute_off: "Mute Off",
    mute_toggle: "Mute Toggle",
    source_set: value ? `Source Set to ${value}` : "Source Set",
  };

  return labels[command] || command;
}

function CommandLogPage() {
  const [search, setSearch] = useState("");
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCommands = async () => {
      try {
        const response = await api.get("/panels/commands");

        if (isMounted) {
          setCommands(response.data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch command history:", err.message);

        if (isMounted) {
          setError("Failed to load command history.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCommands();

    // Match the dashboard's refresh cadence — adjust interval if the
    // dashboard's own polling interval is different from a few seconds.
    const interval = setInterval(fetchCommands, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredCommands = useMemo(() => {
    const value = search.toLowerCase();

    return commands.filter((entry) => {
      const room = (entry.room || "").toLowerCase();
      const commandLabel = formatCommandLabel(entry.command, entry.value).toLowerCase();
      const resultLabel = entry.success ? "success" : "error";

      return (
        room.includes(value) ||
        commandLabel.includes(value) ||
        resultLabel.includes(value)
      );
    });
  }, [search, commands]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="overline" color="primary" fontWeight={700}>
            SYSTEM ACTIVITY
          </Typography>

          <Typography variant="h4">
            Command History
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.8 }}>
            Review commands issued to classroom screens.
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search commands"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                Search
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: { xs: "100%", sm: 300 } }}
        />
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          border: "1px solid #dfe7ef",
          boxShadow: "0 8px 24px rgba(28,55,90,0.06)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f4f7fa" }}>
              <TableCell sx={{ fontWeight: 750 }}>
                Classroom
              </TableCell>

              <TableCell sx={{ fontWeight: 750 }}>
                Command
              </TableCell>

              <TableCell sx={{ fontWeight: 750 }}>
                Date and time
              </TableCell>

              <TableCell sx={{ fontWeight: 750 }}>
                Result
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && filteredCommands.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>
                  {entry.room || "—"}
                </TableCell>

                <TableCell>
                  {formatCommandLabel(entry.command, entry.value)}
                </TableCell>

                <TableCell>
                  {formatTimestamp(entry.ts)}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={entry.success ? "Success" : "Error"}
                    color={entry.success ? "success" : "error"}
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}

            {loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading command history...
                </TableCell>
              </TableRow>
            )}

            {!loading && error && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {error}
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && filteredCommands.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No commands match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default CommandLogPage;