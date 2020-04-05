require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const { ApolloServer } = require('apollo-server-express')

const app = express()

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
const { Character, Location, Episode } = require('./graphql/sources')

const handle = require('./handlers')
const api = require('./routes/api')

const db = process.env.NODE_ENV === 'production' ? process.env.DATABASE : 'mongodb://localhost:27017/rickmorty'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  validationRules: [ handle.depth(4) ],
  dataSources: () => ({
    character: new Character(),
    location: new Location(),
    episode: new Episode()
  })
})

mongoose.connect(db, { useNewUrlParser: true })
mongoose.Promise = global.Promise
mongoose.set('useCreateIndex', true)

mongoose.connection.on('error', err => {
  console.error(`→ ${err.message}`)
})

if (app.get('env') !== 'test') {
  app.use(morgan(':status | :method :url :response-time ms | :remote-addr', {
    skip: req => req.method !== 'GET'
  }))
}

// Replace objects url with API_URL const

if(process.env.API_URL && process.env.API_URL !== 'https://rickandmortyapi.com/api') {
  replace_func = function(url) {
    return url.replace('https://rickandmortyapi.com/api', process.env.API_URL)
  }
  
  mongoose.collection('episodes').find().forEach(function(ep) {
    chars_2 = [];

    for(var i = 0; i < ep.characters.length; i++) {
      chars_2.append(replace_func(ep.characters[i]));
    }

    mongoose.collection('episodes').update({_id: ep._id}, {
      $set: {
        'url': replace_func(ep.url)

      }
    });
  });
}

app.use(cors())

app.set('trust proxy', 1)

app.use(express.static(path.join(__dirname, 'static')))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/api', api)

server.applyMiddleware({ app })

app.use(handle.error.notFound)
app.use(handle.error.productionErrors)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log('\x1b[34m%s\x1b[0m', `
  ${app.get('env').toUpperCase()}

  REST      → http://localhost:${PORT}/api/
  GraphQL   → http://localhost:${PORT}${server.graphqlPath}/
  Database  → ${mongoose.connection.host}/${mongoose.connection.name}
  `
))

module.exports = app
