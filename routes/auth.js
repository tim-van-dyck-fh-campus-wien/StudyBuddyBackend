//api/auth
const router = require('express').Router();
const bcrypt = require('bcrypt');//hashing and salting
const Student = require('../Models/Student').model;
router.get('/',(req,res)=>{
    if(req.session.loggedIn){
        res.status(200);
    }
    res.send('user auth works');
});
//Check if user with corresponding session id, is logged in!
router.get("/checkAuthentication",(req,res)=>{
    if(req.session.loggedIn){
        res.status(200).send();
    }else{
        res.status(401).send();
    }
})
router.post('/register',async(req,res)=>{
   

        console.dir(req.body);
        //generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt);
       //create new user in database
        const newStudent = new Student({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            password:hashedPassword,
            studentId:req.body.studentId,
            location:req.body.location,
            yearOfFinish:req.body.yearOfFinish
        }
        );
        //console.dir(newStudent)
        //validation
       /* try{
            const student = await newStudent.save();//save the user to the database
            res.status(200).json(student);//OK return the just created user as json
        }catch(err){
            res.status(500).json(err);
        }*/
        try{

       
            const student = await newStudent.save();
            
            res.status(200).json(student);
        }catch(err){
            res.status(500).json(err);
        }
})
//LOGIN
router.post('/login',async(req,res)=>{
    try{
        const student = await Student.findOne({email:req.body.email});//Find the corresponding user to the email
        console.log(student);
        !student && res.status(404).send("Email or password not correct");//If no user found
        const passwordValid = await bcrypt.compare(req.body.password,student.password);//Compare hash to transmitted password
        !passwordValid && res.status(404).send("Email or password not correct");//If password does not match

        //EMAIL AND PASSWORD VALID
        req.session.loggedIn=true;
        req.session.userId=student._id;//Set the student id in the session
        res.status(200).json(student);
    }catch(err){
        res.status(500).json(err);
    }
})
router.get('/logout', (req,res)=>{
    if(req.session.loggedIn){
        req.session.destroy();
     res.status(200).send();
    }
    res.status(400).send();
     
})

module.exports=router;