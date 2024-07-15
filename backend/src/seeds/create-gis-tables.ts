import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
const { Client } = require("pg");

const client = new Client({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USER,
  port: 5432,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
});

interface City {
  id: string;
  city_ascii: string;
  admin_name_ascii: string;
  country: string;
  ranking: string;
  lat: string;
  lng: string;
}

const createTables = async () => {
  await client.query("CREATE extension IF NOT EXISTS pg_trgm");
  await client.query("DROP TABLE IF EXISTS cities, states, countries;");

  await client.query(`
    CREATE TABLE IF NOT EXISTS countries (
      country_name TEXT PRIMARY KEY
    );`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS states (
      state_name TEXT,
      country_name TEXT NOT NULL,
      PRIMARY KEY (state_name, country_name),
      FOREIGN KEY (country_name) REFERENCES countries (country_name)
    );`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS cities (
      id BIGINT PRIMARY KEY,
      city_name TEXT NOT NULL,
      state_name TEXT NOT NULL,
      country_name TEXT NOT NULL,
      ranking SMALLINT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      UNIQUE (city_name, state_name, country_name, ranking),
      FOREIGN KEY (state_name, country_name) REFERENCES states (state_name, country_name)
    );`);

  await client.query(`
  	CREATE INDEX cities_trgm_gin ON cities USING gin (city_name gin_trgm_ops);`);
};

const insertDataBatch = async (dataBatch: City[]) => {
  const countrySet = new Set<string>();
  const stateCountrySet = new Set<string>();

  try {
    console.time("insertTime");
    for (const data of dataBatch) {
      countrySet.add(data.country);
      if (data.admin_name_ascii) {
        stateCountrySet.add(`${data.admin_name_ascii}@${data.country}`);
      }
    }
    const countryArray = Array.from(countrySet);
    const stateCountryArray = Array.from(stateCountrySet);

    console.log("insert countries");

    for (const country of countryArray) {
      const insertQuery = `
        INSERT INTO countries (country_name)
        VALUES ($1)
        ON CONFLICT DO NOTHING;`;
      const values = [country];
      await client.query(insertQuery, values);
    }

    console.log("insert states");

    for (const stateCountry of stateCountryArray) {
      const state = stateCountry.split("@")[0];
      const country = stateCountry.split("@")[1];
      const insertQuery = `
        INSERT INTO states (state_name, country_name)
        SELECT $1, $2
        WHERE EXISTS (SELECT 1 FROM countries WHERE country_name = $2)
        ON CONFLICT DO NOTHING;`;
      const values = [state, country];
      await client.query(insertQuery, values);
    }

    console.log("insert cities");

    let num = 0;
    for (const data of dataBatch) {
      const insertQuery = `
        INSERT INTO cities (id, city_name, state_name, country_name, ranking, lat, lng)
        SELECT $1, $2, $3, $4, $5, $6, $7
        WHERE EXISTS (SELECT 1 FROM states WHERE state_name = $3)
        ON CONFLICT DO NOTHING;`;

      const values = [
        data.id,
        data.city_ascii,
        data.admin_name_ascii,
        data.country,
        data.ranking,
        data.lat,
        data.lng,
      ];
      await client.query(insertQuery, values);
      console.log(num++);
    }

    console.timeEnd("insertTime"); // [1382.63s] insertTime ~23 min

    console.log("Inserting finished successfully");
  } catch (error) {
    console.log("Error inserting data: ", error);
  }
};

const importCSV = async (filePath: string) => {
  await client.connect();
  await createTables();

  const rows: City[] = [];
  console.time("csv-time"); // [285.33s] csv-time ~4.75 min
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row: City) => {
      console.log(rows.length);
      rows.push(row);
    })
    .on("end", async () => {
      console.log("CSV file processed successfully");
      console.timeEnd("csv-time");
      console.log("Now inserting data into database");
      await insertDataBatch(rows);
      client.end();
    });
};

importCSV("./worldcities.csv");

// row {
//   city: "Cimilj",
//   city_ascii: "Cimilj",
//   city_alt: "",
//   lat: "42.9661",
//   lng: "20.9389",
//   country: "Kosovo",
//   iso2: "XK",
//   iso3: "XKS",
//   admin_name: "Mitrovic├½┬áe Jugut",
//   admin_name_ascii: "Mitrovice e Jugut",
//   admin_code: "XK-38",
//   admin_type: "municipality",
//   capital: "",
//   density: "285.4",
//   population: "",
//   population_proper: "",
//   ranking: "3",
//   timezone: "Europe/Belgrade",
//   same_name: "FALSE",
//   id: "1901063867",
// }
