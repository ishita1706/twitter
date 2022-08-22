require('dotenv').config();
const express=require('express');
const app=express();
const passport=require('passport');
require('./passport-setup');
const session=require('express-session');
const {mongoose } = require('mongoose');
const User = require('./models/User');
const Tweets=require('./models/Tweets');
const bcrypt=require('bcrypt');
const port=process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true}));
app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
    })
  );


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URL).then(()=>console.log("Connection Successful")).catch((err)=>{
    console.log(err);
});
   
app.set("view engine","ejs")

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/failed');
    }
}


app.use(express.static(__dirname+'/public'));

app.get('/',(req,res)=>{
    res.render("pages/index.ejs");
})


app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/failed', (req, res) => res.send('You Failed to log in!'));

app.get('/home', loggedIn, async (req, res) =>{
    const result=await Tweets.find({}).sort({createdAt:-1});
  
        res.render("pages/home",{name:req.user.username,email:req.user.email,pic:req.user.pic,tweets:result});       
    })
    
app.get('/google/callback', passport.authenticate('google', { successRedirect:'/home' ,failureRedirect:'/failed'}));

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { 
        return next(err); 
    }
      res.redirect('/');
    });
  });

app.get('/signup',function(req,res){
res.render('pages/register.ejs');
})

app.get('/signin',function(req,res){
    res.render('pages/login.ejs');
})

app.post('/signup',function(req,res){
User.findOne({email:req.body.username}).then((user)=>{
 
    if(!user){
        bcrypt.hash(req.body.password,10,(err,hash)=>{
            User.insertMany({email:req.body.username,username:req.body.name,password:hash}).then((user)=>{
                res.redirect('/signin');
                    }) 
        })
           
}
else{
res.redirect('/');
}
        })
        });  

app.post('/signin',passport.authenticate('local',{failureRedirect:'/failed',successRedirect:'/home' }));

app.get('/login',(req,res)=>{
res.render('pages/home');
});

app.post('/add',(req,res)=>{
Tweets.insertMany({email:req.body.email,content:req.body.content,username:req.body.username,pic:req.body.pic}).then(
    res.redirect('/home')
).catch();
})

app.get('/profile', loggedIn,async (req,res)=>{
    var lemail = req.query.email;
    
    var result= await User.findOne({email:lemail});
    var tweets=await Tweets.find({email:lemail}).sort({createdAt:-1});
    res.render('pages/profile',{result:result ,tweets:tweets});        
        
})

app.get('/delete',loggedIn,async (req,res)=>{
await Tweets.deleteOne({email:req.query.email,content:req.query.content});
res.redirect('/home');
})

app.listen(port,()=>{
    console.log("App is running on port 5000");
})


