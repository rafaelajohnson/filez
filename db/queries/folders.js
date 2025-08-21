
// tiny query layer – keeps SQL out of routers

import db from "../client.js";

export async function getAllFolders() {
  const { rows } = await db.query("SELECT * FROM folders ORDER BY id");
  return rows;
}

export async function getFolderWithFiles(id) {
  const sql = `
    SELECT
      f.id,
      f.name,
      COALESCE(
        json_agg(
          json_build_object(
            'id', fl.id,
            'name', fl.name,
            'size', fl.size,
            'folder_id', fl.folder_id
          )
          ORDER BY fl.id
        ) FILTER (WHERE fl.id IS NOT NULL),
        '[]'
      ) AS files
    FROM folders f
    LEFT JOIN files fl ON fl.folder_id = f.id
    WHERE f.id = $1
    GROUP BY f.id;
  `;
  const { rows } = await db.query(sql, [id]);
  return rows[0]; // undefined if not found
}

export async function folderExists(id) {
  const { rows } = await db.query("SELECT 1 FROM folders WHERE id = $1", [id]);
  return rows.length > 0;
}
