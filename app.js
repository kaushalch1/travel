const express=require('express');
const app=express();
const path=require('path');
require('dotenv').config();
let { Client }=require('pg');
let client=new Client({
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    port:process.env.DB_PORT,
    password: process.env.DB_PASSPORT,
    database:process.env.DB_DATABASE
});

client.connect().then(()=>{
    console.log('sql database connected');
    return client.query('SELECT *');
}).then(res=>{
    console.log('Current Database Time:', res.rows[0].now);
}).catch(err=>{
    console.log('Connection error:',err.stack);
}).finally(()=>{
    client.end();
});

app.use(express.urlencoded({ extended:true }));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});

app.post('/login' , (req,res)=>{
    let username=req.body.username;
    let password=req.body.password;
    let email=req.body.email;
    console.log(username,password,email);
    username, password,email    
    res.send(`Thank you ${username}`);
});


app.listen(3000,()=>console.log('Server running in PORT:3000'));