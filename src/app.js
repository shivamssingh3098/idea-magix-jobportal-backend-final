import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin/admin.routes.js";
// import instructorRouter from "./routes/instructor/instructor.routes.js";
import candidateRouter from "./routes/condidate/condidate.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
console.log("app");
app.use("/api/v1/admin", adminRouter);
// app.use("/api/v1/instructor", instructorRouter);
app.use("/api/v1/candidate", candidateRouter);

export { app };
