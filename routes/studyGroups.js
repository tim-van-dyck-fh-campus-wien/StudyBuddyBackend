const router = require('express').Router();
const StudyGroup = require('../Models/StudyGroup');
const studentScripts = require('../tools/studentScripts');
const Messages = require('../Models/Message')
router.get('/',async(req,res)=>{//Get list of study groups I am Part of
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("U are not logged in");
    const result = await StudyGroup.model.find({members:student._id});//if I am a member, return in query!
    res.json(result);
});
router.post('/',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("U are not logged in");
    console.log(student);
    const name=req.body.name;
    const admin = student._id;//admin is the creator of the group
    const members = [student._id];//the only member is the admin initially
    const location = req.body.location;
    const newStudyGroup = StudyGroup.model({
        name:name,
        members:members,
        admin:admin,
        location:location
    });
    try{
        const studyGroup = await newStudyGroup.save();
        res.status(200).json(studyGroup);
    }catch(err){
        res.status(500).json(err);
    }
});
async function getStudyGroup(id){
    return StudyGroup.model.findById(id);
}
function checkIfStudentIsAdmin(studyGroup,studentId){
    if(studyGroup.admin==studentId){
        return true;
    }else{
        return false;
    }
}
//Add a student to a study group, specified by the id of the student to be added in the body, and the studygroup id in the body
router.patch('/addMember', async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    const studyGroup = await getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(await checkIfStudentIsAdmin(studyGroup,student._id)){
        res.status(401).send("You are not the admin of the study group!")
    }
    const studentToBeAdded = await studentScripts.getStudent(req.body.newMemberId);
    !studentToBeAdded&&res.status(404).send("The student to be added was not found");
   // studyGroup.members.push(studentToBeAdded._id);//push into members array of study group
    //await studyGroup.save();
    //add to the list of members, but only if it is not yet in the list!
    await StudyGroup.model.updateOne({_id:req.body.groupId},{$addToSet:{members:studentToBeAdded._id}});
    res.status(200).send("Student was added sucessfully");
})

//Admin functions

module.exports=router;