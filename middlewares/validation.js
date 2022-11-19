const { body } = require('express-validator')
const db = require('../models')
const User = db.User

module.exports = {
  registerValidation: [
    body('name').not().isEmpty().withMessage('請輸入名稱'),
    body('email')
      .isEmail()
      .trim()
      .withMessage('請輸入email')
      .bail()
      .custom(async email => {
        const user = await User.findOne({ where: { email } })
        if (user) {
          throw new Error('這個email已經註冊了')
        }
        return true
      }),
    body('password').not().isEmpty().trim().withMessage('請輸入密碼'),
    body('confirmPassword')
      .not()
      .isEmpty()
      .trim()
      .withMessage('請輸入確認密碼')
      .bail()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('密碼和確認密碼不相符')
        }
        return true
      }),
  ],
  todoNewValidation: [
    body('name').not().isEmpty().withMessage('請輸入todo內容'),
  ],
}