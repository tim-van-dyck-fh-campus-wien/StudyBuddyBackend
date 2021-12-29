const Student = require("../Models/Student");
const StudyGroup = require("../Models/StudyGroup");
async function getStudent(id){//Get a the student corresponding to an id
    if(id){
        const student = await Student.model.findOne({_id:id})
        if(student){
            return student;
        }
    }
    return false;//No ID set/no student matching the id found
}
async function getStudyGroup(id){
    return StudyGroup.model.findById(id);
}
async function isStudentMemberOfStudyGroup(group_id,student_id){
    const isMember=await StudyGroup.model.find({members:{
        $elemMatch:{student_id}
    },_id:group_id});
    if(isMember){
        return true;
    }else{
        return false;
    }
}
async function isStudentAdminOfStudyGroup(group_id,student_id){
    const res = await StudyGroup.model.find({_id:group_id,admin:student_id});
    if(res){
        return true;
    }
    return false;
}
module.exports = {getStudent:getStudent,getStudyGroup:getStudyGroup,isStudentMemberOfStudyGroup:isStudentMemberOfStudyGroup,isStudentAdminOfStudyGroup:isStudentAdminOfStudyGroup};