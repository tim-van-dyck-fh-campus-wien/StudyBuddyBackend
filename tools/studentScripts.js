const Student = require("../Models/Student");
async function getStudent(id){//Get a the student corresponding to an id
    if(id){
        const student = await Student.model.findOne({_id:id})
        if(student){
            return student;
        }
    }
    return false;//No ID set/no student matching the id found
}
module.exports = {getStudent:getStudent};