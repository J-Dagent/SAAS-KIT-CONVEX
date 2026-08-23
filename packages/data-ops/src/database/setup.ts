import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

let db: any;

export function initDatabase(connection: {
  host: string;
  username: string;
  password: string;
}) {
  if (db) {
    return db;
  }
  const connectionString = `postgres://${connection.username}:${connection.password}@${connection.host}`;
  const client = neon(connectionString);
  db = drizzle(client);
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

