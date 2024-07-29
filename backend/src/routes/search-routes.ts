import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const { Pool } = require("pg");
import NodeCache from "node-cache";
const cache = new NodeCache();

const pool = new Pool({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USER,
  port: 5432,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
});

async function getCachedCountries(queryKey: string, queryFunction: any) {
  const cachedValue = cache.get(queryKey);
  if (cachedValue) {
    return cachedValue;
  } else {
    const result = await queryFunction();
    cache.set(queryKey, result, 3600);
    return result;
  }
}

export default function (app: any) {
  app.get(
    "/api/search",
    async ({
      query: { inputValue, stateName, countryName, isAll },
    }: {
      query: {
        inputValue: string;
        stateName: string;
        countryName: string;
        isAll: string;
      };
    }) => {
      console.time("search");
      const all = isAll === "false" ? false : true;
      const country = countryName || null;
      const state = stateName || null;
      const client = await pool.connect();

      console.log("country: ", country);
      console.log("state: ", state);
      console.log("inputValue: ", inputValue);

      try {
        let queryText;
        if (all) {
          queryText = `
          WITH RankedCities AS (
            SELECT
              city_name,
              state_name,
              country_name,
              ranking,
              lat,
              lng
            FROM cities
            WHERE
              city_name ILIKE $1
              AND (state_name ILIKE $2 OR $2 IS NULL)
              AND (country_name ILIKE $3 OR $3 IS NULL)
          )
          SELECT 
            city_name,
            state_name,
            country_name,
            lat,
            lng
          FROM RankedCities
          ORDER BY ranking ASC
          LIMIT 5;`;
        } else {
          queryText = `
          WITH RankedCities AS (
              SELECT
                c.city_name,
                c.state_name,
                c.country_name,
                c.ranking
              FROM cities c
              JOIN
                items i ON c.city_name = i.city 
                  AND c.state_name = i.state 
                  AND c.country_name = i.country 
                  AND c.ranking = i.ranking
              WHERE
                c.city_name ILIKE $1
                AND (c.state_name ILIKE $2 OR $2 IS NULL)
                AND (c.country_name ILIKE $3 OR $3 IS NULL)
          ),
          DistinctCities AS (
            SELECT DISTINCT
              city_name,
              state_name,
              country_name
            FROM RankedCities
          )
          SELECT 
            city_name,
            state_name,
            country_name
          FROM DistinctCities
          ORDER BY 
            (SELECT MIN(ranking) 
            FROM RankedCities 
            WHERE city_name = DistinctCities.city_name
              AND state_name = DistinctCities.state_name
              AND country_name = DistinctCities.country_name) ASC
          LIMIT 5;`;
        }

        const parameterValues = [inputValue + "%", state, country];
        const result = await client.query({
          text: queryText,
          values: parameterValues,
        });

        const resArray: string[][] = [];
        result.rows.forEach((row: any) => {
          resArray.push([row.city_name, row.state_name, row.country_name]);
        });

        console.timeEnd("search");
        return { status: "success", data: result.rows };
      } catch (error: any) {
        console.error(error.message);
        return { status: "error", message: error.message };
      } finally {
        client.release();
      }
    }
  );

  app.get("/api/get-countries", () =>
    getCachedCountries("getCountries", async () => {
      const client = await pool.connect();
      try {
        console.time("get-countries");
        const queryText = `
            SELECT DISTINCT c.country_name
            FROM countries c
            JOIN items i ON c.country_name = i.country
            ORDER BY country_name ASC;`;

        const result = await client.query({
          text: queryText,
        });

        const resArray: string[] = [];
        result.rows.forEach((row: any) => {
          resArray.push(row.country_name);
        });

        console.timeEnd("get-countries");
        return { status: "success", data: resArray };
      } catch (error: any) {
        console.error(error.message);
        return { status: "error", message: error.message };
      } finally {
        client.release();
      }
    })
  );

  app.get("/api/get-countries/all", () =>
    getCachedCountries("getCountriesAll", async () => {
      const client = await pool.connect();
      try {
        console.time("get-countries/all");
        const queryText = `
            SELECT country_name
            FROM countries
            ORDER BY country_name ASC;`;

        const result = await client.query({
          text: queryText,
        });

        const resArray: string[] = [];
        result.rows.forEach((row: any) => {
          resArray.push(row.country_name);
        });

        console.timeEnd("get-countries/all");
        return { status: "success", data: resArray };
      } catch (error: any) {
        console.error(error.message);
        return { status: "error", message: error.message };
      } finally {
        client.release();
      }
    })
  );

  app.get(
    "/api/get-results-by-country",
    async ({
      query: { country, isAll },
    }: {
      query: { country: string; isAll: string };
    }) => {
      const all = isAll === "false" ? false : true;
      const client = await pool.connect();
      try {
        console.time("get-results-by-country");
        console.log("is all: ", isAll);
        let queryText;
        if (all) {
          queryText = `
          SELECT state_name
          FROM states
          WHERE COALESCE(country_name, $1) = $1
          ORDER BY state_name ASC;`;
        } else {
          queryText = `
          SELECT DISTINCT s.state_name
          FROM states s
          JOIN items i ON s.state_name = i.state
          WHERE COALESCE(s.country_name, $1) = $1
          ORDER BY state_name ASC;`;
        }

        const result = await client.query({
          text: queryText,
          values: [country],
        });

        const resArray: string[] = [];
        result.rows.forEach((row: any) => {
          resArray.push(row.state_name);
        });

        console.timeEnd("get-results-by-country");
        return { status: "success", data: resArray };
      } catch (error: any) {
        console.error(error.message);
        return { status: "error", message: error.message };
      } finally {
        client.release();
      }
    }
  );
}
