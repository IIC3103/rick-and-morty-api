const express = require('express')
const { query } = require('express-validator')

const { catchErrors } = require('../handlers/errors')
const { site, collection } = require('../utils/helpers')
const operations = require('../controllers/handleOperations')
const { pagination, checkArray, showData, checkData, localhostOnly } = require('./middlewares')

const router = express.Router()

const sanitize = model => query(collection.queries[model]).trim()

const hooks = {
  find: [localhostOnly, pagination, catchErrors(operations.getAll), checkData, showData],
  findById: [localhostOnly, checkArray, catchErrors(operations.getById)]
}

router.get('/', (req, res) => {
  res.json({
    characters: `${site}/character`,
    locations: `${site}/location`,
    episodes: `${site}/episode`
  })
})

router.get('/character/avatar', (req, res) => res.redirect('/api/character'))

router.get('/character', sanitize('character'), hooks.find)
router.get('/character/:id', hooks.findById)

router.get('/location', sanitize('location'), hooks.find)
router.get('/location/:id', hooks.findById)

router.get('/episode', sanitize('episode'), hooks.find)
router.get('/episode/:id', hooks.findById)

module.exports = router
