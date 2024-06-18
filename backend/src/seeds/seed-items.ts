import fs from "fs";
import dotenv from "dotenv";
import USCities from "../biggest-us-cities.json" assert { type: "json" };
dotenv.config({ path: "../../.env" });
const { Client } = require("pg");

const client = new Client({
  host: process.env.POSTGRESQL_HOST,
  user: process.env.POSTGRESQL_USER,
  port: 5432,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE,
});

client.connect((err: any, client: any, done: any) => {
  if (err) throw err;
  console.log("Connected to database");
  seedDB();
});
const updatedCurrency = JSON.parse(
  fs.readFileSync("../currencies/currency.json", "utf8")
);
const pictures: number[] = [];
for (let i = 0; i < 20; i++) {
  pictures.push(Math.ceil(Math.random() * 9007199254740990));
}

const seedDB = async () => {
  console.time("seed-time");
  // await client.query("DELETE FROM items", (err: Error, res: any) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log("table deleted successfully");
  //   }
  // });

  for (let i = 0; i < 1000; i++) {
    for (let j = 0; j < USCities.features.length; j++) {
      console.log(j);
      const universalType = Math.ceil(Math.random() * 6);
      let type = universalType;
      let euroPrice =
        universalType <= 3
          ? Math.ceil(Math.random() * 2000 + 400)
          : Math.ceil(Math.random() * 1000000 + 10000);

      const values = Object.values(updatedCurrency);
      const objectValue: number[] = values[
        Math.floor(Math.random() * values.length)
      ] as number[];
      const currencyCode = objectValue[0];
      const currencyName = objectValue[1];
      const currencySymbol = objectValue[2];
      let originalPrice = Math.round(euroPrice * objectValue[3]);
      while (originalPrice > 2000000000) {
        euroPrice =
          universalType <= 3
            ? Math.ceil(Math.random() * 2000 + 400)
            : Math.ceil(Math.random() * 1000000 + 10000);
        originalPrice = Math.round(euroPrice * objectValue[3]);
      }
      const coordinates = [
        Math.random() * 0.036 - 0.018,
        Math.random() * 0.018 - 0.009,
      ];
      if (coordinates[0] >= -32 && coordinates[0] < 62) {
        type += 6;
      } else if (coordinates[0] > 62) {
        type += 12;
      }

      const heating = Math.floor(Math.random() * 6); // 0: no, 1: yes, 2: oven, 3: heatpump, 4: boiler, 5: air
      const petsAllowed = Math.floor(Math.random() * 4); // 0: no pets, 1: yes, 2: only small pets, 3: no dogs
      const newItem = {
        currency_code: currencyCode,
        currency_name: currencyName,
        currency_symbol: currencySymbol,
        original_price: originalPrice,
        euro_price: euroPrice,
        nation: "United States of America",
        state: `${USCities.features[j].properties.state}${USCities.features[j].properties.state}`,
        city: `${USCities.features[j].properties.city}${USCities.features[j].properties.city}`,
        address:
          "Lorem ipsum 843n, sit amet, consectetur adipiscing elit. Vestibulum eget enim lacus.",
        coordinates: `POINT(${coordinates[0]} ${coordinates[1]})`,
        type: type,
        size: Math.ceil(Math.random() * 100 + 50),
        plot:
          universalType === 2 || universalType === 5
            ? Math.ceil(Math.random() * 2000) + 100
            : null,
        bed: Math.ceil(Math.random() * 4),
        bath: Math.ceil(Math.random() * 2),
        floors:
          universalType === 2 || universalType === 5
            ? Math.ceil(Math.random() * 3)
            : null,
        heating: heating,
        cooling: Math.random() > 0.5 ? true : null,
        utility_cost:
          universalType <= 3 ? `${Math.ceil(Math.random() * 250)}` : null,
        elevator:
          universalType === 2 || universalType === 5
            ? null
            : Math.random() > 0.5
            ? true
            : null,
        garden: Math.random() > 0.5 ? true : null,
        swimming_pool: Math.random() > 0.5 ? true : null,
        parking: Math.random() > 0.5 ? true : null,
        council_home: Math.random() > 0.5 ? true : null,
        is_deleted: Math.random() > 0.1 ? true : null,
        auction_date:
          Math.random() > 0.5 ? new Date().toISOString().split("T")[0] : null,
        pets_allowed: petsAllowed,
        realtor_fee_percentage: (Math.random() * 3 + 2).toFixed(2),
        deposit: Math.random() > 0.5 ? Math.ceil(Math.random() * 2000) : null,
        like_count: Math.ceil(Math.random() * 200),
        first_picture: pictures[0],
        pictures: pictures,
        user_id: "a5fa05b6-665f-4bc5-ad22-2938a32c5336",
        firm_id: null,
        firm_boost: 0,
      };

      const query = {
        text: `INSERT INTO items (currency_code, currency_name, currency_symbol, original_price, euro_price, nation, state, 
          city, address, coordinates, type, size, plot, bed, bath, floors, heating, cooling, utility_cost, elevator, garden, 
          swimming_pool, parking, council_home, is_deleted, auction_date, pets_allowed, realtor_fee_percentage, deposit, 
          like_count, first_picture, pictures, user_id, firm_id, firm_boost) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_GeogFromText($10), $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)`,
        values: [
          newItem.currency_code,
          newItem.currency_name,
          newItem.currency_symbol,
          newItem.original_price,
          newItem.euro_price,
          newItem.nation,
          newItem.state,
          newItem.city,
          newItem.address,
          `SRID=4326;POINT(${coordinates[0]} ${coordinates[1]})`,
          newItem.type,
          newItem.size,
          newItem.plot,
          newItem.bed,
          newItem.bath,
          newItem.floors,
          newItem.heating,
          newItem.cooling,
          newItem.utility_cost,
          newItem.elevator,
          newItem.garden,
          newItem.swimming_pool,
          newItem.parking,
          newItem.council_home,
          newItem.is_deleted,
          newItem.auction_date,
          newItem.pets_allowed,
          newItem.realtor_fee_percentage,
          newItem.deposit,
          newItem.like_count,
          newItem.first_picture,
          newItem.pictures,
          newItem.user_id,
          newItem.firm_id,
          newItem.firm_boost,
        ],
      };
      await client.query(query);
    }
  }
  console.timeEnd("seed-time");
  client.end();
  console.log("Data seeding complete");
};
