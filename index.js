const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Product = require('./models/merchandise');
const User = require('./models/user');
const { urlencoded } = require('express');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const { CLIENT_RENEG_LIMIT } = require('tls');
const Cart = require('./models/cart');
const select= [];
const price = [];
const price_value=[" Under ₹100"," ₹100 - ₹500"," Over ₹500"];

mongoose.connect('mongodb://localhost:27017/sxcdatabase', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
      console.log("Mongo Connection Open!!");
  })
  .catch(err => {
      console.log("ERROR");
      console.log(err);
  })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(session({ secret: 'aayushjagwani' , resave: false , saveUninitialized: true}));
app.use(flash());

categories = ['tshirt','hoodie','cap','mask','brooch'];
sizes = ['S','M','L','XL','XXL'];

app.get('/', (req,res) => {
    res.render('home',{login:req.session.user_id});
})


app.post('/signup',async (req,res)=>{
    const {Name,Email,Password,cPassword}=req.body;

    if(Password == cPassword ){
        const hash = await bcrypt.hash(Password,12);
        const user = new User({
        Name,Email,Password:hash
    });
    await user.save();
    let location="/"+req.body.add;
        res.redirect(location);
    }
    // res.send("Password donot match");
})

app.post('/login', async (req,res) =>{
    const {Email1,Password1}= req.body;
    const user = await User.findOne({Email: Email1});
    let url = req.headers.referer;
    spliturl = url.split("/");
    finalurl = spliturl[3];
    console.log(finalurl);
    if(!user)
    {
        req.flash('error', 'Incorrect Credentials, Try Again!');
        res.redirect('/login');
        
    }
    const validPwd = await bcrypt.compare(Password1, user.Password);
    if(validPwd)
    {
        req.session.user_id = user._id;
        var location="/".concat(req.body.add);
        console.log('logged in!! ',location);
        res.redirect(location);
    }
    else
    {
        reqflash('error', 'Incorrect Credentials, Try Again!');
        res.redirect('/login');
    }
} )

app.post('/logout', (req,res) => {
    req.session.destroy();
    let location="/"+req.body.add;
    res.redirect(location);
})

app.get('/merchandise', async (req,res) => {
    const products = await Product.find({});
    res.render('merchandise',{products,select,categories,price,price_value, login:req.session.user_id});
})

app.post('/category', async (req,res) =>{
    
    for(let pr of categories){
        const p= req.body[pr];
        if(p=="on"){
            if(!select.includes(pr))
                select.push(pr)        
        }
        else{
            if(select.includes(pr)){
            const index = select.indexOf(pr)
            if (index > -1) {
              select.splice(index, 1)
            } 
        }
        }
    }
   
    for(let a of price_value){
        const p= req.body[a];
        if(p=="on"){
            if(!price.includes(a))
                price.push(a)        
        }
        else{
            if(price.includes(a)){
            const index = price.indexOf(a)
                if (index > -1) {
                    price.splice(index, 1)
                } 
            }
        }
    }
    
    console.log(select  + "  " + price)
    res.redirect('/merchandise');
})

app.get('/about',(req,res) => {
    res.render('about',{login:req.session.user_id});
})
app.get('/contact', async (req,res) => {
    if(req.session.user_id){
      const id = req.session.user_id;
      const user = await User.findById({_id: id});
      res.render('contact',{user:user, login:req.session.user_id});
    }
    else{
        res.render('contact',{login:req.session.user_id});
    }

    // if(req.session.user_id){
    //     const {Name,Email}=req.body;
    //     res.render('contact',{login:!req.session.user_id,name1:Name,email1:Email});}
    // else{
    //     res.render('contact',{login:!req.session.user_id});
    // }
})

app.get('/cart', async (req,res) => {
    const userid = req.session.user_id;
    const cartItem = await Cart.find({UserID: userid});
    //console.log(cartItem);
    let arrayy = [];
    for(let cart of cartItem){
        let cartProduct = await Product.find({_id: cart.ProductID});
        arrayy.push(cartProduct);
    }
    //console.log(arrayy);
    
    // subtotal and final total code for cart
    let subtotal=0;
    for (let arr of arrayy)
    {
        subtotal= subtotal+ arr[0].pPrice;
    }
    //console.log(subtotal);
    let shipping=100;
    if(subtotal>=1000 || subtotal==0)
        shipping = 0
    const tax = subtotal/10;
    finaltotal = subtotal+shipping+tax;
    //console.log(finaltotal);
    res.render('cart',{cartItem: cartItem, arrayy: arrayy,finaltotal,subtotal,shipping,tax, login:req.session.user_id});
})

app.post('/cart/:id', async (req,res) =>{
    const {size} = req.body;
    console.log(size);
    const {id} = req.params;
    const item = await Product.findById({_id: id});
    console.log(item);
    const userid = req.session.user_id;
    const cartobject = new Cart({
        UserID: userid,
        ProductID: id,
        Size: size,
        Quantity: 1
    });
    await cartobject.save();
    res.redirect('/merchandise');
})

app.put('/cart/:id', async(req,res) =>{
    const {id} = req.params;
    // console.log(req.body);
    const {Quantity} = req.body;
    console.log(Quantity);
    const Cartput = await Cart.findOneAndUpdate({ProductID: id},{Quantity: Quantity},{runValidators: true, new: true, useFindAndModify: false});
    // console.log(Cartput);
    res.redirect('/cart');
})

app.delete('/cart/:id', async (req,res) =>{
    const {id} = req.params;
    const cartItem = await Cart.findOneAndDelete({ProductID: id});
    // console.log(cartItem);
    res.redirect('/cart');
})

app.listen(3000, () =>{
    console.log("Listening on port 3000")
})