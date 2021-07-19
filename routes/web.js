const Menu  = require('../app/models/menu');

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
    app.get('/register',(req,res) => {
        res.render('auth/register');
    });
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

