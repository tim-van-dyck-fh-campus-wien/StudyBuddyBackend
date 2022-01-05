const mongoose = require('mongoose');
const Student = require('./Student');
const JoinRequestSchema = new mongoose.Schema({
    sender_id:{//_id of the student sending the join request
        type:mongoose.Schema.Types.ObjectId,
        ref:"Students",
        require:true
    },
},{
    timestamps:true
});
module.exports={
    model:mongoose.model('JoinRequest',JoinRequestSchema),
    schema:JoinRequestSchema
}
