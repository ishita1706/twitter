const passport=require('passport');
const User = require('./models/User');
require('dotenv').config();
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const GoogleStrategy= require('passport-google-oauth2').Strategy;

passport.serializeUser(function(user, done) {
    
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {

    done(null, user);
});


passport.use(new LocalStrategy(async (username,password,done)=>{
    try{
        const user=await User.findOne({email:username});
    
    if(!user) return done(null,false);
    bcrypt.compare(password,user.password,function(err,res){
        if(res) return done(null,user);
        else return done(error,false);  
    })
  
    } catch(error){
    return done(error,false);
    }
    }
    ));
    






authUser = (request, accessToken, refreshToken, profile, done) => {
   
    const newUser= new User({
    username:profile.displayName,
    email:profile.emails[0].value,
   pic:profile.photos[0].value
});

User.findOne({email:profile.emails[0].value}).then((rows)=>{
    if(!rows){
         User.insertMany(newUser).then(()=>{
            return done(null, rows);
         });
    }
    else if(rows){
     return done(null,rows);
    }
})  
}

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_CALLBACK_URL ,
},

function (request, accessToken, refreshToken, profile, done){
     const newUser= new User({
     username:profile.displayName,
     email:profile.emails[0].value,
    pic:profile.photos[0].value
 });
 
 User.findOne({email:profile.emails[0].value}).then((rows)=>{
    if(rows) return done(null,rows); 
    
    else{
          User.insertMany(newUser).then(()=>{
            User.findOne({email:profile.emails[0].value}).then((result)=>{
                return done(null, result);
            })
            
          });
     }
 })  
 }));


