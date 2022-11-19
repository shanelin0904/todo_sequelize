const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
module.exports = app => {
  // middleware
  app.use(passport.initialize())
  app.use(passport.session())

  // 設定strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } })
          if (!user) {
            return done(
              null,
              false,
              req.flash('error_messages', 'Email does not exists.')
            )
          }
          const isMatch = await bcrypt.compare(password, user.password)
          if (!isMatch) {
            return done(
              null,
              false,
              req.flash('error_messages', 'Email or password incorrect!')
            )
          }
          return done(null, user)
        } catch (err) {
          return done(err, false)
        }
      }
    )
  )

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK,
        profileFields: ['email', 'displayName'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { email, name } = profile._json
          const user = await User.findOne({ where: { email } })
          if (user) return done(null, user) // 有找到使用者就通過驗證，放行進去使用服務
          // 如果資料庫還沒有使用者
          const randomPassword = Math.random().toString(32).slice(-10) // 產生隨機密碼給使用者塞到DB
          const salt = await bcrypt.genSalt(10)
          const hash = await bcrypt.hash(randomPassword, salt)
          const userCreated = await User.create({ name, email, password: hash })
          return done(null, userCreated)
        } catch (err) {
          done(err, false)
        }
      }
    )
  )
  // 設定序列化和反序列化
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await User.findByPk(id)
      user = user.toJSON()
      done(null, user)
    } catch (err) {
      done(err, null)
    }
  })
}