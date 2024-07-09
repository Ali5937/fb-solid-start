import type { Elysia } from "elysia";
import { isAuthenticated } from "../middleware/isAuthenticated";
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USER,
  port: 5432,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
});

export default function (app: Elysia) {
  app
    .use(isAuthenticated)

    .get("/api/profile/check-logged-in", async ({ set, userId }) => {
      if (!userId) {
        set.status = 401;
        return { message: "unauthorized" };
      }

      return { message: "authorized" };
    })
    .get(
      "/api/messages",
      async ({
        set,
        userId,
      }: {
        jwtAccess: any;
        jwtRefresh: any;
        set: any;
        userId: any;
      }) => {
        if (!userId) {
          set.status = 401;
          return { message: "unauthorized", data: null };
        }

        const queryText = `
        SELECT * FROM messages
        WHERE sender_id = $1
        OR receiver_id = $1;`;

        const parameterValues = [userId];
        const result = await pool.query({
          text: queryText,
          values: parameterValues,
        });

        let data = result.rows;

        return { message: "authorized", data: data };
      }
    );
}
