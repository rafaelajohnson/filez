
import { Router } from "express";
import { getAllFolders, getFolderWithFiles, folderExists } from "../db/queries/folders.js";
import { createFileInFolder } from "../db/queries/files.js";

const router = Router();

// GET /folders
router.get("/", async (_req, res, next) => {
  try {
    const rows = await getAllFolders();
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /folders/:id  -> folder + files[]
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params; // not rejecting 0 up front; DB decides existence
    const folder = await getFolderWithFiles(id);
    if (!folder) return res.status(404).json({ error: "Folder not found" });
    res.json(folder);
  } catch (err) { next(err); }
});

// POST /folders/:id/files  -> create file inside a folder
router.post("/:id/files", async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    if (!body) return res.status(400).json({ error: "Missing body" });

    const { name, size } = body;
    if (typeof name !== "string" || typeof size !== "number") {
      return res.status(400).json({ error: "name (string) and size (number) required" });
    }

    if (!(await folderExists(id))) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const created = await createFileInFolder(id, { name, size });
    res.status(201).json(created);
  } catch (err) {
    // unique (name, folder_id) violation -> 400 is friendly enough for clients
    if (err.code === "23505") {
      return res.status(400).json({ error: "file name already exists in this folder" });
    }
    next(err);
  }
});

export default router;
