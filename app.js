const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const morgan = require('morgan')

morgan('tiny')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
// to parse the req.body else it will be empty
// this will run on every single request
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(morgan('tiny'))
// app.use(morgan('common'))
app.use((req, res, next) => {
    console.log('==next==', req.method.toLocaleUpperCase(), req.path)
    next()
})
const verifyPassword = (req,res,next) => {
    const {password} = req.query
    console.log('==83==qury', password)
    if (password === 'aa') {
        next()
    }
    res.send('YOU NEED A PASSWORD')
}

app.get('/', (req, res) => {
    res.render('home')
});
// to protect any route we can add this 
app.get('/secret', verifyPassword, (req,res) => {
    res.send('MY SECRET IS')
})
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    // pass campgrounds to the index.ejs file via res.render
    res.render('campgrounds/index', { campgrounds })
});
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', async (req, res) => {
    console.log('==41==req', req.body)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req, res,) => {
    console.log('==49==', req.params)
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.use((req,res) => {
    res.status(404).send('NOT FOUND!!')
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})