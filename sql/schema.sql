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
