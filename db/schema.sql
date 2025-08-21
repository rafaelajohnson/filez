-- reset (order matters)
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS folders;

-- folders: id + unique name
CREATE TABLE folders (
  id   SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- files: id, name, size, folder_id FK with cascade
CREATE TABLE files (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  size      INTEGER NOT NULL,
  folder_id INTEGER NOT NULL
    REFERENCES folders(id)
    ON DELETE CASCADE,
  -- uniqueness of name within a folder
  CONSTRAINT files_name_folder_unique UNIQUE (name, folder_id)
);
