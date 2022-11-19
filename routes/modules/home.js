const assert = require('assert')
const express = require('express')
const router = express.Router()
const db = require('../../models')
const Todo = db.Todo

router.get('/', async (req, res, next) => {
  try {
    const UserId = req.user.id
    const todos = await Todo.findAll({
      where: { UserId },
      raw: true,
      nest: true,
    })
    assert(todos.length, new Error('目前還沒有todo事項'))
    return res.render('index', { todos })
  } catch (err) {
    next(err)
  }
})

module.exports = router
