import {
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const commands = [
  {
    id: 1,
    classroom: "Lab 1",
    command: "Power On",
    timestamp: "12 July 2026, 9:40 AM",
    result: "Success",
  },
  {
    id: 2,
    classroom: "Lab 3",
    command: "Mute Toggle",
    timestamp: "12 July 2026, 9:38 AM",
    result: "Success",
  },
  {
    id: 3,
    classroom: "Lab 2",
    command: "Refresh Status",
    timestamp: "12 July 2026, 9:35 AM",
    result: "Error",
  },
  {
    id: 4,
    classroom: "Lab 1",
    command: "Set Volume 35",
    timestamp: "12 July 2026, 9:30 AM",
    result: "Success",
  },
];

function CommandLogPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Command Log
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Recent commands sent to all classroom screens.
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Classroom</TableCell>
              <TableCell>Command</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Result</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {commands.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.classroom}</TableCell>
                <TableCell>{entry.command}</TableCell>
                <TableCell>{entry.timestamp}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={entry.result}
                    color={
                      entry.result === "Success"
                        ? "success"
                        : "error"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default CommandLogPage;
