import {
  Alert,
  CircularProgress,
  Container,
  Grid,
  Snackbar,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { getPanels } from "../api/panelsApi";
import ClassroomCard from "../components/panels/ClassroomCard";
import ClassroomDetailsModal from "../components/panels/ClassroomDetailsModal";
import useSocket from "../hooks/useSocket";

const demoClassrooms = [
  {
    id: 1,
    classroom: "Lab 1",
    screenName: "Promethean Screen 1",
    status: "Online",
    power: "On",
    volume: 35,
    muted: false,
    source: "HDMI1",
    lastPolled: "Not connected to backend",
    model: "ActivPanel 9",
    serial: "LU-AP9-001",
    auditLog: [
      {
        time: "9:40 AM",
        command: "Volume set to 35",
        result: "Success",
      },
    ],
  },
  {
    id: 2,
    classroom: "Lab 2",
    screenName: "Promethean Screen 1",
    status: "Offline",
    power: "Offline",
    volume: "--",
    muted: false,
    source: "HDMI2",
    lastPolled: "Not connected to backend",
    model: "ActivPanel 9",
    serial: "LU-AP9-002",
    auditLog: [],
  },
  {
    id: 3,
    classroom: "Lab 3",
    screenName: "Promethean Screen 1",
    status: "Standby",
    power: "Standby",
    volume: 20,
    muted: true,
    source: "USB-C",
    lastPolled: "Not connected to backend",
    model: "ActivPanel 9",
    serial: "LU-AP9-003",
    auditLog: [],
  },
];

function normalizePanel(panel) {
  return {
    id: panel.id,
    classroom:
      panel.classroom ||
      panel.room_name ||
      panel.room ||
      `Classroom ${panel.id}`,
    screenName:
      panel.screenName ||
      panel.screen_name ||
      panel.name ||
      "Promethean Screen",
    status: panel.status || "Unknown",
    power:
      panel.power ||
      panel.power_status ||
      panel.status ||
      "Unknown",
    volume: panel.volume ?? "--",
    muted: Boolean(panel.muted ?? panel.is_muted),
    source:
      panel.source ||
      panel.input_source ||
      "Unknown",
    lastPolled:
      panel.lastPolled ||
      panel.last_polled ||
      panel.updated_at ||
      "Unknown",
    model: panel.model || "Unknown",
    serial:
      panel.serial ||
      panel.serial_number ||
      "Unknown",
    auditLog: panel.auditLog || panel.audit_log || [],
  };
}

function DashboardPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPanels() {
    setLoading(true);

    try {
      const data = await getPanels();

      const panelList = Array.isArray(data)
        ? data
        : data.panels || data.data || [];

      if (!panelList.length) {
        throw new Error("Backend returned no panels.");
      }

      setClassrooms(panelList.map(normalizePanel));
      setUsingDemoData(false);
    } catch (error) {
      console.error("Unable to load panels:", error);
      setClassrooms(demoClassrooms);
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

    setMessage(
      `${normalized.classroom} status updated in real time.`
    );
  }, []);

  useSocket(handlePanelUpdate);

  if (loading) {
    return (
      <Container
        sx={{
          py: 8,
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
      <Typography variant="h3" gutterBottom>
        LU Screen Dashboard
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Monitor and control classroom Promethean screens.
      </Typography>

      {usingDemoData && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          The backend API could not be reached, so the dashboard is
          currently showing demonstration data.
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

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3000}
        message={message}
        onClose={() => setMessage("")}
      />
    </Container>
  );
}

export default DashboardPage;
