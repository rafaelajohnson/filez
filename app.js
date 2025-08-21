
import express from "express";
import filesRouter from "./routes/files.js";
import foldersRouter from "./routes/folders.js";

const app = express();
app.use(express.json());

// tiny welcome (handy for sanity checks)
app.get("/", (_req, res) => {
  res.status(200).send("Filez API up");
});

// routing middleware split by resource
app.use("/files", filesRouter);
app.use("/folders", foldersRouter);

// minimal error handler 
app.use((err, _req, res, _next) => {
  console.error(err); // quick log
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
