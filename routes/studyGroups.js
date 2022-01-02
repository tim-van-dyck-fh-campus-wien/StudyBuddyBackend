const router = require('express').Router();
const StudyGroup = require('../Models/StudyGroup');
const studentScripts = require('../tools/studentScripts');
const Messages = require('../Models/Message')


//Get list of study groups I am Part of
router.get('/',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("U are not logged in");
    //if I am a member, return in query!
    const result = await StudyGroup.model.find({members:student._id});
    console.dir(result);
    res.json(result);
});

//create new study group
router.post('/create',async(req,res)=>{
    //console.dir('Doing Method:', req);
    //console.dir(req.session.userId);
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("U are not logged in");
    console.log(student);
    const name=req.body.name;
    const admin = student._id;//admin is the creator of the group
    const members = [student._id];//the only member is the admin initially
    const location = req.body.location;
    const newStudyGroup = StudyGroup.model({
        name:name,
        admin:admin,
        members:members,
        location:location
    });
    try{
        const studyGroup = await newStudyGroup.save();
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

//Add a student to a study group, specified by the id of the student to be added in the body, and the studygroup id in the body
router.patch('/addMember', async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    const studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    console.log(checkIfStudentIsAdmin(studyGroup,student._id));
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
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




router.delete('/deleteMember',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    const studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
        res.status(401).send("You are not the admin of the study group!")
    }
    const studentToBeRemoved = await studentScripts.getStudent(req.body.newMemberId);
    !studentToBeRemoved&&res.status(404).send("The student to be added was not found");
    if(studentToBeRemoved._id==student._id){//Admin can't remove himself from the group, as there would be no admin
        res.status(401).send("You can't remove yourself, as there would be no admin!");
    }
    await StudyGroup.model.updateOne({_id:studyGroup._id},{$pull:{
        members:studentToBeRemoved._id
    }})
    res.status(200).send("Student was removed from Group!")
})
//used to leave a study group, the logged in student is a member of
router.delete('/leaveStudyGroup',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    const studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    
    //Student is not the admin, save to remove!
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
        await StudyGroup.model.updateOne({_id:studyGroup._id},{$pull:{
            members:student._id
        }})
        res.status(200).send("You were removed from the studygroup")
    }else{//If the student is the admin, a new admin must be specified via the request body!
        !req.body.newAdminId&&res.status(400).send("Please specify the new admin inside the body(newAdminId)");
        const newAdmin = await studentScripts.getStudent(req.body.newAdminId);
        !newAdmin&&res.status(404).send("the specified new Admin does not exist, check the ID!");
        //Check if the new Admin is a member of the studyGroup:
        const exists = StudyGroup.model.find({members:{
            $elemMatch:req.body.newAdminId
        },_id:req.body.groupId});
        !exists&&res.status(404).send("the new Admin is not a member of the studyGroup!");
        studyGroup.admin=newAdmin._id;//set the new admin
        await studyGroup.save();
        await StudyGroup.model.updateOne({_id:studyGroup._id},{$pull:{
            members:student._id
        }})//and leave the group
        res.status(200).send("New Admin was set and you left the group");


    }
    
    
})

//Admin functions

module.exports=router;