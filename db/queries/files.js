

import db from "../client.js";

export async function getAllFilesWithFolderName() {
  const sql = `
    SELECT files.*, folders.name AS folder_name
    FROM files
    JOIN folders ON folders.id = files.folder_id
    ORDER BY files.id;
  `;
  const { rows } = await db.query(sql);
  return rows;
}

export async function createFileInFolder(folderId, { name, size }) {
  const sql = `
    INSERT INTO files (name, size, folder_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await db.query(sql, [name, size, folderId]);
  return rows[0];
}
