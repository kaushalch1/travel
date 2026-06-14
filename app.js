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
client.connect()
.then(()=>{
    console.log("Database connected succesfully");
})
.catch((err)=>{
    console.log("Database connection error:",err.stack);
})
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended:true }));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=7`, {
            headers: { 'User-Agent': 'TravelAppProject/1.0' }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
});

app.post('/login' , async(req,res)=>{
    let password=req.body.password;
    let email=req.body.email;
    let sear = await search(email);
    if(sear===0){
        res.send("You don't have an account,signup here");
    }else{
        let log=await login(email,password);
        if(log){
            res.send(`Welcome come back ${log.username}`);
        }else{
            res.send('The password is incorrect');
        }
    }
});
app.post('/signup',async(req,res)=>{
    let username=req.body.username;
    let email=req.body.email;
    let password=req.body.password;
    let sear= await search(email);
    if(sear===0){
        await dbtasks(username,email,password);
        console.log(username,password,email);
        res.send(`Thank you for signing up!!\nWelcome ${username}`);
    }else{
        res.send("You already have an account");
        console.log("You already have an account!!");
    }
});
async function dbtasks(username,email,password){
    try{
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
        let insertquery='INSERT INTO users(username,email,password) VALUES($1,$2,$3) RETURNING *;';
        let insertvalues=[username,email,password];
        console.log(insertvalues);
        let result=await client.query(insertquery,insertvalues);
        console.log('Succesfully added a user',result.rows[0]);
    }catch(err){
        console.error("error:",err.stack);
    }
}
async function trips(id,title,destination,start,end,created_by){
    try{
        let tablequery=`
        CREATE TABLE IF NOT EXISTS trips(
            sno SERIAL PRIMARY KEY,
            id VARCHAR(100) NOT NULL,
            title VARCHAR(100) NOT NULL,
            destination VARCHAR(100) NOT NULL,
            start DATE NOT NULL,
            end DATE NOT NULL,
            created_by VARCHAR(100) NOT NULL
        );
        `;
        await client.query(tablequery);
        console.log('Trips ready');
        let insertquery='INSERT INTO trips(id,title,destination,start,end,created_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING *;';
        let result=await client.query(insertquery,[id,title,destination,start,end,created_by]);
    }catch(err){
        console.log("error:",err.stack);
    }
}
async function search(email){
    try{
        let searchquery=`SELECT * FROM users WHERE email = $1;`;
        let result=await client.query(searchquery,[email]);
        if(result.rows.length>0){
            return 1;
        }else{
            return 0;
        }
    }catch(err){
        console.error("error:",err.stack);
    }
}
async function login(email,password){
    try{
        let searchquery='SELECT * FROM users WHERE email =$1 AND password= $2;';
        let result =await client.query(searchquery,[email,password]);
        if(result.rows.length>0){
            return result.rows[0];
        }else{
            return null;
        }   
    }catch(err){
        console.log("Error:",err.stack);
    }
}
app.listen(3000,()=>console.log('Server running in PORT:3000'));