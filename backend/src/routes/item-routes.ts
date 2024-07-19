import dotenv from "dotenv";
import * as path from "path";
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
  app
    .get("/api/item", async ({ query }: { query: { id: string } }) => {
      const client = await pool.connect();
      try {
        const queryText = `
        SELECT * FROM items
        WHERE id = $1`;

        const parameterValues = [query.id];
        const result = await client.query({
          text: queryText,
          values: parameterValues,
        });

        const data = result.rows;
        return { status: "success", data };
      } catch (error: any) {
        console.error(error.message);
        return { status: "error", message: error.message };
      } finally {
        client.release();
      }
    })

    .get(
      "/api/items",
      async ({
        query: {
          type,
          polygon,
          polygon2,
          min,
          max,
          itemSort,
          country,
          state,
          city,
        },
      }: {
        query: {
          type?: string;
          polygon?: string;
          polygon2?: string;
          min: number;
          max: number;
          itemSort: string;
          country: string;
          state: string;
          city: string;
        };
      }) => {
        // await new Promise((resolve) => setTimeout(resolve, 3000));

        console.time("/api/items, query-time");
        const client = await pool.connect();
        const finalType = type
          ? type
              .split(",")
              .map((type) => (parseInt(type, 10) < 18 ? parseInt(type, 10) : 1))
          : null;

        let finalPolygon = "";

        if (polygon)
          finalPolygon = `POLYGON((${polyToString(polygon as string)}))`;
        if (polygon2)
          finalPolygon = `MULTIPOLYGON(((${polyToString(
            polygon as string
          )})), ((${polyToString(polygon2 as string)})))`;

        function polyToString(poly: string) {
          const polygonPairs = poly.split(",").map((pairString) => {
            const pair = pairString.trim().split("_").map(Number);
            return pair;
          });
          const polygonStringFormatted = polygonPairs
            .map((pair) => pair.join(" "))
            .join(", ");
          return polygonStringFormatted;
        }

        try {
          const queryText = `
          SELECT ST_Y(ST_TRANSFORM(coordinates::geometry, 4326)) AS lat,
          ST_X(ST_TRANSFORM(coordinates::geometry, 4326)) AS lng,
          type, euro_price, created_at, original_price,
          size, currency_code, currency_name, currency_symbol, first_picture, created_at, id, city, state, country
          FROM items
          WHERE 
            ($1 = '' OR ST_Covers(ST_GeomFromText($1, 4326)::geography, coordinates))
            AND ($2::smallint[] IS NULL OR type = ANY($2::smallint[]))
            AND euro_price >= $3
            AND euro_price <= COALESCE(NULLIF($4, '')::numeric, 1e10)
            AND COALESCE(country = $6 OR $6 IS NULL)
            AND COALESCE(state = $7 OR $7 IS NULL)
            AND COALESCE($8::text IS NULL OR city = $8::text)
            ORDER BY
            CASE
              WHEN $5 = 'new' THEN created_at
              ELSE null
            END DESC,
            CASE
              WHEN $5 = 'low' THEN euro_price
              ELSE null
            END ASC,
            CASE
              WHEN $5 = 'high' THEN euro_price
              ELSE null
            END DESC
          LIMIT 500;`;

          const parameterValues = [
            finalPolygon || "",
            finalType,
            min,
            max,
            itemSort,
            country || null,
            state || null,
            city || null,
          ];
          const result = await client.query({
            text: queryText,
            values: parameterValues,
          });
          const data = result.rows;
          // console.log(data);

          const bufferData = Buffer.from(JSON.stringify(data));
          const gzipData = Bun.gzipSync(bufferData);
          const res = new Response(gzipData, {
            status: 200,
            headers: {
              "Content-Type": "application/json;charset=utf-8",
              "Content-Encoding": "gzip",
            },
          });

          console.timeEnd("/api/items, query-time");
          return res;
        } catch (error: any) {
          console.error(error.message);
          return { status: "error", message: error.message };
        } finally {
          client.release();
        }
      }
    )

    .get("/api/currency", async () => {
      try {
        const filePath = path.join(__dirname, "updatedCurrency.json");
        const file = Bun.file(filePath);
        return file;
      } catch (error: any) {
        console.error(error.message);
        return {
          status: "An error occurred while reading the file.",
          message: error.message,
        };
      }
    });
}
