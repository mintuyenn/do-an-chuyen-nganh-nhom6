import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT;
connectDB();

app.listen(PORT, () => {
  console.log(`Server đã bắt đầu trên cổng ${PORT}`);
});

app.get("/api/tasks", (resquest, response) => {
  response.send("Bạn có 1 việc cần làm");
});
