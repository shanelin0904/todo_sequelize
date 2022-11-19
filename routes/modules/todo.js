const express = require('express')
const assert = require('assert')
const { validationResult } = require('express-validator')
const router = express.Router()

const db = require('../../models')
const Todo = db.Todo
const { todoNewValidation } = require('../../middlewares/validation')

// 取得新增頁面
router.get('/new', (req, res) => {
  res.render('new')
})
// 新增一筆todo
router.post('/', todoNewValidation, async (req, res, next) => {
  const UserId = req.user.id
  const name = req.body.name
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const newtodoErr = errors.array().map(err => err.msg)
    return res.status(400).render('new', {
      name,
      newtodoErr,
    })
  }
  try {
    await Todo.create({ name, UserId })
    return res.redirect('/')
  } catch (err) {
    next(err)
  }
})

// 取得編輯頁面
router.get('/:id/edit', async (req, res, next) => {
  try {
    const id = req.params.id
    const UserId = req.user.id
    let todo = await Todo.findOne({ where: { id, UserId } })
    assert(todo, new Error('找不到這筆todo'))
    return res.render('edit', { todo: todo.toJSON() })
  } catch (err) {
    next(err)
  }
})
// 瀏覽單筆detail
router.get('/:id', async (req, res, next) => {
  const id = req.params.id
  const UserId = req.user.id
  try {
    let todo = await Todo.findOne({ where: { id, UserId } })
    assert(todo, new Error('找不到這筆todo'))
    return res.render('detail', { todo: todo.toJSON() })
  } catch (err) {
    next(err)
  }
})
// 送出編輯內容
router.put('/:id', todoNewValidation, async (req, res, next) => {
  const id = req.params.id
  const UserId = req.user.id
  let { name, isDone } = req.body
  try {
    const todo = await Todo.findOne({ where: { id, UserId } })
    assert(todo, new Error('找不到這筆todo'))
    todo.name = name
    todo.isDone = isDone === 'on'
    await todo.save()
    return res.redirect(`/todos/${id}`)
  } catch (err) {
    next(err)
  }
})

// 刪除一筆todo
router.delete('/:id', async (req, res, next) => {
  const id = req.params.id
  const UserId = req.user.id
  await Todo.destroy({ where: { id, UserId } })
  req.flash('deleted_msg', '刪除成功')
  return res.redirect('/')
})

module.exports = router