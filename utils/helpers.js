exports.site = process.env.API_URL ? process.env.API_URL : 'https://rickandmortyapi.com/api'

exports.message = {
  noPage: 'There is nothing here',
  noCharacter: 'Character not found',
  noLocation: 'Location not found',
  noEpisode: 'Episode not found',
  badParam: 'Hey! you must provide an id',
  badArray: 'Bad... bad array :/'
}

exports.collection = {
  exclude: '-_id -author -__v -edited',
  limit: 20,
  queries: {
    character: ['name', 'status', 'species', 'type', 'gender'],
    episode: ['name', 'episode'],
    location: ['name', 'dimension', 'type']
  }
}

exports.replace_url =  function(url) {
  if(url) {
    return url.replace('https://rickandmortyapi.com/api', process.env.API_URL)
  }
  return url;
};