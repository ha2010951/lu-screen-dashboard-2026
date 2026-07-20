import { useEffect } from "react";
import socket from "../services/socket";

function useSocket(onPanelUpdate) {
  useEffect(() => {
    socket.auth = {
      token: localStorage.getItem("token"),
    };

    socket.connect();

    function handleStatusUpdate(updatedPanel) {
      onPanelUpdate(updatedPanel);
    }

    function handleCommandCompleted(updatedPanel) {
      onPanelUpdate(updatedPanel);
    }

    function handleOffline(updatedPanel) {
      onPanelUpdate({
        ...updatedPanel,
        status: "Offline",
        power: "Offline",
      });
    }

    socket.on("panel:status-updated", handleStatusUpdate);
    socket.on("panel:command-completed", handleCommandCompleted);
    socket.on("panel:offline", handleOffline);

    return () => {
      socket.off("panel:status-updated", handleStatusUpdate);
      socket.off("panel:command-completed", handleCommandCompleted);
      socket.off("panel:offline", handleOffline);
      socket.disconnect();
    };
  }, [onPanelUpdate]);
}

export default useSocket;
