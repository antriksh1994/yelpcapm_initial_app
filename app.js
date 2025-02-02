const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan')
const ejsMate = require('ejs-mate')
const AppError = require('./AppErrors')
const campgroundsRoutes = require('./routes/campgrounds-routes')
const session = require('express-session')
const sessionConfig = {
    secret: 'thishouldbebettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
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

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
// to parse the req.body else it will be empty
// this will run on every single request
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session(sessionConfig))
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
    // res.send('YOU NEED A PASSWORD')
    res.status(401)
    throw new AppError('password required!', 401)
}
app.use('/campgrounds', campgroundsRoutes)
app.get('/', (req, res) => {
    res.render('home')
});
// to protect any route we can add this 
app.get('/secret', verifyPassword, (req,res) => {
    res.send('MY SECRET IS')
})
app.get('/admin', (req, res) => {
    throw new AppError('YOU ARE NOT ADMIN', 403)
 })

app.use((req,res) => {
    res.status(404).send('NOT FOUND!!')
})

// app.use((err, req, res, next) => {
//    console.log('***************************************');
//    console.log('******************ERROR****************');
//    console.log('***************************************');
//    console.log('err-', err)
//    next(err)
// //    res.status(500).send('OHH WE GOT AN ERROR!!')
// })
app.use((err, req, res, next) => {
    const {status = 500, message = "SOMETHING WENT WRONG" } = err
    res.status(status).send(message)
    })

app.listen(3000, () => {
    console.log('Serving on port 3000')
})