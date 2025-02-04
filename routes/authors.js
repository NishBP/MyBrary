const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// All authors route
router.get('/', (req, res) => {
    res.render('authors/index')
})

// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})

// Create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        if (req.body.name === '') {
            throw new Error('Name is required')
        }
        const newAuthor = await author.save()
        res.redirect('authors')
    } catch (err) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author: ' + (err.message || 'Unknown error')
        })
    }
})

module.exports = router