const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({//Defines the schema for DB entrys inside the USERS database!
    firstname:{
        type:String,
        require:true,// a user has to have a username
        min:3,//atleast 3 characters long
        max:20,
    },
    lastname:{
        type:String,
        require:true,// a user has to have a username
        min:3,//atleast 3 characters long
        max:20,
    },
    email:{
        type:String,
        required:true,
        max:50,
        unique:true
    },
    password:{
        type:String,
        required:true,
        min:6,
        max:60
        //default:''
    },
    studentId:{
        type:String,
        required:true,
        unique:true
    },
    location:{//District number in vienna
        type:Number,
        required:true,
        min:1,
        max:23
    },
    yearOfFinish:{//Year when studies will be finished
        type:Number,
        required:true
    }
},{
    timestamps:true
});
module.exports = {
    model:mongoose.model('Students',StudentSchema),
    schema:StudentSchema
}