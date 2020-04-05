require('dotenv').config()

const mongoose = require('mongoose')
const db = process.env.NODE_ENV === 'production' ? process.env.DATABASE : 'mongodb://localhost:27017/rickmorty'

mongoose.connect(db, { useNewUrlParser: true })
mongoose.Promise = global.Promise
mongoose.set('useCreateIndex', true)

mongoose.connection.on('error', err => {
  console.error(`→ ${err.message}`)
})

const models = require('../models')

return Promise.all([
	models.location.updateUrls(),
	models.episode.updateUrls(), 
	models.character.updateUrls()
])
.then(function() {
	console.log('finish');
	process.exit(0);
});

