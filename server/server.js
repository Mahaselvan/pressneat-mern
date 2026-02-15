import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import scannerRoutes from "./routes/scannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: corsOrigin,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/invoices", express.static("invoices"));
app.use("/videos", express.static("videos"));

if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.resolve(__dirname, "../client/dist");
  app.use(express.static(clientDistPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinOrder", (orderId) => {
    socket.join(orderId);
  });

  socket.on("riderLocation", ({ orderId, lat, lng }) => {
    io.to(orderId).emit("locationUpdate", { lat, lng });
  });

  socket.on("statusUpdate", ({ orderId, status }) => {
    io.to(orderId).emit("orderStatusUpdate", status);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

