const router = require('express').Router();
const StudyGroup = require('../Models/StudyGroup');
const studentScripts = require('../tools/studentScripts');
const Messages = require('../Models/Message');
const Appointment = require('../Models/Appointment');


//CREATE A NEW APPOINTMENT FOR THE GROUP
router.post('/addAppointment',async(req,res)=>{
   // console.log(req);
   const student = await studentScripts.getStudent(req.session.userId);
   !student && res.status(401).send("You are not logged in");
   //console.log(req.body.groupId);
   let studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
   !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
   if(!checkIfStudentIsAdmin(studyGroup,student._id)){
       res.status(401).send("You are not the admin of the study group!")
   }
   
    try{
    const appointment = new Appointment.model({
        topic:req.body.topic,
        date:req.body.date
    });
    await appointment.save();
    studyGroup.appointments.push(appointment);
    await studyGroup.save();
    res.status(200).json(studyGroup);
}catch(err){
    res.status(500).json(err);
}
});

function checkIfStudentIsAdmin(studyGroup,studentId){
    if(studyGroup.admin.equals(studentId)){
        return true;
    }else{
        return false;
    }
}




module.exports = router;