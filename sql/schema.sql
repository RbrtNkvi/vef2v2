-- Útfæra schema
CREATE TABLE IF NOT EXISTS vidburdir(
  id serial primary key,
  name varchar(64) not null,
  slug varchar(64) not null,
  description text,
  created timestamp with time zone not null
    default CURRENT_TIMESTAMP,
  signed timestamp with time zone not null
    default CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skraningar (
  id serial primary key,
  name varchar(64) NOT NULL,
  comment text,
  event int not null,
  created timestamp with time zone not null
    default CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notendur (
  id serial primary key,
  username varchar(64) UNIQUE not null,
  password varchar(256) not null
);
