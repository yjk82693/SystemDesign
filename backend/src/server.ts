import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import projectRoutes from "./routes/projectRoutes";
import fileRoutes from "./routes/fileRoutes";
import commitRoutes from "./routes/commitRoutes";
import resourceRoutes from "./routes/resourceRoutes";
import chatRoutes from "./routes/chatRoutes";

dotenv.config();

const app = express();

// CORS middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.get("/", (_, res) => {
  res.send("Backend running");
});

// Routes
app.use("/", authRoutes);        // /register, /login, /me
app.use("/admin", adminRoutes);  // /admin/users, /admin/promote
app.use("/projects", projectRoutes); // /projects
app.use("/files", fileRoutes);   // /files/project/:id, /files/:id, etc.
app.use("/commits", commitRoutes);
app.use("/resources", resourceRoutes);
app.use("/chat", chatRoutes);

app.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});