const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./src/schema.js');
var bodyParser = require('body-parser');

let port = 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', graphqlHTTP({
    schema: schema,
    graphiql: true //set to false if you don't want graphiql enabled
}));

app.listen(port);
console.log('GraphQL API server running at localhost:' + port);