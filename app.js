if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const session = require('express-session')

const usePassport = require('./config/passport')
const flash = require('connect-flash')
const routes = require('./routes')

const exphbs = require('express-handlebars')
const methodOverride = require('method-override')

const app = express()
const PORT = 3000



// vie engine
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(session({
  secret: 'ThisIsMySecret',
  resave: false,
  saveUninitialized: true
}))

usePassport(app)
// middlewares
app.use(express.urlencoded({ extended: true }))// 解析request body
app.use(methodOverride('_method'))//改寫HTTP method

app.use(flash())
// 取得flash message
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.register_errs = req.flash('register_errs')
  res.locals.deleted_msg = req.flash('deleted_msg')
  next()
})

// router
app.use(routes)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
