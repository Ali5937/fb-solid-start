import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
const { Client } = require("pg");

const client = new Client({
  host: process.env.POSTGRESQL_HOST, // Use process.env instead of Bun.env
  user: process.env.POSTGRESQL_USER,
  port: 5432,
  password: process.env.POSTGRESQL_PASSWORD,
  database: "postgres",
});

try {
  await client.connect();
  await client.query(
    `DROP DATABASE IF EXISTS ${process.env.POSTGRESQL_DATABASE} WITH (FORCE)`
  );
  await client.query(`CREATE DATABASE ${process.env.POSTGRESQL_DATABASE}`);
  console.log("Database created succesfully");
} catch (error: any) {
  console.error(error.message);
} finally {
  client.end();
}
