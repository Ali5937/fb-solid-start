import fs from "fs";
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

const updatedCurrency = JSON.parse(
  fs.readFileSync("../currencies/currency.json", "utf8")
);
const pictures: number[] = [];
for (let i = 0; i < 20; i++) {
  pictures.push(Math.ceil(Math.random() * 9007199254740990));
}

try {
  console.time("seed-time");
  await client.connect();
  await seedDB();
} catch (error) {
  console.error("Error:", error);
} finally {
  console.timeEnd("seed-time");
  console.log("Data seeding complete"); // [1913.70s] seed-time ~31 min
  client.end();
}

async function insertItem(row: any) {
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

  const city = row.city_name;
  const state = row.state_name;
  const country = row.country_name;
  const ranking = row.ranking;

  const coordinates = [
    row.lng + (ranking <= 2 ? Math.random() * 0.1 - 0.05 : 0),
    row.lat + (ranking <= 2 ? Math.random() * 0.1 - 0.05 : 0),
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
    country: country,
    state: state,
    city: city,
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
    user_id: "68bc150b-e522-4728-a1a8-120f2002207e",
    firm_id: null,
    firm_boost: 0,
    ranking: ranking,
  };

  const query = {
    text: `INSERT INTO items (currency_code, currency_name, currency_symbol, original_price, euro_price, country, state,
          city, coordinates, type, size, plot, bed, bath, floors, heating, cooling, utility_cost, elevator, garden,
          swimming_pool, parking, council_home, is_deleted, auction_date, pets_allowed, realtor_fee_percentage, deposit,
          like_count, first_picture, pictures, user_id, firm_id, firm_boost, ranking)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeogFromText($9), $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)`,
    values: [
      newItem.currency_code,
      newItem.currency_name,
      newItem.currency_symbol,
      newItem.original_price,
      newItem.euro_price,
      newItem.country,
      newItem.state,
      newItem.city,
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
      newItem.ranking,
    ],
  };
  await client.query(query);
}

async function seedDB() {
  await client.query("DELETE FROM items");

  const resultCityCount = await client.query(`SELECT COUNT(*) FROM cities`);
  const cityCount = resultCityCount.rows[0].count;

  const offset = 100;
  let currentOffset = 0;

  const queryText = `
  SELECT *
  FROM cities
  LIMIT $1 OFFSET $2;`;

  for (let i = 0; i < cityCount / offset; i++) {
    const values = [offset, currentOffset];
    currentOffset += offset;
    const result = await client.query(queryText, values);
    console.log(i * offset);
    for (let j = 0; j < offset; j++) {
      const row = result.rows[j];
      let loopCount = 0;
      if (row?.ranking) loopCount = row.ranking <= 2 ? 10 : 1;
      for (let j = 0; j < loopCount; j++) {
        await insertItem(row);
      }
    }
  }
}
