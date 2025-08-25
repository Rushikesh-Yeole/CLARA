import React from 'react'
import Form from '../components/Form';
function Register(){
  return (
    <>
      <Form route ="http://localhost:8000/teacher/" method = 'register'></Form>
    </>
  );
}

export default Register;