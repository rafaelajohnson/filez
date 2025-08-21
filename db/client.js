import "dotenv/config";        // must be line 1
import pg from "pg";

// Support DATABASE_URL or PG* split vars (either works)
const { DATABASE_URL, PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
const db = DATABASE_URL
  ? new pg.Client({ connectionString: DATABASE_URL })
  : new pg.Client({ user: PGUSER, password: PGPASSWORD, host: PGHOST, port: PGPORT, database: PGDATABASE });

export default db;
