require('dotenv').config;
const express = require('express');
const app = express()
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000
const path = require('path')
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo')(session);
const passport = require('passport');
//const mySecret = process.env.COOKIE_SECRET;

//Database Connection
const url = 'mongodb://localhost/pizza';
mongoose.connect(url, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology:true, useFindAndModify:true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection failed...');
});

//Session store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

//Session Config
app.use(session({
    secret: `${process.env.COOKIE_SECRET}`,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*24}
    //cookie: {maxAge: 1000*15}
}))

//passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//assets
app.use(express.json())
app.use(express.urlencoded({extended:false}))

//global middlewares
app.use((req,res,next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

app.use(express.static("public"));
app.use(expressLayout)
app.set('views',path.join(__dirname, '/resources/views'))
app.set('view engine','ejs')

require('./routes/web')(app);


app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`)
})