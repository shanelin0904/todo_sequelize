const express = require('express')
const passport = require('passport')
const router = express.Router()

// 使用者按下facebook登入鈕，使用FB Oauth，請求FB給使用者email和公開檔案
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
)
// FB回傳使用者資料
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/users/login',
  })
)
module.exports = router