import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
const { Client } = require("pg");

const client = new Client({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USER,
  port: 5432,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
});

async function temp() {
  try {
    await client.query("");
  } catch (error: any) {
    console.error(error.message);
  } finally {
    client.release();
  }
}

temp();
