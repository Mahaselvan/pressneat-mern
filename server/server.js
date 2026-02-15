import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import scannerRoutes from "./routes/scannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: "*", // temporary (we’ll restrict later)
  })
);

app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/invoices", express.static("invoices"));
app.use("/api/scanner", scannerRoutes);
app.use("/videos", express.static("videos"));
app.use("/api/video", videoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/service", serviceRoutes);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join order room
  socket.on("joinOrder", (orderId) => {
    socket.join(orderId);
  });

  // Rider sends location
  socket.on("riderLocation", ({ orderId, lat, lng }) => {
    io.to(orderId).emit("locationUpdate", { lat, lng });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});
  socket.on("statusUpdate", ({ orderId, status }) => {
  io.to(orderId).emit("orderStatusUpdate", status);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

