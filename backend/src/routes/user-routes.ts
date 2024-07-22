import dotenv from "dotenv";
import {
  basicAuthModel,
  jwtAccessSetup,
  jwtRefreshSetup,
} from "../middleware/jwtSetup";
const { Pool } = require("pg");

dotenv.config({ path: "../.env" });

if (!process.env.JWT_SECRET_ACCESS) {
  throw new Error(
    "JWT_SECRET_ACCESS is not defined in the environment variables."
  );
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
    .use(basicAuthModel)
    .use(jwtAccessSetup)
    .use(jwtRefreshSetup)

    // needed?
    .get("/api/user/:id", async ({ cookie: { auth }, params }: any) => {
      return { auth, params };
    })
    .get("/api/user/email/:emailAddress", async ({ params }: any) => {
      try {
        const client = await pool.connect();
        const doesEmailExist = await getEmail(client, params.emailAddress);
        if (doesEmailExist) {
          // check if user exists
          return { status: 200, message: "User found" };
        } else {
          return { status: 204, message: "User not found" };
        }
      } catch (error: any) {
        throw { status: 500, message: error.message };
      }
    })

    // if user does not exist already
    .post(
      "/api/user/signup",
      async ({
        body,
        jwt,
        cookie: { accessToken, refreshToken },
      }: {
        body: any;
        jwt: any;
        cookie: { accessToken: any; refreshToken: any };
      }) => {
        const client = await pool.connect();
        try {
          const doesEmailExist = await getEmail(client, body.email);
          if (doesEmailExist)
            return { status: 409, message: "User exists already" };

          const passwordHash = await Bun.password.hash(body.password);
          const queryText = `
            INSERT INTO users (email, password_hash, firm_id)
            VALUES ($1, $2, $3)
            RETURNING *;`;

          const parameterValues = [body.email, passwordHash, body.firmId];

          const result = await pool.query({
            text: queryText,
            values: parameterValues,
          });

          // check if user exists
          if (result.rows.length !== 1) return { status: "error" };
          let userData = result.rows[0];
          let userId: number | null = null;
          userId = userData.id;

          accessToken.set({
            value: await jwt.sign({ id: userId }),
            httpOnly: true,
            secure: true,
            maxAge: 600, // 10 min
            path: "/",
          });
          refreshToken.set({
            value: await jwt.sign({ id: userId }),
            httpOnly: true,
            secure: true,
            maxAge: 7 * 86400, // 7 days
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
      async ({
        body,
        jwtAccess,
        jwtRefresh,
        cookie: { accessToken, refreshToken },
      }: {
        body: any;
        jwtAccess: any;
        jwtRefresh: any;
        cookie: { accessToken: any; refreshToken: any };
      }) => {
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

          // check if user exists
          if (result.rows.length !== 1) return { status: "error" };

          let userData = result.rows[0];
          let userId = userData.id;

          const isPasswordCorrect = await Bun.password.verify(
            body.password,
            userData.password_hash
          );

          if (!isPasswordCorrect) return { status: "error" };

          accessToken.set({
            value: await jwtAccess.sign({ id: userId }),
            httpOnly: true,
            secure: true,
            maxAge: 600, // 10 min
            path: "/",
          });
          refreshToken.set({
            value: await jwtRefresh.sign({ id: userId }),
            httpOnly: true,
            secure: true,
            maxAge: 7 * 86400, // 7 days
            path: "/",
          });

          return { status: "success", userId: userId };
        } catch (error: any) {
          return { status: "error", message: error.message };
        } finally {
          client.release();
        }
      }
    )
    .post(
      "/api/user/logout",
      async ({
        cookie: { accessToken, refreshToken },
      }: {
        cookie: { accessToken: any; refreshToken: any };
      }) => {
        accessToken.remove();
        refreshToken.remove();
        return {
          status: 204,
          message: "Logout successful",
        };
      }
    );
}
