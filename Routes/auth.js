const express = require('express');
const client = require('../Database');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const secretKey = "cdninisi12kdii%$";
const protectedRoute = require('../Middleware/protectedRoute.js');
const cookieParser = require('cookie-parser');
const authRouter = express.Router();

authRouter.post('/signup',async (req,res)=>{
    const {fullname,password,email,profile_pic} = req.body;
    const encryptPassword = await bcrypt.hash(password,10); 
    client.query('insert into users(fullname,email,password,profile_pic) values($1, $2, $3, $4)',[fullname,email,encryptPassword,profile_pic],(err,result)=>{
        if(result){
            res.json({
                message:'user created',
                user:{
                    fullname,email
                }
            })
        }else if (err){
            res.json({
                error : err.message,
                success:0
            })
        }
    });

})

authRouter.post('/login',(req,res)=>{
    const {email,password} = req.body;
    client.query('SELECT * FROM users where email = $1',[email],async (err,result)=>{
        if(result.rows.length >= 1){
            const encryptPassword = result.rows[0].password;
            const decryptPassword = await bcrypt.compare(password,encryptPassword);
            if(decryptPassword){
                const token = jsonwebtoken.sign({...result.rows[0]},secretKey,{expiresIn:'10h'});
                res.cookie('LoginCookie',token, { maxAge: 900000, httpOnly: true });
                delete result.rows[0].password;
                res.json({
                    message:'Logged in',
                    user:{
                        ...result.rows[0], token
                    }
                })
            }else{
                res.json({
                    message:'Wrong password'
                })
            }
        }else{
            res.json({
                message:'Invalid user'
            })
        }
    })
})


authRouter.post('/getuser',protectedRoute,(req,res)=>{
    const user = req.user;
    if(user){
        res.json({
            user
        })
    }else{
        res.json({
            message:'No user'
        })
    }
})

module.exports = authRouter;