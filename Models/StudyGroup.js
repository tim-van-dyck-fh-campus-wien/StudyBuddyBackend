const mongoose = require('mongoose');
const Student = require('./Student');
const Message = require('./Message')
const StudyGroupSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    members:{
        type:[Student.schema],
        require:true,
        min:1
    },
   /* appointments:{
        type:[Appointment.schema],
        require:true,
    }*/
    admin:{
        type:Student.schema,
        require:true
    },
    messages:{
        type:[Message.schema],
        require:true,
        default:[]
    },
    location:{
        type:String,
        require:true,
        min:1,
        max:23
    }


},{
    timestamps:true
});
module.exports = {
    model:mongoose.model('StudyGroups',StudyGroupSchema),
    schema:StudyGroupSchema
}