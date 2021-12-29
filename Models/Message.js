const mongoose = require('mongoose');
const Student = require('./Student');
const MessageSchema = new mongoose.Schema({
    text:{
        type:String,
        min:1,
        max:500,
        require:true
    },
    sender_id:{//_id of the student sending the message
        type:mongoose.Schema.Types.ObjectId,
        ref:"Students",
        require:true
    },
},{
    timestamps:true
});
module.exports = {
    model:mongoose.model('Message',MessageSchema),
    schema:MessageSchema
}