const { randomUUID } = require('crypto');
const express=require('express');
const cookieParser=require('cookie-parser');
const app=express();
const path=require('path');
require('dotenv').config();
let { Client }=require('pg');
const { error } = require('console');
let client=new Client({
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    port:process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE
});
app.use(express.json());
app.use(cookieParser());
client.connect()
.then(()=>{
    console.log("Database connected succesfully");
})
.catch((err)=>{
    console.log("Database connection error:",err.stack);
})
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended:true }));

app.get('/',async(req,res)=>{
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
app.get('/api/fetchtrips',async(req,res)=>{
    try{
        let username = req.cookies.username;
        if (!username) return res.status(401).json([]);
        let result = await fetchtrips(username);
        res.json(result.rows);
    }catch(error){
        res.status(500).json({error:'Failed fetching data'});
    }
});
app.post('/api/updatenotes',async(req,res)=>{
    const { id, content } = req.body;
    let username=req.cookies.username;
    if(!username) return res.status(401).json([]);
    try{
        await client.query("UPDATE trips SET content=$1 WHERE id=$2 AND created_by=$3",[content,id,username]);
        res.json({success:true});
    }catch(error){
        res.status(500).json({error:'Failed editing data'});
    }
});
app.post('/createtrip',async(req,res)=>{
    let created_by=req.cookies.username;
    if (!created_by) {
    return res.status(401).send("No user found! Please log in.");
    }
    let id=randomUUID();
    let destination=req.body.city;
    let start_date=new Date(req.body.daterange.split(" to ")[0].trim(" ")+ 'T00:00:00');
    let end_date=new Date(req.body.daterange.split(" to ")[1].trim(" ")+ 'T00:00:00');
    let title="Trip to "+destination;
    await trips(id, title, destination, start_date, end_date, created_by);
    if (!start_date || !end_date) {
        return res.status(400).json({ error: "Please select a valid date range (Start and End date)." });
    }
    console.log(id,destination,start_date,end_date,created_by,title);    
    res.status(200).json({ message: "Trip created successfully", id: id, destination: destination });
});
app.post('/login' , async(req,res)=>{
    let password=req.body.password;
    let email=req.body.email;
    let sear = await search(email);
    if(sear===0){
        return res.status(400).json({
            success:false,
            message:'Account not found'
        })
        //res.send("You don't have an account,signup here");
    }else{
        let log=await login(email,password);
        if(log){
            //res.send(`Welcome come back ${log.username}`);
            res.cookie('username',log.username, { httpOnly: true });
            return res.json({
                success:true,
                username:log.username
            })
        }else{
            return res.status(401).json({
                success:false,
                message:"Incorrect password"
            })
            //res.send('The password is incorrect');
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
        //res.send(`Thank you for signing up!!\nWelcome ${username}`);
        return res.json({
            success:true,
            message:"Signup successful!"
        })
    }else{
        //res.send("You already have an account");
        console.log("You already have an account!!");
        return res.status(400).json({
            success:false,
            message:"User already exists"
        })
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
async function trips(id,title,destination,start_date,end_date,created_by){
    try{
        let tablequery=`
        CREATE TABLE IF NOT EXISTS trips(
            sno SERIAL PRIMARY KEY,
            id VARCHAR(100) NOT NULL,
            title VARCHAR(100) NOT NULL,
            destination VARCHAR(100) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            created_by VARCHAR(100) NOT NULL,
            content TEXT
        );
        `;
        await client.query(tablequery);
        console.log('Trips ready');
        let insertquery='INSERT INTO trips(id,title,destination,start_date,end_date,created_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING *;';
        let result=await client.query(insertquery,[id,title,destination,start_date,end_date,created_by]);

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
async function fetchtrips(username) {
    try{
        let searchquery=`SELECT *,
        TO_CHAR(start_date, 'DD-MM-YYYY') AS start_date,
        TO_CHAR(end_date, 'DD-MM-YYYY') AS end_date
        FROM trips WHERE created_by = $1;`;
        let result=await client.query(searchquery,[username]);
        return result;
    }catch(err){
        console.log("Error:",err.stack);
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