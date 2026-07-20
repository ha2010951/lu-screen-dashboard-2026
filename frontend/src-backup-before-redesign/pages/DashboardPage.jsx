import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getPanels } from "../api/panelsApi";
import ClassroomCard from "../components/panels/ClassroomCard";
import ClassroomDetailsModal from "../components/panels/ClassroomDetailsModal";
import useSocket from "../hooks/useSocket";

function formatSource(source) {
  if (!source || source === "unknown") {
    return "Unknown";
  }

  return source
    .replace(/^source_/i, "")
    .replace(/_/g, " ")
    .toUpperCase();
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizePanel(panel) {
  return {
    id: panel.id,
    classroom:
      panel.room ||
      panel.room_name ||
      `Classroom ${panel.id}`,
    screenName:
      panel.name ||
      panel.screen_name ||
      "Promethean Screen",
    status:
      panel.status ||
      panel.power ||
      panel.power_status ||
      "unknown",
    power:
      panel.power ||
      panel.power_status ||
      "unknown",
    volume: panel.volume ?? 0,
    muted: Boolean(panel.muted ?? panel.is_muted),
    source: formatSource(
      panel.source ||
      panel.input_source
    ),
    lastPolled: formatDate(
      panel.last_polled ||
      panel.lastPolled ||
      panel.updated_at
    ),
    model: panel.model || "Not available",
    serial:
      panel.serial_no ||
      panel.serial_number ||
      "Not available",
    auditLog:
      panel.auditLog ||
      panel.audit_log ||
      [],
  };
}

function DashboardPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);

  async function loadPanels() {
    setLoading(true);

    try {
      const data = await getPanels();

      const panelList = Array.isArray(data)
        ? data
        : data.panels || data.data || [];

      setClassrooms(panelList.map(normalizePanel));
      setUsingDemoData(false);
    } catch (error) {
      console.error("Unable to load panels:", error);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPanels();
  }, []);

  const handlePanelUpdate = useCallback((updatedPanel) => {
    const normalized = normalizePanel(updatedPanel);

    setClassrooms((current) =>
      current.map((panel) =>
        String(panel.id) === String(normalized.id)
          ? { ...panel, ...normalized }
          : panel
      )
    );

    setSelectedClassroom((current) =>
      current && String(current.id) === String(normalized.id)
        ? { ...current, ...normalized }
        : current
    );
  }, []);

  useSocket(handlePanelUpdate);

  const summary = useMemo(() => {
    const online = classrooms.filter((panel) =>
      ["on", "online"].includes(
        String(panel.status).toLowerCase()
      )
    ).length;

    const offline = classrooms.filter((panel) =>
      ["offline", "off", "unknown"].includes(
        String(panel.status).toLowerCase()
      )
    ).length;

    return {
      total: classrooms.length,
      online,
      offline,
    };
  }, [classrooms]);

  if (loading) {
    return (
      <Container
        sx={{
          py: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          background:
            "linear-gradient(135deg, #f8fbff 0%, #eef5fc 100%)",
          border: "1px solid #dce7f2",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
        >
          <Box>
            <Typography
              variant="overline"
              color="primary"
              fontWeight={700}
              letterSpacing={1.2}
            >
              IT OPERATIONS DASHBOARD
            </Typography>

            <Typography
              variant="h3"
              fontWeight={750}
              sx={{
                color: "#17324d",
                mt: 0.5,
                fontSize: {
                  xs: "2rem",
                  md: "2.7rem",
                },
              }}
            >
              Classroom Screen Management
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
                maxWidth: 700,
                fontSize: "1rem",
              }}
            >
              Monitor classroom Promethean screens, review their
              latest status and manage screen controls from one
              central dashboard.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderRadius: 3,
                backgroundColor: "white",
                border: "1px solid #dce7f2",
                minWidth: 95,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {summary.total}
              </Typography>
            </Box>

            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderRadius: 3,
                backgroundColor: "#edf8f0",
                border: "1px solid #cce8d2",
                minWidth: 95,
              }}
            >
              <Typography variant="caption" color="success.main">
                Online
              </Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                color="success.main"
              >
                {summary.online}
              </Typography>
            </Box>

            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderRadius: 3,
                backgroundColor: "#fff4f2",
                border: "1px solid #f0d2cd",
                minWidth: 95,
              }}
            >
              <Typography variant="caption" color="error.main">
                Unavailable
              </Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                color="error.main"
              >
                {summary.offline}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {usingDemoData && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          The backend API could not be reached.
        </Alert>
      )}

      <Grid container spacing={3}>
        {classrooms.map((classroom) => (
          <Grid
            key={classroom.id}
            size={{ xs: 12, sm: 6, lg: 4 }}
          >
            <ClassroomCard
              classroom={classroom}
              onOpen={setSelectedClassroom}
            />
          </Grid>
        ))}
      </Grid>

      <ClassroomDetailsModal
        open={Boolean(selectedClassroom)}
        classroom={selectedClassroom}
        onClose={() => setSelectedClassroom(null)}
        onPanelUpdated={handlePanelUpdate}
      />
    </Container>
  );
}

export default DashboardPage;
