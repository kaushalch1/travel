const express=require('express');
const app=express();
const path=require('path');
app.use(express.urlencoded({ extended:true }));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});
app.post('/login' , (req,res)=>{
    let username=req.body.username;
    let password=req.body.password;
    let email=req.body.email;
    console.log(username,password,email);
    res.send(`Thank you ${user}`);
});
app.listen(3000,()=>console.log('Server running in PORT:3000'));
