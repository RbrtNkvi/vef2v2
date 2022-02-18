CREATE TABLE IF NOT EXISTS notendur (
  id serial primary key,
  username varchar(64) UNIQUE not null,
  password varchar(256) not null
);
