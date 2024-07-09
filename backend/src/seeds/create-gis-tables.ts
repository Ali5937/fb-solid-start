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
}

const createTable = async () => {
  await client.query("DROP TABLE IF EXISTS cities;");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS cities (
      id BIGINT PRIMARY KEY,
      city_name TEXT NOT NULL,
      state_name TEXT NOT NULL,
      country_name TEXT NOT NULL,
      ranking SMALLINT NOT NULL
    );
  `;
  await client.query(createTableQuery);
};

const insertDataBatch = async (dataBatch: City[]) => {
  const insertQuery = `
    INSERT INTO cities (id, city_name, state_name, country_name, ranking)
    VALUES ($1, $2, $3, $4, $5)
  `;

  try {
    console.time("insertTime");
    for (const data of dataBatch) {
      const values = [
        data.id,
        data.city_ascii,
        data.admin_name_ascii,
        data.country,
        data.ranking,
      ];
      await client.query(insertQuery, values);
    }
    console.timeEnd("insertTime");
    console.log("Inserting finished successfully");
  } catch (error) {
    console.log("Error inserting data: ", error);
  }
};

const importCSV = async (filePath: string) => {
  await client.connect();
  await createTable();

  const rows: City[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row: City) => {
      console.log(rows.length);
      rows.push(row);
    })
    .on("end", async () => {
      console.log("CSV file processed successfully");
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
