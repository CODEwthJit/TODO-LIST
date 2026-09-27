export function up(pgm) {
  pgm.addColumn('todos', {
    user_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'CASCADE',
    },
  });

  pgm.createIndex('todos', ['user_id', 'id']);
}

export function down(pgm) {
  pgm.dropIndex('todos', ['user_id', 'id']);
  pgm.dropColumn('todos', 'user_id');
}
