import { jwt } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";

export const basicAuthModel = new Elysia().model({
  basicAuthModel: t.Object({
    email: t.String(),
    password: t.String(),
  }),
});

export const jwtAccessSetup = new Elysia({
  name: "jwtAccess",
}).use(
  jwt({
    name: "jwtAccess",
    schema: t.Object({
      id: t.String(),
    }),
    secret: process.env.JWT_SECRET_ACCESS,
    exp: "10m",
  })
);

export const jwtRefreshSetup = new Elysia({
  name: "jwtRefresh",
}).use(
  jwt({
    name: "jwtRefresh",
    schema: t.Object({
      id: t.String(),
    }),
    secret: process.env.JWT_SECRET_REFRESH,
    exp: "7d",
  })
);
