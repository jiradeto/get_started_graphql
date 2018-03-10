const _ = require('lodash');

const knex = require('knex')(require('../knexfile.js'))
const Authors = require('../data/authors.js');
const Posts = require('../data/posts.js');

/* Here a simple schema is constructed without using the GraphQL query language. 
  e.g. using 'new GraphQLObjectType' to create an object type 
*/

let {
    // These are the basic GraphQL types need in this tutorial
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLObjectType,
    GraphQLInputObjectType,
    // This is used to create required fileds and arguments
    GraphQLNonNull,
    // This is the class we need to create the schema
    GraphQLSchema,
} = require('graphql');

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represent an author",
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString)
        },
        name: {
            type: new GraphQLNonNull(GraphQLString)
        },
        twitterHandle: {
            type: GraphQLString
        }
    })
});

const PostType = new GraphQLObjectType({
    name: "Post",
    description: "This represent a Post",
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString)
        },
        title: {
            type: new GraphQLNonNull(GraphQLString)
        },
        body: {
            type: GraphQLString
        },
        author: {
            type: AuthorType,
            resolve: function (post) {
                return _.find(Authors, a => a.id == post.author_id);
            }
        }
    })
});

const getAnimal = (id) => {
    console.log('getAnimal ID: ' + id);
    return knex('animal')
        .where('id', id)
        .then((animal) => {
            return animal;
        }).catch((err) => console.log('Error' + err));
}

const getAnimals = (args) => {
    console.log('get Animal' + JSON.stringify(args));
    return knex('animal')
        .where('name', 'like', "%" + args.name + "%")
        .andWhere('color', 'like', "%" + args.color + "%")
        .then((row) => {
            console.log('eiri' + row)
            return row;
        })
}

const AnimalType = new GraphQLObjectType({
    name: "Animal",
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString)
        },
        name: {
            type: new GraphQLNonNull(GraphQLString)
        },
        color: {
            type: new GraphQLNonNull(GraphQLString)
        }
    })
});

const AnimalInputType = new GraphQLInputObjectType({
    name: 'AnimalInput',
    fields: () => ({
        name: {
            type: new GraphQLNonNull(GraphQLString)
        },
        color: {
            type: new GraphQLNonNull(GraphQLString)
        }
    })
});

const createAnimal = (args) => {
    console.log('Pond here' + JSON.stringify(args));
    // Returns [1] in "mysql", "sqlite", "oracle"; [] in "postgresql" unless the 'returning' parameter is set.
    knex('animal')
        .returning('id')
        .insert({
            name: args.animal.name,
            color: args.animal.color
        }).then((id) => (getAnimal(id[0])))
        .catch((error) => (
            console.log(error)
        ))
}

const addAnimal = (animal) => (
    knex('animal')
    .insert({
        name: animal.name,
        color: animal.color
    })
    .then(
        (animal) => (
            console.log('this is result of animal: ' + animal)
        )
    )
    .catch((error) => (
        console.log(error)
    ))
);

// Mutation
const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Functions to add things to the database.',
    fields: () => ({
        addAnimal: {
            type: AnimalType,
            args: {
                animal: {
                    type: AnimalInputType
                }
            },
            resolve: (_, args) => {
                return createAnimal(args);
            },
        }
    }),
});

// This is the Root Query
const BlogQueryRootType = new GraphQLObjectType({
    name: 'BlogAppSchema',
    description: "Blog Application Schema Root",
    fields: () => ({
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of all Authors",
            resolve: function () {
                return Authors
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            description: "List of all Posts",
            resolve: function () {
                return Posts
            }
        },
        animals: {
            type: new GraphQLList(AnimalType),
            description: "List of all Animals ",
            args: {
                name: {
                    description: 'The name of the animal',
                    type: GraphQLString
                },
                color: {
                    description: 'The color of the animal',
                    type: GraphQLString
                }
            },
            resolve: (_, args) => {
                return getAnimals({
                    name: args.name || '',
                    color: args.color || '',
                });
            }
        },
        animal: {
            type: AnimalType,
            args: {
                id: {
                    type: GraphQLInt
                }
            },
            resolve: (_, args) => {
                return getAnimal(args.id);
            },
        }

    })
});

// This is the schema declaration
const BlogAppSchema = new GraphQLSchema({
    query: BlogQueryRootType,
    mutation: mutationType
});

module.exports = BlogAppSchema;



/*
mutation CreateAnimal($input: AnimalInput!) {
    addAnimal(animal: $input) {
      name
      color    
    }
  }



  - VARIABLE - 

  {
  "input": {
    "name": "Lion",
    "color": "Orange"
  }
}


  */