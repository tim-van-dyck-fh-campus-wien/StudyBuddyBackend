const router = require('express').Router();
const StudyGroup = require('../Models/StudyGroup');
const studentScripts = require('../tools/studentScripts');
router.get('/',(req,res)=>{
    if(req.session.loggedIn){
        res.status(200);
    }
    res.send('user auth works');
});
router.post('/',async(req,res)=>{
    const student = studentScripts.getStudent(req.session.userId);
    if(student!=false){
    }

})
module.exports=router;