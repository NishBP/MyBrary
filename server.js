if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

// Middleware
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}))

app.use((req, res, next) => {
    res.locals.errorMessage = null;
    next();
});

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/mybrary', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

// Routes
const indexRouter = require('./routes/index')
app.use('/', indexRouter)

const authorRouter = require('./routes/authors')
app.use('/authors', authorRouter)

const bookRouter = require('./routes/books')
app.use('/books', bookRouter)


// Start Server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app