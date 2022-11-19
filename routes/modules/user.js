const bcrypt = require('bcryptjs')
const express = require('express')
const passport = require('passport')
const { validationResult } = require('express-validator')
const db = require('../../models') // 會去抓index.js檔案的設定
const { registerValidation } = require('../../middlewares/validation')
const router = express.Router()
const User = db.User

// 取得login page
router.get('/login', (req, res) => {
  res.render('login')
})
// 使用者登入
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })
)

// 使用者註冊
router.get('/register', (req, res) => {
  res.render('register')
})

// 送出註冊資料
router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body
    // 若驗證不通過，回傳錯誤訊息
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const registerErrs = errors.array().map(err => err.msg)
      return res.status(400).render('register', {
        name,
        email,
        password,
        confirmPassword,
        registerErrs,
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    await User.create({ name, email, password: hash })
    return res.redirect('/')
  } catch (err) {
    next(err)
  }
})
// 使用者登出
router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err)
    }
  })
  req.flash('success_msg', '你已成功登出')
  return res.redirect('/users/login')
})

module.exports = router