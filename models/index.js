var character = require('./Character'),
location = require('./Location'),
episode = require('./Episode');


replace_url =  function(url) {
  return url.replace('https://rickandmortyapi.com/api', process.env.API_URL)
};

// Replace objects url with API_URL const
if(process.env.API_URL && process.env.API_URL !== 'https://rickandmortyapi.com/api') {  
  episode.find().forEach(function(ep) {
    updated_characters = [];
    for(var i = 0; i < ep.characters.length; i++) {
      updated_characters.append(replace_url(ep.characters[i]));
    }

    episode.update({_id: ep._id}, {
      $set: {
        'url': replace_url(ep.url),
        'characters' : updated_characters
      }
    });
  });
}

module.exports = {
  character: character,
  location: location,
  episode: episode
}
