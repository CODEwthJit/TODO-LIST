export function up(pgm) {
  pgm.sql(`
    CREATE TABLE todos (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);
}

export function down(pgm) {
  pgm.sql('DROP TABLE todos;');
}
