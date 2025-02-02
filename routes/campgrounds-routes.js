const express = require('express')
const router = express.Router()
const Campground = require('../models/campground');

router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    // pass campgrounds to the index.ejs file via res.render
    res.render('campgrounds/index', { campgrounds })
});
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', async (req, res, next) => {
    try {
        console.log('==41==req', req.body)
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`)
    } catch(err) {
        next(err)
    }
})

router.get('/:id', async (req, res, next) => {
    console.log('==49==', req.params)
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        return next(new AppError('Product not found', 404))
    }
    res.render('campgrounds/show', { campground });
});

router.get('/:id/edit', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground });
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

module.exports = router