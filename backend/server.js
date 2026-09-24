import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import companyRouter from "./routes/company.routes.js";
import jobRouter from "./routes/job.routes.js";
import applicationRouter from "./routes/application.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;

//DB
connectDB();

//MiddleWare
app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads"));

//Routes

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/application",applicationRouter)

app.get("/", (req, res) => {
  res.send("Api Working");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
