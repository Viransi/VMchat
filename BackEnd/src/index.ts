import express from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(express.json());

// Load Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

export default app;
