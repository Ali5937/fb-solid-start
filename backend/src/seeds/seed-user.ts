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

async function createUser(email: string, pwd: string) {
  const hash = await Bun.password.hash(pwd);

  try {
    await client.connect();

    const query = {
      text: 'INSERT INTO "users" ("email", "password_hash") VALUES ($1, $2) RETURNING id',
      values: [email, hash],
    };

    const result = await client.query(query);
    const data = result.rows;
    console.log(data);
  } catch (error: any) {
    console.error(error.message);
  } finally {
    client.end();
  }
}

createUser("45@mail.com", "password132432423");
