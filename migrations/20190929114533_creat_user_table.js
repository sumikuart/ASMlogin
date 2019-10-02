
exports.up = function(knex) {
  return knex.schema.createTable('login_user', t => {
    //   t = table
    t.increments('id').unsigned().primary();
    t.string('email').notNull();
    t.string('password_digest').notNull();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('login_user');
};
