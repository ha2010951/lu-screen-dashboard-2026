import {
  Alert,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

function DocumentationPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Documentation and Help
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Basic instructions for using the screen management dashboard.
      </Typography>

      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Screen Statuses
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="Online"
                secondary="The screen is reachable and responding."
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Standby"
                secondary="The screen is connected but currently in standby mode."
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Sleep"
                secondary="The screen is in a low-power sleep state."
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Offline"
                secondary="The backend cannot communicate with the screen."
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Controls
          </Typography>

          <Typography>
            IT staff can power screens on or off, change volume,
            toggle mute, change the active input source, and manually
            refresh the current status.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            WhatsApp Automation
          </Typography>

          <Typography>
            WhatsApp messages are received through WAHA and passed to
            n8n. The automation interprets the command and sends it to
            the backend. Socket.io then updates this dashboard.
          </Typography>
        </Paper>

        <Alert severity="warning">
          USB-C control commands must be verified on the real
          Promethean hardware before production use.
        </Alert>
      </Stack>
    </Container>
  );
}

export default DocumentationPage;
