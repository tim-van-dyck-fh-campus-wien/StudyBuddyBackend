const mongoose = require('mongoose');
const Student = require('./Student');
const JoinRequestSchema = new mongoose.Schema({
    sender_id:{//_id of the student sending the join request
        type:mongoose.Schema.Types.ObjectId,
        ref:"Students",
        require:true
    },

    //added for must criteria of manually created message with joinrq
    text:{
        type:String,
        min:1,
        max:500,
        require:true
    },
    
},{
    timestamps:true
});
module.exports={
    model:mongoose.model('JoinRequest',JoinRequestSchema),
    schema:JoinRequestSchema
}
