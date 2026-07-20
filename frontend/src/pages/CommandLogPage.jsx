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
import { useMemo, useState } from "react";

const commands = [
  {
    id: 1,
    classroom: "A101",
    command: "Power On",
    timestamp: "19 Jul 2026, 10:20",
    result: "Success",
  },
  {
    id: 2,
    classroom: "A102",
    command: "Refresh Status",
    timestamp: "19 Jul 2026, 10:18",
    result: "Error",
  },
  {
    id: 3,
    classroom: "A106",
    command: "Volume Set to 72",
    timestamp: "19 Jul 2026, 10:16",
    result: "Success",
  },
];

function CommandLogPage() {
  const [search, setSearch] = useState("");

  const filteredCommands = useMemo(() => {
    const value = search.toLowerCase();

    return commands.filter(
      (entry) =>
        entry.classroom.toLowerCase().includes(value) ||
        entry.command.toLowerCase().includes(value) ||
        entry.result.toLowerCase().includes(value)
    );
  }, [search]);

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
            {filteredCommands.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>
                  {entry.classroom}
                </TableCell>

                <TableCell>
                  {entry.command}
                </TableCell>

                <TableCell>
                  {entry.timestamp}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={entry.result}
                    color={
                      entry.result === "Success"
                        ? "success"
                        : "error"
                    }
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}

            {filteredCommands.length === 0 && (
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
