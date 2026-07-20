import {
  Alert,
  Box,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const sections = [
  {
    title: "Power controls",
    description:
      "Turn classroom screens on or off and refresh their latest status.",
    label: "POWER",
  },
  {
    title: "Volume controls",
    description:
      "Change the screen volume level and toggle the mute state.",
    label: "AUDIO",
  },
  {
    title: "Input source",
    description:
      "Switch between available inputs such as HDMI 1, HDMI 2 and USB-C.",
    label: "INPUT",
  },
  {
    title: "WhatsApp automation",
    description:
      "WAHA sends WhatsApp messages to n8n, which interprets commands and contacts the backend.",
    label: "WAHA",
  },
];

function DocumentationPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="overline" color="primary" fontWeight={700}>
        SUPPORT
      </Typography>

      <Typography variant="h4">
        Documentation and Help
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        Guidance for monitoring and controlling classroom screens.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: 3,
        }}
      >
        {sections.map((section) => (
          <Paper
            key={section.title}
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
              },
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                px: 1.5,
                py: 0.7,
                mb: 2,
                borderRadius: 2,
                backgroundColor: "primary.light",
                color: "primary.main",
                fontSize: "0.75rem",
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              {section.label}
            </Box>

            <Typography variant="h6" gutterBottom>
              {section.title}
            </Typography>

            <Typography color="text.secondary">
              {section.description}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Alert severity="warning" sx={{ mt: 4 }}>
        USB-C commands and power-on behavior should be verified using
        the physical Promethean screens before production use.
      </Alert>
    </Container>
  );
}

export default DocumentationPage;
