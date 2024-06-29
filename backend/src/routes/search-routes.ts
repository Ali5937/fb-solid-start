import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USER,
  port: 5432,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
});

export default function (app: any) {
  app.get(
    "/api/search",
    async ({ query }: { query: { inputValue: string } }) => {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${query.inputValue}&format=json&apiKey=${process.env.GIS_API}&type=city&limit=5`
      );
      const responseData = await response.json();
      return { responseData: responseData };
    }
  );
}
