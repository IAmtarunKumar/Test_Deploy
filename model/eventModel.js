const mongoose = require('mongoose');


const eventSchema = new mongoose.Schema({
    eventID: {type: String,},
    name:String,
    date: Date,
    category: {
        type: String,
     },
    createdAt: { type: Date, default: Date.now },
});

 

const Event = mongoose.model('Event', eventSchema );

module.exports = Event