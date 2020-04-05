const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const { collection } = require('../utils/helpers')
const { replace_url } = require('../utils/helpers')

const { Schema } = mongoose

const characterSchema = new Schema({
  id: Number,
  name: String,
  species: String,
  type: String,
  status: String,
  location: { type: Schema.ObjectId, ref: 'Location' },
  origin: { type: Schema.ObjectId, ref: 'Location' },
  gender: String,
  episode: [ String ],
  image: String,
  url: String,
  created: Date
})

function autopopulate(next) {
  this.populate({ path: 'location', select: 'name url -_id' })
  this.populate({ path: 'origin', select: 'name url -_id' })
  next()
}

characterSchema.pre('find', autopopulate)
characterSchema.pre('findOne', autopopulate)

characterSchema.statics.structure = ch => {
  const m = ({ id, name, status, species, type, gender, origin, location, image, episode, url, created }) => ({
    id,
    name,
    status,
    species,
    type,
    gender,
    origin,
    location,
    image,
    episode,
    url,
    created
  })

  return Array.isArray(ch) ? ch.map(ch => m(ch)) : m(ch)
}

characterSchema.statics.findAndCount = async function({ name, type, status, species, gender, skip }) {
  const q = key => new RegExp(key && ( /^male/i.test(key) ? `^${key}` : key.replace(/[^\w\s]/g, '\\$&') ), 'i')

  const query = {
    name: q(name),
    status: q(status),
    species: q(species),
    type: q(type),
    gender: q(gender)
  }

  const [data, count] = await Promise.all([
    this.find(query).sort({ id: 1 }).select(collection.exclude).limit(collection.limit).skip(skip),
    this.find(query).countDocuments()
  ])

  const results = this.structure(data)

  return { results, count }
}

characterSchema.plugin(mongodbErrorHandler)

characterSchema.statics.updateUrls = function() {
  // Replace objects url with API_URL const
  if(process.env.API_URL && process.env.API_URL !== 'https://rickandmortyapi.com/api') {  
    characterModel = this;

    return characterModel.find().exec().then(function(characters) {
      promises = [];

      console.log(`${characters.length} characters found.`)
      for(var i = 0; i < characters.length; i++) {
        c = characters[i];

        updated_episodes = [];

        if(c.episode && c.episode.length > 0) {
          for(var j = 0; j < c.episode.length; j++) {
            updated_episodes.push(replace_url(c.episode[j]));
          }
        } else {
          updated_episodes = c.episode
        }

        promises.push(characterModel.updateOne({_id: c._id}, {
          $set: {
            'url': replace_url(c.url),
            'image': replace_url(c.image),
            'episode': updated_episodes
          }
        }).exec());
      }

      return Promise.all(promises)
    });
  }
};

module.exports = mongoose.model('Character', characterSchema)
