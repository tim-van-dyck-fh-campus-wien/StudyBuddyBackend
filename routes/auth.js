//api/auth
const router = require('express').Router();
const bcrypt = require('bcrypt');//hashing and salting
const Student = require('../Models/Student').model;
//Test für update student
const studentScripts = require('../tools/studentScripts');

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


//REGISTER
router.post('/register',async(req,res)=>{
       // console.dir(req.body);
        //console.dir(newStudent)
        //validation
       /* try{
            const student = await newStudent.save();//save the user to the database
            res.status(200).json(student);//OK return the just created user as json
        }catch(err){
            res.status(500).json(err);
        }*/
        try{
            //check if another user has this username
            const student = await Student.findOne({username:req.body.username});
            //if no student with this username could be found
            if (!student){
                //generate new password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password,salt);
                //create new user in database
                const newStudent = new Student({
                username:req.body.username,
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                password:hashedPassword,
                studentId:req.body.studentId,
                location:req.body.location,
                yearOfFinish:req.body.yearOfFinish
                 }
                );
                try {
                //save student to database
                const student = await newStudent.save();
                req.session.loggedIn=true;
                req.session.userId=student._id;
                res.status(200).json(student, req.session.loggedIn, req.session.userId, student._id);
                    } catch (err){
                        res.status(406).json(err);
                    }
                
            }
            else if (student){
                //another student with this username exists
                res.status(408).json('unique username needed');
            }
            
        }catch(err){
            //catches all other errors 
            res.status(500).json(err);
        }
    
})
//LOGIN
router.post('/login',async(req,res)=>{
    try{
        const student = await Student.findOne({username:req.body.username});//Find the corresponding user to the email
       // console.log(student);
        !student && res.status(404).send("Email or password not correct");//If no user found
        
        const passwordValid = await bcrypt.compare(req.body.password,student.password);//Compare hash to transmitted password
        
        !passwordValid && res.status(404).send("Email or password not correct");//If password does not match

        //EMAIL AND PASSWORD VALID
        req.session.loggedIn=true;
        req.session.userId=student._id;//Set the student id in the session
        res.status(200).json(student);
        console.dir(student);
        
    }catch(err){
        res.status(500).json(err);
    }
})

//UPDATE STUDENT DATA

/**ACHTUNG; VERÄNDERUNGEN GEHEN BEI LOGOUT VERLOREN */
router.post('/updateStudentData', async(req,res)=>{
    //console.dir(req); 
    try {
         //search the student in the database by the userID
        const student = await studentScripts.getStudent(req.session.userId); 
        console.log(student);
        if (req.body.username !== ""){
            student.username = req.body.username; 
        }
        if (req.body.password !== ""){
             //generate new password
             console.dir(student);
             console.dir(student.password);
             const salt = await bcrypt.genSalt(10);
             const hashedPassword = await bcrypt.hash(req.body.password,salt);
             student.password = hashedPassword;
             console.dir(student.password);
             console.dir(student);
        }
        if (req.body.location !== ""){
            student.location = req.body.location;
        }   
        await student.save();
        console.log(student);
        res.status(200).send();
        } catch (err){
            console.dir(err);
            res.status(400).send();
        }
    })

router.get('/logout', (req,res)=>{
    if(req.session.loggedIn){
   // console.dir(req.session.loggedIn);
    req.session.destroy();
   // console.dir(req.session);
    res.status(200).send();
    } else {
        res.status(400).send();
    } 
})

module.exports=router;