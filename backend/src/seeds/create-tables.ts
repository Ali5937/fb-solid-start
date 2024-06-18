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

const createTableQueryUsers = `
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  firm_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)`;

const createTableQueryFirms = `
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  verified BOOLEAN NOT NULL,
  boost SMALLINT CHECK (boost >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)`;

const createTableQueryItems = `
CREATE TABLE items (
  id BIGSERIAL,
  coordinates GEOGRAPHY(Point, 4326) NOT NULL,
  first_picture BIGINT NOT NULL,
  pictures BIGINT[] NOT NULL,
  original_price INTEGER NOT NULL CHECK (original_price >= 0),
  euro_price INTEGER NOT NULL CHECK (euro_price >= 0),
  user_id UUID NOT NULL,
  firm_id UUID,
  realtor_fee_percentage REAL CHECK (realtor_fee_percentage >= 0),
  type SMALLINT NOT NULL CHECK (type >= 0),
  size SMALLINT NOT NULL CHECK (size >= 0),
  plot SMALLINT CHECK (plot >= 0),
  bed SMALLINT NOT NULL CHECK (bed >= 0),
  bath SMALLINT NOT NULL CHECK (bath >= 0),
  floor SMALLINT,
  floors SMALLINT CHECK (floors >= 1),
  heating SMALLINT CHECK (heating >= 0),
  utility_cost SMALLINT CHECK (utility_cost >= 0),
  deposit SMALLINT CHECK (deposit >= 0),
  like_count SMALLINT NOT NULL CHECK (like_count >= 0),
  firm_boost SMALLINT CHECK (firm_boost >= 0),
  pets_allowed SMALLINT NOT NULL CHECK (bed >= 0),
  cooling BOOLEAN,
  elevator BOOLEAN,
  garden BOOLEAN,
  swimming_pool BOOLEAN,
  parking BOOLEAN,
  council_home BOOLEAN,
  is_deleted BOOLEAN,
  auction_date DATE,
  address VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255),
  nation VARCHAR(255) NOT NULL,
  currency_name VARCHAR(50) NOT NULL,
  currency_symbol VARCHAR(5) NOT NULL,
  currency_code CHAR(3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, type)
) PARTITION BY RANGE (type)`;

const createTableQueryMessages = `
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  related_item_id BIGSERIAL NOT NULL,
  related_item_type SMALLINT NOT NULL,
  content VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)`;

async function createTables() {
  try {
    await client.connect();

    await client.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await client.query("DROP TABLE IF EXISTS users, firms, items, messages;");

    await client.query(createTableQueryUsers);
    await client.query(createTableQueryFirms);
    await client.query(createTableQueryItems);
    await client.query(createTableQueryMessages);

    await client.query(`CREATE TABLE items_type_0_rent_apartment PARTITION OF items FOR VALUES FROM (1) TO (2);`);
    await client.query(`CREATE TABLE items_type_0_rent_house PARTITION OF items FOR VALUES FROM (2) TO (3);`);
    await client.query(`CREATE TABLE items_type_0_rent_shared PARTITION OF items FOR VALUES FROM (3) TO (4);`);
    await client.query(`CREATE TABLE items_type_0_buy_apartment PARTITION OF items FOR VALUES FROM (4) TO (5);`);
    await client.query(`CREATE TABLE items_type_0_buy_house PARTITION OF items FOR VALUES FROM (5) TO (6);`);
    await client.query(`CREATE TABLE items_type_0_buy_land PARTITION OF items FOR VALUES FROM (6) TO (7);`);

    await client.query(`CREATE TABLE items_type_1_rent_apartment PARTITION OF items FOR VALUES FROM (7) TO (8);`);
    await client.query(`CREATE TABLE items_type_1_rent_house PARTITION OF items FOR VALUES FROM (8) TO (9);`);
    await client.query(`CREATE TABLE items_type_1_rent_shared PARTITION OF items FOR VALUES FROM (9) TO (10);`);
    await client.query(`CREATE TABLE items_type_1_buy_apartment PARTITION OF items FOR VALUES FROM (10) TO (11);`);
    await client.query(`CREATE TABLE items_type_1_buy_house PARTITION OF items FOR VALUES FROM (11) TO (12);`);
    await client.query(`CREATE TABLE items_type_1_buy_land PARTITION OF items FOR VALUES FROM (12) TO (13);`);

    await client.query(`CREATE TABLE items_type_2_rent_apartment PARTITION OF items FOR VALUES FROM (13) TO (14);`);
    await client.query(`CREATE TABLE items_type_2_rent_house PARTITION OF items FOR VALUES FROM (14) TO (15);`);
    await client.query(`CREATE TABLE items_type_2_rent_shared PARTITION OF items FOR VALUES FROM (15) TO (16);`);
    await client.query(`CREATE TABLE items_type_2_buy_apartment PARTITION OF items FOR VALUES FROM (16) TO (17);`);
    await client.query(`CREATE TABLE items_type_2_buy_house PARTITION OF items FOR VALUES FROM (17) TO (18);`);
    await client.query(`CREATE TABLE items_type_2_buy_land PARTITION OF items FOR VALUES FROM (18) TO (19);`);

    await client.query("CREATE INDEX idx_coordinates ON items USING GIST(coordinates);");

    // await client.query('CREATE INDEX idx_composite_filter ON items (sale_type, item_type, euro_price, created_at, coordinates, original_price, size, currency_code, currency_name, currency_symbol, first_picture);');
    // await client.query('CREATE INDEX idx_composite_filter ON items USING GIST(coordinates) INCLUDE (sale_type, item_type, euro_price, created_at, original_price, size, currency_code, currency_name, currency_symbol, first_picture);');
    // await client.query('CREATE INDEX idx_composite_filter ON items USING GIST(coordinates) INCLUDE (euro_price, created_at, original_price, size, currency_code, currency_name, currency_symbol, first_picture);');

    await client.query(`
		ALTER TABLE items
		ADD CONSTRAINT fk_items_users
		FOREIGN KEY (user_id)
		REFERENCES users (id);

		ALTER TABLE items
		ADD CONSTRAINT fk_items_firms
		FOREIGN KEY (firm_id)
		REFERENCES firms (id);

		ALTER TABLE users
		ADD CONSTRAINT fk_users_firms
		FOREIGN KEY (firm_id)
		REFERENCES firms (id);

		ALTER TABLE messages
		ADD CONSTRAINT fk_messages_users_sender
		FOREIGN KEY (sender_id)
		REFERENCES users (id);

		ALTER TABLE messages
		ADD CONSTRAINT fk_messages_users_receiver
		FOREIGN KEY (receiver_id)
		REFERENCES users (id);

		ALTER TABLE messages
		ADD CONSTRAINT fk_messages_items
		FOREIGN KEY (related_item_id, related_item_type)
		REFERENCES items (id, type);  
    `);

    console.log("Tables created successfully.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.end();
  }
}

createTables();
