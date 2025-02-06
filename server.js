if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')

// Middleware
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}))

app.use((req, res, next) => {
    res.locals.errorMessage = null;
    next();
});

// MongoDB Connection
let cachedDb = null

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb
    }
    
    const db = await mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    
    cachedDb = db
    return db
}

// Connect to MongoDB before setting up routes
connectToDatabase()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err))

// Routes
const indexRouter = require('./routes/index')
app.use('/', indexRouter)

const authorRouter = require('./routes/authors')
app.use('/authors', authorRouter)

const bookRouter = require('./routes/books')
app.use('/books', bookRouter)

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

// Handle 404s
app.use((req, res) => {
    res.status(404).send('Page not found')
})

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

module.exports = app