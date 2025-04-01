const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    _id: false, //do not create _id for subdocument unless needed
    title: {type:String, required:true,trim:true},
    youtubeVideoId: {type:String, required:true,trim:true},
    duration:{type:Number, required:true}, //duration in seconds
    description: {type:String, trim:true},
});