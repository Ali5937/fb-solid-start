DROP DATABASE fb;
CREATE DATABASE fb;

CREATE TABLE users (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE firms (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    verified BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE firm_employees (
    firm_id UUID NOT NULL REFERENCES firms(id),
    employee_id UUID NOT NULL REFERENCES users(id),
    PRIMARY KEY (firm_id, employee_id)
);

CREATE TABLE items ( 
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	currency TEXT NOT NULL,
	measurement_units TEXT NOT NULL,
	nation TEXT NOT NULL,
	state TEXT,
	city TEXT NOT NULL,
	address TEXT,
	coordinates NUMERIC[] NOT NULL,
	sale_type TEXT NOT NULL,
	item_type TEXT NOT NULL,
	price INTEGER NOT NULL,
	size INTEGER NOT NULL,
	plot INTEGER,
	bed TEXT NOT NULL,
	bath TEXT NOT NULL,
	floors INTEGER,
	heating TEXT,
	cooling TEXT,
	utility_cost INTEGER,
	elevator BOOLEAN,
	garden BOOLEAN,
	swimming_pool BOOLEAN,
	parking BOOLEAN,
	pets_allowed BOOLEAN,
	realtor_fee INTEGER,
	like_count INTEGER NOT NULL,
	pictures_all TEXT[] NOT NULL,
	creator_id UUID NOT NULL REFERENCES users(id),
	firm_id UUID REFERENCES firms(id),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    related_item_id UUID NOT NULL REFERENCES items(id),
    content TEXT NOT NULL,
    attached_pictures TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


