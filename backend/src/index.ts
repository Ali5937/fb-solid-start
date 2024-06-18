import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import itemRoutes from "./routes/item-routes";
import userRoutes from "./routes/user-routes";

const port = 5000;
const app = new Elysia();
// app.use(compression());
// compression(app);
app.use(
  cors({
    origin: /localhost.*/,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
itemRoutes(app);
userRoutes(app);
app.listen(port);

console.log(`🦊 Elysia is running on port ${app.server?.port}...`);
