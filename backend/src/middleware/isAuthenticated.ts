import type { Elysia } from "elysia";
import { jwtAccessSetup, jwtRefreshSetup } from "./jwtSetup";
const { Pool } = require("pg");

interface User {
  id: string;
}

export const isAuthenticated = (app: Elysia) => {
  return app
    .use(jwtAccessSetup)
    .use(jwtRefreshSetup)
    .derive(
      async ({
        jwtAccess,
        jwtRefresh,
        set,
        cookie: { accessToken, refreshToken },
      }) => {
        const accessData: User | false = await jwtAccess.verify(
          accessToken.value
        );

        if (!accessData) {
          const refreshData: User | false = await jwtRefresh.verify(
            refreshToken.value
          );

          if (refreshData) {
            accessToken.set({
              value: await jwtAccess.sign({ id: refreshData.id }),
              httpOnly: true,
              secure: true,
              maxAge: 600, // 10 min
              path: "/",
            });

            return {
              success: true,
              message: "Authorized",
              userId: refreshData.id,
            };
          }

          return {
            success: false,
            message: "Unauthorized",
            userId: null,
          };
        }

        return {
          success: true,
          message: "Authorized",
          userId: accessData.id,
        };
      }
    );
};
