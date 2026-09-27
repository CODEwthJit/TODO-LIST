export function up(pgm) {
  pgm.sql(`
    CREATE TABLE users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE "session" (
      sid VARCHAR NOT NULL PRIMARY KEY,
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL
    );

    CREATE INDEX "IDX_session_expire" ON "session" (expire);
  `);
}

export function down(pgm) {
  pgm.sql('DROP TABLE "session"; DROP TABLE users;');
}
