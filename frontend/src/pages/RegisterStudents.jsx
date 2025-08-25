import React from 'react'
import StudentForm from '../components/StudentForm';
function RegisterStudents(){
    return (
      <>
        <StudentForm route = 'http://localhost:8000/student/'></StudentForm>
      </>
    );
}
export default RegisterStudents;