const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')

// Getting the stuff involved with files to work
const multer = require('multer')
const path = require('path')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
// Make sure upload directory exists
const fs = require('fs')
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
}
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All/Search books route
router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    // filtering books by publish dates
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// Create book route
router.post('/', upload.single('cover'), async (req, res) => {
    console.log('File:', req.file)  // Log file info
    const fileName = req.file != null ? req.file.filename : null
    console.log('FileName:', fileName)  // Log filename

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    console.log('Book object:', book)  // Log book object before saving

    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch (error) {
        console.error('Error saving book:', error)  // Log the actual error
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false) {
    try{
        const authors = await Author.find({})
        const params = {authors: authors, book: book}
        if (hasError) params.errorMessage = 'Error creating book'
        res.render('books/new', params)
    }
    catch{
        res.redirect('/books')
    }
}
module.exports = router