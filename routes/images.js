//api/images
const router = require('express').Router();
const walk = require('walk');
const studentScripts=require('../tools/studentScripts');
function checkIfStudentIsAdmin(studyGroup,studentId){
    if(studyGroup.admin.equals(studentId)){
        return true;
    }else{
        return false;
    }
}
//get the list of possible group images
router.get('/groupImgList',async(req,res)=>{
    let walker = walk.walk('./Images/group',{followLinks:false});
    let images=[]
    walker.on('file', (root,stat,next)=>{
        images.push('/group/'+stat.name);
        next();
    })
    walker.on('end', ()=>{
        res.json(images);
    })
})
router.post('/setGroupImage',async(req,res)=>{
    //try{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    let studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    if(!checkIfStudentIsAdmin(studyGroup,student._id)){
        res.status(401).send("You are not the admin of the study group!")
    }
    studyGroup.icon=req.body.icon;
    studyGroup.save();
    res.json(studyGroup);
//}catch(err){
   // res.status(500).json(err);
//}
})
//get the relative image url of a study groups group image
router.post('/groupImageRelUrl',async(req,res)=>{
    const student = await studentScripts.getStudent(req.session.userId);
    !student && res.status(401).send("You are not logged in");
    let studyGroup = await studentScripts.getStudyGroup(req.body.groupId);//find the corresponding study group
    !studyGroup&&res.status(404).send("The study group specified by the id was not found!");
    res.json({relativeUrl:studyGroup.icon});
})


module.exports=router;
