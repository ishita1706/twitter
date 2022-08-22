const mongoose=require('mongoose');

const TweetsSchema= new mongoose
.Schema({
    email:{type:String, required: true},
    content:{type:String, required: true},
    pic:{type:String},
    username:{type:String},
    likedby:{type: Number , default:0},
},{timestamps:true}
);

module.exports=mongoose.model('Tweets',TweetsSchema);