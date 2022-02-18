-- Útfæra test gögn
INSERT INTO vidburdir
  (name, slug, description)
VALUES
  ('Forritarahittingur í febrúar', 'forritarahittingur-í-febrúar', 'Forritarar hittast í febrúar og forrita saman eitthvað frábært.');

INSERT INTO vidburdir
  (name, slug, description)
VALUES
  ('Hönnuðahittingur í mars', 'hönnuðahittingur-í-mars', 'Spennandi hittingur hönnuða í Hönnunarmars.');

INSERT INTO vidburdir
  (name, slug, description)
VALUES
  ('Verkefnastjórahittingur í apríl', 'verkefnastjórahittingur-í-apríl', 'Virkilega vel verkefnastýrður hittingur.');

INSERT INTO skraningar
  (name, comment, event)
VALUES
  ('Forvitinn forritari', 'Hlakka til að forrita með ykkur', 1);

INSERT INTO skraningar
  (name, event)
VALUES
  ('Jón Jónsson', 1);

INSERT INTO skraningar
  (name, comment, event)
VALUES
  ('Hungraður hönnuður', 'Verða veitingar?', 2);

INSERT INTO skraningar
  (name, comment, event)
VALUES
  ('Veikur verkefnastjóri', 'Vonandi kemst ég', 3);


