const mongoose = require('mongoose');
const Student = require('./Student');
const Message = require('./Message')
const StudyGroupSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
        default:"unnamed Group"
    },
    admin:{//reference to a student
        type:mongoose.Schema.Types.ObjectId, ref:"Students",
        require:true,
        unique:false
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId, ref:"Students",
        require:true,
        min:1,
        unique:false,
    }],
   /* appointments:{
        type:[Appointment.schema],
        require:true,
    }*/
    messages:{
        type:[Message.schema],
        require:true,
        default:[]
    },
    location:{
        type:String,
        require:true,
        /**min:1,
        max:23,
        default:1*/
    }


},{
    timestamps:true
});
module.exports = {
    model:mongoose.model('StudyGroups',StudyGroupSchema),
    schema:StudyGroupSchema
}