const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const { collection } = require('../utils/helpers')
const { replace_url } = require('../utils/helpers')

const { Schema } = mongoose

const locationSchema = new Schema({
  id: Number,
  name: String,
  type: String,
  dimension: String,
  residents: [ String ],
  url: String,
  created: Date
})

locationSchema.statics.structure = ch => {
  const m = ({ id, name, type, dimension, residents, url, created }) => ({
    id,
    name,
    type,
    dimension,
    residents,
    url,
    created
  })
  return Array.isArray(ch) ? ch.map(ch => m(ch)) : m(ch)
}

locationSchema.statics.findAndCount = async function({ name, type, dimension, skip }) {
  const q = key => new RegExp(key && key.replace(/[^\w\s]/g, '\\$&'), 'i')

  const query = {
    name: q(name),
    type: q(type),
    dimension: q(dimension)
  }

  const [data, count] = await Promise.all([
    this.find(query).sort({ id: 1 }).select(collection.exclude).limit(collection.limit).skip(skip),
    this.find(query).countDocuments()
  ])

  const results = this.structure(data)

  return { results, count }
}

locationSchema.plugin(mongodbErrorHandler)

locationSchema.statics.updateUrls = function() {
  // Replace objects url with API_URL const
  if(process.env.API_URL && process.env.API_URL !== 'https://rickandmortyapi.com/api') {  
    locationModel = this;

    return locationModel.find().exec().then(function(locations) {
      promises = [];

      console.log(`${locations.length} locations found.`)
      for(var i = 0; i < locations.length; i++) {
        l = locations[i];

        updated_residents = [];

        if(l.residents && l.residents.length > 0) {
          for(var j = 0; j < l.residents.length; j++) {
            updated_residents.push(replace_url(l.residents[j]));
          }
        } else {
          updated_residents = l.residents
        }

        promises.push(locationModel.updateOne({_id: l._id}, {
          $set: {
            'url': replace_url(l.url),
            'residents': updated_residents
          }
        }).exec());
      }

      return Promise.all(promises)
    });
  }
};

module.exports = mongoose.model('Location', locationSchema)
