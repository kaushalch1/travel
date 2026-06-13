const express=require('express');
const app=express();
const path=require('path');
require('dotenv').config();
let { Client }=require('pg');
let client=new Client({
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    port:process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});

app.use(express.urlencoded({ extended:true }));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});
let username,password,email;
app.post('/login' , (req,res)=>{
    username=req.body.username;
    password=req.body.password;
    email=req.body.email;
    if(!search()){
        dbtasks();
        console.log(username,password,email);
    }else{
        console.log("You already have an account!!");
    }
    res.send(`Thank you ${username}`);
});
async function dbtasks(){
    try{
        await client.connect();
        console.log('Database connected!');
        let createtable=`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            password VARCHAR(100) NOT NULL
        ); 
        `;
        await client.query(createtable);
        console.log(`Users ready`);
        let inertquery='INSERT INTO users(username,email,password) VALUES($1,$2,$3) RETURNING *;';
        let insertvalues=[username,email,password];
        console.log(insertvalues);
        let result=await client.query(inertquery,insertvalues);
        console.log('Succesfully added a user',result.rows[0]);
    }catch(err){
        console.error("error:",err.stack);
    }finally{
        await client.end();
    }
}
async function search(){
    try{
        await client.connect();
        let searchquery=`SELECT * FROM users WHERE email = $1;`;
        let result=await client.query(searchquery,[email]);
        if(result.rows.length>0){
            return 1;
        }else{
            return 0;
        }
    }catch(err){
        console.error("error:",err.stack);
    }finally{
        await client.end();
    }
}
app.listen(3000,()=>console.log('Server running in PORT:3000'));