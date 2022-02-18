CREATE TABLE IF NOT EXISTS skraningar (
  id serial primary key,
  name varchar(64) NOT NULL,
  comment text,
  event int not null,
  created timestamp with time zone not null
    default CURRENT_TIMESTAMP
);
