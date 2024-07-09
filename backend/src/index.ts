import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import itemRoutes from "./routes/item-routes";
import userRoutes from "./routes/user-routes";
import searchRoutes from "./routes/search-routes";
import profileRoutes from "./routes/profile-routes";

const port = 5000;
const app = new Elysia();

app.use(
  cors({
    origin: /localhost.*/,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
itemRoutes(app);
userRoutes(app);
searchRoutes(app);
profileRoutes(app);
app.listen(port);

console.log(`🦊 Elysia is running on port ${app.server?.port}...`);
