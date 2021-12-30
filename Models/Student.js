const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({//Defines the schema for DB entrys inside the USERS database!
    //added for must criterias
    username:{
        type:String,
        require:true,// a user has to have a username
        min:3,//atleast 3 characters long
        max:20,
        unique:true, //must be unique, otherwise login doesn't work
    },
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
        unique:false
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
        //changed to string to reduce error possibilities 
        type:String,
        required:true,
    },
    yearOfFinish:{//Year when studies will be finished
        type:Number,
        required:true,
        min:2022
    }
},{
    timestamps:true
});
module.exports = {
    model:mongoose.model('Students',StudentSchema),
    schema:StudentSchema
}