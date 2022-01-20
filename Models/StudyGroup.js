const mongoose = require('mongoose');
const Student = require('./Student');
const Message = require('./Message');
const JoinRequest = require('./JoinRequest');
const { stringify } = require('nodemon/lib/utils');
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
    joinRequests:{
        type:[JoinRequest.schema],
        require:true,
        default:[]
    },
    location:{
        type:String,
        require:true,
        /**min:1,
        max:23,
        default:1*/
    },
    //optional topic of the study group
    topic:{
        type:String,
        default:"",
        max:50
    },
    description:{
        type:String,
        max:150,
        require:true
    },
    icon:{//relative url to the icon used by the group
        type:String,
        require:true,
        default:'/group/pc.jpg'
    }


},{
    timestamps:true
});
module.exports = {
    model:mongoose.model('StudyGroups',StudyGroupSchema),
    schema:StudyGroupSchema
}