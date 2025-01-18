package main

import (
	"fmt"
	"log"

	"github.com/Ali5937/fb-solid-start/backend-go/pgdb"
	"github.com/lib/pq"
)

func createTables() {

	createTableQueryUsers := `
	CREATE TABLE users (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		firm_id UUID,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		refresh_token TEXT
	)`

	createTableQueryFirms := `
	CREATE TABLE firms (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		verified BOOLEAN NOT NULL,
		boost SMALLINT CHECK (boost >= 0),
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	)`

	createTableQueryItems := `
	CREATE TABLE items (
		id BIGSERIAL,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
		euro_price INTEGER NOT NULL CHECK (euro_price >= 0),
		type SMALLINT NOT NULL CHECK (type >= 0),
		size SMALLINT NOT NULL CHECK (size >= 0),
		bed SMALLINT NOT NULL CHECK (bed >= 0),
		bath SMALLINT NOT NULL CHECK (bath >= 0),
		like_count SMALLINT NOT NULL CHECK (like_count >= 0),
		ranking SMALLINT NOT NULL CHECK (ranking >= 0),
		first_picture SMALLINT NOT NULL,
		is_active BOOLEAN NOT NULL DEFAULT TRUE,
		coordinates GEOGRAPHY(Point, 4326) NOT NULL,
		original_price BIGINT NOT NULL CHECK (original_price >= 0),
		country TEXT NOT NULL,
		state TEXT NOT NULL,
		city TEXT NOT NULL,
		currency_name TEXT NOT NULL,
		currency_symbol TEXT NOT NULL,
		currency_code CHAR(3) NOT NULL,
		plot SMALLINT CHECK (plot >= 0),
		firm_boost SMALLINT CHECK (firm_boost >= 0),
		floor SMALLINT,
		floors SMALLINT CHECK (floors >= 1),
		heating SMALLINT CHECK (heating >= 0),
		utility_cost SMALLINT CHECK (utility_cost >= 0),
		deposit SMALLINT CHECK (deposit >= 0),
		pets_allowed BOOLEAN,
		cooling BOOLEAN,
		elevator BOOLEAN,
		garden BOOLEAN,
		swimming_pool BOOLEAN,
		parking BOOLEAN,
		council_home BOOLEAN,
		auction_date DATE,
		user_id UUID NOT NULL,
		firm_id UUID,
		created_at DATE DEFAULT CURRENT_TIMESTAMP NOT NULL,
		PRIMARY KEY (id, type)
	) PARTITION BY RANGE (type)`

	createTableQueryItemPictures := `
	CREATE TABLE item_pictures (
    item_id BIGINT,
    item_type SMALLINT,
		pictures SMALLINT[] NOT NULL
  )`

	createTableQueryMessages := `
	CREATE TABLE messages (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		sender_id UUID NOT NULL,
		receiver_id UUID NOT NULL,
		related_item_id BIGSERIAL NOT NULL,
		related_item_type SMALLINT NOT NULL,
		content TEXT NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
	)`

	db, err := pgdb.InitDB()
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	_, err = db.Exec("CREATE EXTENSION IF NOT EXISTS postgis;")
	if err != nil {
		log.Fatalf("Error creating extension postgis: %v", err)
	}

	_, err = db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
	if err != nil {
		log.Fatalf("Error creating extension uuid-ossp: %v", err)
	}

	_, err = db.Exec("DROP TABLE IF EXISTS users, firms, items, item_pictures, messages;")
	if err != nil {
		log.Fatalf("Error dropping existing tables: %v", err)
	}

	_, err = db.Exec(createTableQueryUsers)
	if err != nil {
		log.Fatalf("Error creating users table %v", err)
	}

	_, err = db.Exec(createTableQueryFirms)
	if err != nil {
		log.Fatalf("Error creating firms table %v", err)
	}

	_, err = db.Exec(createTableQueryItems)
	if err != nil {
		log.Fatalf("Error creating items table %v", err)
	}

	_, err = db.Exec(createTableQueryItemPictures)
	if err != nil {
		log.Fatalf("Error creating item_pictures table %v", err)
	}

	_, err = db.Exec(createTableQueryMessages)
	if err != nil {
		log.Fatalf("Error creating messages table %v", err)
	}

	_, err = db.Exec(`CREATE TABLE items_type_0_rent_apartment PARTITION OF items FOR VALUES FROM (1) TO (2);
		CREATE TABLE items_type_0_rent_house PARTITION OF items FOR VALUES FROM (2) TO (3);
		CREATE TABLE items_type_0_rent_shared PARTITION OF items FOR VALUES FROM (3) TO (4);
		CREATE TABLE items_type_0_buy_apartment PARTITION OF items FOR VALUES FROM (4) TO (5);
		CREATE TABLE items_type_0_buy_house PARTITION OF items FOR VALUES FROM (5) TO (6);
		CREATE TABLE items_type_0_buy_land PARTITION OF items FOR VALUES FROM (6) TO (7);
		CREATE TABLE items_type_1_rent_apartment PARTITION OF items FOR VALUES FROM (7) TO (8);
		CREATE TABLE items_type_1_rent_house PARTITION OF items FOR VALUES FROM (8) TO (9);
		CREATE TABLE items_type_1_rent_shared PARTITION OF items FOR VALUES FROM (9) TO (10);
		CREATE TABLE items_type_1_buy_apartment PARTITION OF items FOR VALUES FROM (10) TO (11);
		CREATE TABLE items_type_1_buy_house PARTITION OF items FOR VALUES FROM (11) TO (12);
		CREATE TABLE items_type_1_buy_land PARTITION OF items FOR VALUES FROM (12) TO (13);
		CREATE TABLE items_type_2_rent_apartment PARTITION OF items FOR VALUES FROM (13) TO (14);
		CREATE TABLE items_type_2_rent_house PARTITION OF items FOR VALUES FROM (14) TO (15);
		CREATE TABLE items_type_2_rent_shared PARTITION OF items FOR VALUES FROM (15) TO (16);
		CREATE TABLE items_type_2_buy_apartment PARTITION OF items FOR VALUES FROM (16) TO (17);
		CREATE TABLE items_type_2_buy_house PARTITION OF items FOR VALUES FROM (17) TO (18);
		CREATE TABLE items_type_2_buy_land PARTITION OF items FOR VALUES FROM (18) TO (19);`)
	if err != nil {
		log.Fatalf("Error creating partition: %v", err)
	}

	_, err = db.Exec("CREATE INDEX idx_coordinates ON items USING GIST(coordinates);")
	if err != nil {
		log.Fatalf("Error creating index: %v", err)
	}

	_, err = db.Exec(`
		ALTER TABLE items
		ADD CONSTRAINT fk_items_users
		FOREIGN KEY (user_id)
		REFERENCES users (id);

		ALTER TABLE items
		ADD CONSTRAINT fk_items_firms
		FOREIGN KEY (firm_id)
		REFERENCES firms (id);
	
    ALTER TABLE items
    ADD CONSTRAINT fk_items_cities
    FOREIGN KEY (city, state, country, ranking)
    REFERENCES cities (city_name, state_name, country_name, ranking);

    ALTER TABLE items
    ADD CONSTRAINT fk_items_states
    FOREIGN KEY (state, country)
    REFERENCES states (state_name, country_name);

    ALTER TABLE items
		ADD CONSTRAINT fk_items_countries
		FOREIGN KEY (country)
		REFERENCES countries (country_name);

    ALTER TABLE item_pictures
		ADD CONSTRAINT fk_items_item_pictures
		FOREIGN KEY (item_id, item_type)
		REFERENCES items (id, type)
    ON DELETE CASCADE;

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
    `)
	if err != nil {
		log.Fatalf("Error altering tables %v", err)
	}

	testTables()

	fmt.Printf("Tables created successfully")
}

func testTables() {
	testUserInsert := `
	INSERT INTO users (email, password_hash)
	VALUES ('testuser@example.com', 'testpasswordhash')
	RETURNING id;`

	testItemInsert := `
	INSERT INTO items (
		coordinates, first_picture, original_price, user_id, euro_price, type,
		size, bed, bath, like_count, pets_allowed, ranking,
		city, state, country, currency_name, currency_symbol, currency_code,
		is_active, cooling, garden, firm_boost, plot
	)
	VALUES (
		ST_GeomFromText('POINT(52.502362434 13.404364548)', 4326), 1, 100, $1, 90, 1,
		50, 2, 1, 10, true, 2,
		'Prizren', 'Prizren', 'Kosovo', 'Euro', '€', 'EUR',
		true, true, false, 1, 2344
	)
	RETURNING id, type;`

	db, err := pgdb.InitDB()
	if err != nil {
		log.Fatalf("Error opening database for test: %v", err)
	}

	var userID string
	err = db.QueryRow(testUserInsert).Scan(&userID)
	if err != nil {
		log.Fatalf("Error inserting test user: %v", err)
	}
	fmt.Printf("Inserted test user with ID: %s\n", userID)
	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Error with transaction create tables: %v", err)
	}
	defer tx.Rollback()

	var itemID int64
	var itemType int
	err = tx.QueryRow(testItemInsert, userID).Scan(&itemID, &itemType)
	if err != nil {
		log.Fatalf("Error inserting test item: %v", err)
	}
	fmt.Printf("Inserted test item with ID: %d, Type: %d\n", itemID, itemType)

	_, err = tx.Exec(`
    INSERT INTO item_pictures (item_id, item_type, pictures)
    VALUES ($1, $2, $3)`,
		itemID, itemType,
		pq.Array([]int16{12346, 5486, 1847, 3756, 734, 31, 1, 93, 34, 4, 45, 127, 9, 47, 24, 6, 467, 2377, 48, 22442}))

	if err != nil {
		log.Fatalf("Error inserting into pictures: %v", err)
	}

	if err = tx.Commit(); err != nil {
		log.Fatalf("Error commiting transaction create tables: %v", err)
	}

	// Get row size for user
	var userRowSize int64
	err = db.QueryRow(`
		SELECT pg_column_size(t)
		FROM (SELECT * FROM users WHERE id = $1) AS t;
	`, userID).Scan(&userRowSize)
	if err != nil {
		log.Fatalf("Error getting user row size: %v", err)
	}
	fmt.Printf("Size of user row in bytes: %d\n", userRowSize)

	// Get row size for item
	var itemRowSize int64
	err = db.QueryRow(`
		SELECT pg_column_size(t)
		FROM (SELECT * FROM items WHERE id = $1 AND type = $2) AS t;
	`, itemID, itemType).Scan(&itemRowSize)
	if err != nil {
		log.Fatalf("Error getting item row size: %v", err)
	}

	_, err = db.Exec("DELETE FROM item_pictures")
	if err != nil {
		log.Fatalf("Error deleting item_pictures in test: %v", err)
	}

	_, err = db.Exec("DELETE FROM items")
	if err != nil {
		log.Fatalf("Error deleting items in test: %v", err)
	}
	_, err = db.Exec("DELETE FROM users")
	if err != nil {
		log.Fatalf("Error deleting users in test: %v", err)
	}

	fmt.Printf("Size of item row in bytes: %d\n", itemRowSize)
}
