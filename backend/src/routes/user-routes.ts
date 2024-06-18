import { jwt } from "@elysiajs/jwt";
import dotenv from "dotenv";
const { Pool } = require("pg");

dotenv.config({ path: "../.env" });

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

const pool = new Pool({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USER,
  port: 5432,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
});

async function getEmail(client: any, email: string) {
  const queryText = `
  SELECT * FROM users
  WHERE email = $1;`;

  const parameterValues = [email];

  const result = await client.query({
    text: queryText,
    values: parameterValues,
  });

  if (result.rows.length > 0) return true;
  else return false;
}

export default function (app: any) {
  app
    // .use(
    //   jwt({
    //     name: "jwt",
    //     secret: process.env.JWT_SECRET as string,
    //     exp: "1h",
    //   })
    // )

    .get("/api/user/:id", async ({ cookie: { auth }, params }: any) => {
      return { auth, params };
    })

    .get("/api/user/email/:emailAddress", async ({ params }: any) => {
      const client = await pool.connect();
      const doesEmailExist = await getEmail(client, params.emailAddress);
      try {
        if (doesEmailExist) {
          // check if user exists
          return { status: 200, message: "User found" };
        } else {
          return { status: 204, message: "User not found" };
        }
      } catch (error: any) {
        // console.error(error.message);
        return { status: "error", message: error.message };
      }
    })

    // .post(
    //   "/api/test",
    //   async ({ body, jwt, cookie: { auth }, params }: { body: any; jwt: any; cookie: { auth: any }; params: any }) => {
    //     auth.set({
    //       value: await jwt.sign(params),
    //       httpOnly: true,
    //       maxAge: 7 * 86400,
    //       path: "/",
    //     });
    //   }
    // )

    // if user does not exist already
    .post(
      "/api/user/signup",
      async ({ body, jwt, cookie: { auth }, params }: { body: any; jwt: any; cookie: { auth: any }; params: any }) => {
        const client = await pool.connect();
        try {
          const doesEmailExist = await getEmail(client, params.emailAddress);
          if (!doesEmailExist) return { status: 204, message: "User not found" };

          const passwordHash = await Bun.password.hash(body.password);
          const queryText = `
            INSERT INTO users (email, password_hash, firm_id)
            VALUES ($1, $2, $3)
            RETURNING *;`;

          const parameterValues = [body.email, passwordHash, body.firmId];

          await pool.query({
            text: queryText,
            values: parameterValues,
          });

          auth.set({
            value: await jwt.sign(params),
            httpOnly: true,
            maxAge: 7 * 86400,
            path: "/",
          });

          return { status: "success" };
        } catch (error: any) {
          console.error(error.message);
          return { status: "error", message: error.message };
        } finally {
          client.release();
        }
      }
    )

    // if user exists already
    .post(
      "/api/user/login",
      async ({ body, jwt, cookie: { auth }, params }: { body: any; jwt: any; cookie: { auth: any }; params: any }) => {
        let userData: any;
        let userId: number | null = null;
        const client = await pool.connect();
        try {
          const queryText = `
          SELECT * FROM users
          WHERE email = $1;`;

          const parameterValues = [body.email];
          const result = await pool.query({
            text: queryText,
            values: parameterValues,
          });

          if (result.rows.length > 0) {
            // check if user exists
            userData = result.rows[0];
            userId = userData.id;
          }

          const isPasswordCorrect = await Bun.password.verify(body.password, userData.password_hash);
          if (isPasswordCorrect) {
            auth.set({
              value: await jwt.sign(params),
              httpOnly: true,
              maxAge: 7 * 86400,
              path: "/",
            });
            return { status: "success" };
          } else return { status: "error" };
        } catch (error: any) {
          console.error(error.message);
          return { status: "error", message: error.message };
        } finally {
          client.release();
        }
      }
    );
}
