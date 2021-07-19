const Menu  = require('../app/models/menu');
const User = require('../app/models/user')
const bcrypt = require('bcrypt');
const passport = require('passport');

function initRoutes(app){
    app.get('/', async(req,res) => {
        const pizzas = await Menu.find()
        res.render('home', {pizzas:pizzas})
    });

    app.get('/cart', (req,res) => {
        res.render('customers/cart');
    });
    app.get('/login', (req,res) => {
        res.render('auth/login');
    });
    app.post('/login', (req,res,next) => {
        passport.authenticate('local', (err,user,info)=>{
            if(err){
                req.flash('error',info.message)
                next(err)
            }
            if(!user){
                req.flash('error',info.message)
                res.redirect("/login") 
            }
            req.logIn(user, (err)=>{
                if(err){
                    req.flash('error',info.message)
                    next(err)
                }
                res.redirect('/')
            })
        })(req,res,next)
    })
    app.get('/register',(req,res) => {
        res.render('auth/register');
    });
    app.post('/register', async(req,res) => {
        const {name,email,password} = req.body
        //console.log(req.body)
        if(!name || !email || !password){
            req.flash('error','All fields are required')
            req.flash('name', name)
            req.flash('email', email)
            res.redirect('/register')
        }
        
        //Check if email exist
        User.exists({email: email}, (error,result) => {
            if(result){
                req.flash('error', 'Email already taken')
                req.flash('name',name)
                req.flash('email',email)
                res.redirect('/register')
            }
        })

        //Hash password
        const hashPassword = await bcrypt.hash(password, 10)

        //Create a user
        const user = new User({
            name: name,
            email: email,
            password: hashPassword
        })
        user.save().then((user) => {
            //Login
            res.redirect("/")
        }).catch((err) => {
            req.flash('error','Something went wrong')
            res.redirect('/register')
        })
    })

    app.post('/update-cart',(req,res) => {

//for the first time, create the cart and add basic object structure
//console.log(req.session)

       if(!req.session.cart){
           req.session.cart = {
               items:{

               },
               totalQty: 0,
               totalPrice: 0
           }
       }
       let cart = req.session.cart

       if(!cart.items[req.body._id]){
           cart.items[req.body._id] = {
               item: req.body,
               qty: 1
           }
           cart.totalQty = cart.totalQty + 1;
           cart.totalPrice = parseInt(cart.totalPrice) + parseInt(req.body.price)
       }
       else{
           cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1
           cart.totalQty = cart.totalQty + 1;
           cart.totalPrice = parseInt(cart.totalPrice) + parseInt(req.body.price)
       }
       res.json({totalQty: req.session.cart.totalQty });
    });
}


module.exports = initRoutes;

