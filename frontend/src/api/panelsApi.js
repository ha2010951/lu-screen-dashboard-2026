import api from "./axios";

export async function getPanels() {
  const response = await api.get("/panels");
  return response.data;
}

export async function sendPanelCommand(panelId, command, value) {
  const response = await api.post(`/panels/${panelId}/command`, {
    command,
    value,
  });

  return response.data;
}

export async function refreshPanelStatus(panelId) {
  return sendPanelCommand(panelId, "refresh_status");
}

export function getStatusImageUrl(panelId) {
  const baseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  return `${baseUrl}/status/image?panelId=${panelId}`;
}
