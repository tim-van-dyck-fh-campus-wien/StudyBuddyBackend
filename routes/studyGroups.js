const router = require('express').Router();
const StudyGroup = require('../Models/StudyGroup');
const studentScripts = require('../tools/studentScripts');
const Messages = require('../Models/Message')
const JoinRequest=require('../Models/JoinRequest');

//get list of all study groups
router.get('/',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("U are not logged in");
   // const result = await StudyGroup.model.find().select('_id name admin members location topic description icon').populate('members','_id username firstname lastname email location').populate('admin','_id username firstname lastname email location');
    const result = await StudyGroup.model.find({ $or:[ {'hide':"false"}, {'hide':false} ]}).select('_id name admin members location topic description icon hide').populate('members','_id username firstname lastname email location hideData').populate('admin','_id username firstname lastname email location');  
    res.json(result);
});

//Get list of all study groups from a district
router.get('/:location',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("U are not logged in");
    const result = await StudyGroup.model.find({location:req.params.location, $or:[ {'hide':"false"}, {'hide':false} ]})
        .select('_id name members location topic description icon hide')
        .populate('members','username firstname lastname email hideData');
    console.log(result);
    res.status(200).json(result);
});


//Get list of study groups I am Part of
router.get('/groups/mygroups',async(req,res)=>{
    //console.log(req);
    //console.log("inside");
    //console.log("userID" , req.session.userId);
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("U are not logged in");
    //if I am a member, return in query!
    const result = await StudyGroup.model.find({members:student._doc._id.toString()}).select('_id name admin members location topic description appointments icon hide').populate('members','_id username firstname lastname email location').populate('admin','_id username firstname lastname email location');
    res.json(result);
});

//Get a single study group
router.post('/groups/singleGroup',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("U are not logged in");
    //console.log(req); 
    //console.log(req.body.groupId);
    //if I am a member, return in query!
    let studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
   // studyGroup.select('_id name admin members location').populate('members','_id username firstname lastname').populate('admin','_id username firstname lastname');
   studyGroup = await studyGroup.populate({
    path:'members',
    model:'Students',
    select:{'firstname':1,'lastname':1,'username':1,'_id':1},
})
    //console.log(studyGroup);
    res.json(studyGroup);
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
    const topic = req.body.topic;
    const icon = req.body.icon;
  
    const description=req.body.description;
    const newStudyGroup = StudyGroup.model({
        name:name,
        admin:admin,
        members:members,
        location:location,
        topic:topic,
        description:description,
        icon:icon
    });
    
    try{
        const studyGroup = await newStudyGroup.save();
        res.status(200).json(studyGroup);
    }catch(err){
        res.status(500).json(err);
    }
});

//UPDATE GROUP METADATA 
router.post('/updateGroupData',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("U are not logged in");
    //.log(req);
    let studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    console.log(checkIfStudentIsAdmin(studyGroup,student._id));
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
        res.status(401).send("You are not the admin of the study group!")
    }
    if (req.body.groupName !== ""){
           studyGroup.name = req.body.groupName; 
       }
       if (req.body.location !== ""){
           studyGroup.location = req.body.location; 
       }
       if (req.body.description !== ""){
        studyGroup.description = req.body.description; 
    }
    if (req.body.topic !== ""){
        studyGroup.topic = req.body.topic; 
    }
    console.dir(studyGroup);
       try {
       await studyGroup.save();
       //console.log(studyGroup);
       res.status(200).send();
       } catch (err){
           console.dir(err);
           res.status(400).send();
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


//a new Admin can be selected 
router.post('/selectNewAdmin', async(req,res)=>{
    //console.log(req);
    console.log(req.body.groupId); 
    console.log(req.body.newAdminId);
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    const studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
        res.status(401).send("You are not the admin of the study group!")
    }
    const newAdmin = await studentScripts.getStudent(req.body.newAdminId);
    !newAdmin&&res.status(404).send("The student to be selected was not found");
    if(newAdmin._id==student._id){
        res.status(401).send("You are already the admin.");
    }
    await StudyGroup.model.updateOne({_id:studyGroup._id},{admin:req.body.newAdminId})
    res.status(200).send("The admin has been updated!")
})


//admin can delete a studyGroup
router.post('/deleteThisStudyGroup', async(req,res)=>{
    //console.log(req);
    console.log(req.body.groupId); 
    //console.log(req.body.newAdminId);
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    let studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
        res.status(401).send("You are not the admin of the study group!")
    }

    await StudyGroup.model.deleteOne({_id:studyGroup._id});
    res.status(200).send("Successfully deleted Study Group.")
})

//change hide settings 
router.post('/hideThisGroup', async(req,res)=>{
    //console.log(req);
    console.log(req.body.groupId); 
    //console.log(req.body.newAdminId);
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    let studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
        res.status(401).send("You are not the admin of the study group!")
    }
    studyGroup.hide = req.body.hideSetting; 
    await studyGroup.save();
    console.log(studyGroup);
    res.status(200).send("Successfully updated Study Group visibility.")
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
//Issue a join request to a group
router.post('/joinRequestToGroup',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    //!student && res.status(401).send("You are not logged in");
    if(!student){
        return res.status(401).send("You are not logged in");
    }
    const studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    //!studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(!studyGroup){
        return res.status(404).send("The study group specified by the id was not found!");
    }
    const studentIsMember = await studentScripts.isStudentMemberOfStudyGroup(req.body.groupId,student._id);
    
    //studentIsMember&&res.status(400).send("You are already a member of the study group!");
    if(studentIsMember){
        return res.status(400).send("You are already a member of the study group!");
    }
    //const alreadySentJoinReq= await StudyGroup.model.find({_id:req.body.groupId},{joinRequests:{$elemMatch:{sender_id:student._id}}});
    
    //Check if logged in user already sent a join request
    let results =studyGroup.toObject().joinRequests;
    results = results.filter((entry)=>{
        //return entry.sender_id.equals(student._id);
        return entry.sender_id == student._id.toString();
    });
    if((results.length>=1)){
        return res.status(402).send("You already sent a join request!");
    }
   // (results.length>=1) && res.status(400).send("You already sent a join request!");

    console.log(req.body.text);

    const joinRequest = new JoinRequest.model({
        sender_id:student._id,
        text:req.body.text,
    });
   // console.log(joinRequest);
    await joinRequest.save();
    await StudyGroup.model.updateOne({_id:req.body.groupId},{$addToSet:{joinRequests:joinRequest}});
    const joinReqs= await StudyGroup.model.findById(req.body.groupId).joinRequests;
    res.status(200).json(joinReqs);
});
//Checks if the student has already sent a request to the group/is already a member of the group
router.post('/isStudentAbleToSendJoinRequest', async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    //!student && res.status(401).send("You are not logged in");
    if(!student){
        return res.status(401).send("You are not logged in");
    }
    const studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    //!studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(!studyGroup){
        return res.status(404).send("The study group specified by the id was not found!");
    }
    const studentIsMember = await studentScripts.isStudentMemberOfStudyGroup(req.body.groupId,student._id);
    
    //studentIsMember&&res.status(400).send("You are already a member of the study group!");
    if(studentIsMember){
        return res.status(400).send("You are already a member of the study group!");
    }
    //const alreadySentJoinReq= await StudyGroup.model.find({_id:req.body.groupId},{joinRequests:{$elemMatch:{sender_id:student._id}}});
    
    //Check if logged in user already sent a join request
    let results =studyGroup.toObject().joinRequests;
    results = results.filter((entry)=>{
        //return entry.sender_id.equals(student._id);
        return entry.sender_id == student._id.toString();
    });
    if((results.length>=1)){
        return res.status(402).send("You already sent a join request!");
    }
    res.status(200).send("Able to send a join request");
})

//get List Of Join Requests(For admin of a study Group)
router.post('/getJoinRequests',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    //console.log(req.body.groupId);
    let studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
        res.status(401).send("You are not the admin of the study group!")
    }

    studyGroup = await studyGroup.populate({
        path:'joinRequests',
        populate:{
            path:'sender_id',
            model:'Students',
            select:{'firstname':1,'lastname':1,'username':1,'_id':1}
        }
    })
   // console.log(studyGroup.joinRequests);
    res.json(studyGroup.joinRequests);
    
    //res.status(200).json(studyGroup.joinRequests);
})
//Admin functions
//ADMIN accept/decline a join request by join request id
router.post('/joinRequests',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    let studyGroup = await studentScripts.getStudyGroup(req.body.handleRequest.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
        res.status(401).send("You are not the admin of the study group!")
    }
    //Get the specific join request matching the id
    let joinRequest = studyGroup.toObject().joinRequests;
    joinRequest= joinRequest.filter((entry)=>{
        return entry._id==req.body.handleRequest.joinRequestId
    });
    
    joinRequest=joinRequest[0];
    if(!joinRequest){
       return res.status(404).send("The join request specified by the id could not be found");
    }
    console.log("Join Request");
    console.dir(joinRequest);
    if(req.body.handleRequest.accept){
    const studentToBeAdded = await studentScripts.getStudent(joinRequest.sender_id);
    if(!studentToBeAdded){
        return res.status(404).send("The student to be added,specified in the join request, was not found");
    }

   // studyGroup.members.push(studentToBeAdded._id);//push into members array of study group
    //await studyGroup.save();
    //add to the list of members, but only if it is not yet in the list!
    await StudyGroup.model.updateOne({_id:req.body.handleRequest.groupId},{$addToSet:{members:studentToBeAdded._id}});
}
    studyGroup.joinRequests.pull({_id:req.body.handleRequest.joinRequestId});
    await studyGroup.save();
    if(req.body.handleRequest.accept){
        res.status(200).send("The join request was accepted, and the student added");
    }
    res.status(200).send("The join request was declined");

})

module.exports=router;