const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const { collection } = require('../utils/helpers')
const { replace_url } = require('../utils/helpers')


const { Schema } = mongoose

const episodeSchema = new Schema({
  id: Number,
  name: String,
  episode: String,
  air_date: String,
  characters: [ String ],
  url: String,
  created: Date
})

episodeSchema.statics.structure = ch => {
  const m = ({ id, name, air_date, episode, characters, url, created }) => ({
    id,
    name,
    air_date,
    episode,
    characters,
    url,
    created
  })

  return Array.isArray(ch) ? ch.map(ch => m(ch)) : m(ch)
}

episodeSchema.statics.findAndCount = async function({ name, episode, skip }) {
  const q = key => new RegExp(key && key.replace(/[^\w\s]/g, '\\$&'), 'i')

  const query = {
    name: q(name),
    episode: q(episode)
  }

  const [data, count] = await Promise.all([
    this.find(query).sort({ id: 1 }).select(collection.exclude).limit(collection.limit).skip(skip),
    this.find(query).countDocuments()
  ])

  const results = this.structure(data)

  return { results, count }
}

episodeSchema.plugin(mongodbErrorHandler)

episodeSchema.statics.updateUrls = function() {
  // Replace objects url with API_URL const
  if(process.env.API_URL && process.env.API_URL !== 'https://rickandmortyapi.com/api') {  
    episodeModel = this;

    return episodeModel.find().exec().then(function(episodes) {
      promises = [];

      console.log(`${episodes.length} episodes found.`)
      for(var i = 0; i < episodes.length; i++) {
        ep = episodes[i];
        updated_characters = [];

        if(ep.characters && ep.characters.length > 0) {
          for(var j = 0; j < ep.characters.length; j++) {
            updated_characters.push(replace_url(ep.characters[j]));
          }
        } else {
          updated_characters = ep.characters
        }

        promises.push(episodeModel.updateOne({_id: ep._id}, {
          $set: {
            'url': replace_url(ep.url),
            'characters' : updated_characters
          }
        }).exec());
      }

      return Promise.all(promises)
    });
  }
};

module.exports = mongoose.model('Episode', episodeSchema)
