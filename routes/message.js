const router = require('express').Router();
const StudyGroup = require('../Models/StudyGroup');
const studentScripts = require('../tools/studentScripts');
const Messages = require('../Models/Message')

//Used to send a message to a study group!
//message specified in the body!
router.post('/newmessage',async(req,res)=>{
    console.log(req.body);

    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    
    const studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    const studentIsMember = await studentScripts.isStudentMemberOfStudyGroup(req.body.groupId,student._id);
    !studentIsMember&&req.status(400).send("You are not a member of the study group!");
    try{
    const message = new Messages.model({
        text:req.body.text,
        sender_id:student._id
    });
    await message.save();
    studyGroup.messages.push(message);
    await studyGroup.save();
    /*studyGroup = await studyGroup.populate({
        path:'messages.sender_id', 
        model:'Students', 
        select:{'_id':1,  'username':1, 'firstname':1,'lastname':1, 'email':1 ,'location':1}

    })*/
    console.log(studyGroup)
    res.status(200).send();
}catch(err){
    console.log(err)
    res.status(500).json(err);
}
});
//Used to get the list of messages
//das ist post, weil ich sonst die ID nicht mitschicken kann über den browser
router.post('/group/mess',async(req,res)=>{
    console.log(req.body)
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    //console.log("get ID", req.body.groupId);
    let studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    const studentIsMember = await studentScripts.isStudentMemberOfStudyGroup(req.body.groupId,student._id);
    !studentIsMember&&req.status(400).send("You are not a member of the study group!");
   
    //studyGroup = await studyGroup.messages.populate('sender_id');
    console.log(StudyGroup.model.findById(req.body.groupId).messages)
    /* StudyGroup.model.findById(req.body.groupId).messages.populate('sender_id').then(res =>{
        console.dir(res);
    }).catch(err=>{
        console.dir(err);
    })*/
    studyGroup = await studyGroup.populate({
        path:'messages',
        populate:{
            path:'sender_id',
            model:'Students',
            select:{'firstname':1,'lastname':1,'email':1,'username':1}
        }
    });
    let messages = studyGroup.messages;
    //messages =await messages.sort({createdAt:'desc'})

    console.log(messages);
    res.status(200).json(messages);


        //res.status(500).json(err);
  
})

module.exports = router;