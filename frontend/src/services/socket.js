import { io } from "socket.io-client";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  auth: {
    token: localStorage.getItem("token"),
  },
});

export default socket;
