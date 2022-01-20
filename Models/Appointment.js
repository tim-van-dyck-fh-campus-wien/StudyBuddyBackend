const mongoose = require('mongoose');
const Student = require('./Student');
const AppointmentSchema = new mongoose.Schema({
    date:{
        type:String,
        min:1,
        max:10,
        require:true
    },
    topic:{
        type:String,
        min:1,
        max:500,
        require:true
    },
},{
    timestamps:true
});
module.exports = {
    model:mongoose.model('Appointment',AppointmentSchema),
    schema:AppointmentSchema
}