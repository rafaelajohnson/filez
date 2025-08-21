import express from "express";
import db from "#db/client";

const app = express();
app.use(express.json());

// GET /files -> array of files with folder_name (must match JOIN in test)
app.get("/files", async (_req, res, next) => {
  try {
    const sql = `
      SELECT
        files.*,
        folders.name AS folder_name
      FROM files
      JOIN folders ON files.folder_id = folders.id
    `;
    const { rows } = await db.query(sql);
    res.status(200).json(rows);
  } catch (err) { next(err); }
});

// GET /folders -> raw rows (SELECT * FROM folders)
app.get("/folders", async (_req, res, next) => {
  try {
    const { rows } = await db.query("SELECT * FROM folders");
    res.status(200).json(rows);
  } catch (err) { next(err); }
});

// GET /folders/:id -> folder object + files array
app.get("/folders/:id", async (req, res, next) => {
  try {
    const id = req.params.id; // let DB decide existence
    const { rows: folders } = await db.query(
      "SELECT * FROM folders WHERE id = $1",
      [id]
    );
    const folder = folders[0];
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    const { rows: files } = await db.query(
      "SELECT * FROM files WHERE folder_id = $1",
      [id]
    );
    // test expects: body equals objectContaining(folder) and files under 'files'
    res.status(200).json({ ...folder, files });
  } catch (err) { next(err); }
});

// POST /folders/:id/files -> create file in that folder
app.post("/folders/:id/files", async (req, res, next) => {
  try {
    const id = req.params.id;
    const body = req.body;
    if (!body) return res.sendStatus(400);

    const { name, size } = body;
    if (typeof name !== "string" || typeof size !== "number") {
      return res.sendStatus(400);
    }

    // folder must exist (send 404 if not)
    const check = await db.query("SELECT id FROM folders WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.sendStatus(404);

    const insert = `
      INSERT INTO files (name, size, folder_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await db.query(insert, [name, size, id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    // unique (name, folder_id) violation: friendly 400
    if (err.code === "23505") return res.status(400).json({ error: "duplicate file in this folder" });
    next(err);
  }
});

// bare-bones error handler (good enough for this project)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
