exports.up = function (knex, Promise) {
    return knex.schema.createTable('animal', function (t) {
        t.increments('id').primary()
        t.string('name').notNullable()
        t.string('color').notNullable()
        t.timestamps(false, true)
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('animal')
};