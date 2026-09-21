 import { io } from "socket.io-client";

const sessionRaw = sessionStorage.getItem("PROPERTY_CARE_SESSION");

let token = null;

try {
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  token = session?.token ?? null;
} catch (error) {
  console.error("Failed to parse auth session:", error);
}

console.log("Socket token available:", Boolean(token));

if (token) {
  const socket = io("http://localhost:5000", {
    auth: {
      token,
    },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);

    socket.emit("connection_test");
  });

  socket.on("connection_test", (data) => {
    console.log("✅ Connection test response:", data);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection failed:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });
} else {
  console.error("❌ No authentication token found in sessionStorage.");
}