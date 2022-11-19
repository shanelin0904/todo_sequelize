
const express = require('express')
const router = express.Router()
const home = require('./modules/home')
const auth = require('./modules/auth')
const users = require('./modules/user')
const todos = require('./modules/todo')
const { authenticator } = require('../middlewares/auth')

router.use('/auth', auth)
router.use('/users', users)
router.use('/todos', authenticator, todos)
router.use('/', authenticator, home)

router.use('*', (req, res) => {
  res.status(404).send('404找不到')
})
router.use((err, req, res, next) => {
  const errMsgs = err.message

  res.status(500).render('index', { errMsgs })
})
module.exports = router