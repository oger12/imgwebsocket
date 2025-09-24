import express from "express";
import { Server } from "socket.io";
import http from "http";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5500"], // позволен frontend
    methods: ["GET", "POST"],
  },
});

// Статични файлове
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Конфигурация за качване на файлове
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Endpoint за качване
app.post("/upload", upload.single("image"), (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`;
  io.emit("newImage", fileUrl); // изпращаме URL към всички клиенти
  res.json({ url: fileUrl });
});

// Socket.IO връзки
io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 3500;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));