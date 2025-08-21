
import { Router } from "express";
import { getAllFilesWithFolderName } from "../db/queries/files.js";

const router = Router();

// GET /files  -> include folder_name
router.get("/", async (_req, res, next) => {
  try {
    const rows = await getAllFilesWithFolderName();
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
