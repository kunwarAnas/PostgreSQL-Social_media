const express = require('express');
const client = require('../Database');
const secretKey = "cdninisi12kdii%$";
const protectedRoute = require('../Middleware/protectedRoute.js');

const friendsRouter = express.Router();

// send friend request 

friendsRouter.post('/sendrequest/:id',protectedRoute,(req,res)=>{
    const reciever = req.params.id;
    const {id:loggedUser} = req.user;
    if(reciever && loggedUser){
        client.query('select * from friends where sender_id=$1 and receiver_id=$2 and status=1',[loggedUser,reciever],(err,result)=>{
            if(!err && result.rows>=1){
                res.json({message:'You are already friends'});
            }else{
                client.query('select * from friends where sender_id=$1 and receiver_id=$2 and status=0',[loggedUser,reciever],(err,result)=>{
                    if(result.rows.length>0){
                        res.json({message:'Friend request already sent'});
                    }else{
                        if(err){
                            res.json({message:err.message});
                        }else{
                            client.query('insert into friends (sender_id,receiver_id) values($1,$2)',[loggedUser,reciever],(err,result)=>{
                                if(err){
                                    res.json({
                                        message:err.message
                                    })
                                }else{
                                    res.json({
                                        message:'Friend request send'
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })
    }
})


// accept friend request 
friendsRouter.post('/acceptrequest/:id',protectedRoute,(req,res)=>{
    const sender_id = req.params.id;
    const receiver_id = req.user.id;
    if(sender_id && receiver_id){
        client.query('update friends set status=1 where sender_id=$1 and receiver_id=$2',[sender_id,receiver_id],(err,result)=>{
            if(!err){
                res.json({message:'Friend Request Accepted'});
            }else{res.json({message:err.message})};
        })
    }
})

// delete a friend request 
friendsRouter.delete('/deleterequest/:id',protectedRoute,(req,res)=>{
    const sender_id = req.params.id;
    const receiver_id = req.user.id;
    if(sender_id && receiver_id){
        client.query('delete from friends where sender_id=$1 and receiver_id=$2 and status=0',[sender_id,receiver_id],(err,result)=>{
            if(!err){
                res.json({message:'Friend Request Deleted'});
            }else{res.json({message:err.message})};
        })
    }
})

// Get all friend request
friendsRouter.get('/allrequest',protectedRoute,(req,res)=>{
    const receiver_id = req.user.id;
    if(receiver_id){
        client.query('select * from friends where receiver_id=$1 and status=0',[receiver_id],(err,result)=>{
            if(!err){
                res.json({message:result.rows});
            }else{res.json({message:err.message})};
        })
    }
})

// Get all friends
friendsRouter.get('/allfriends',protectedRoute,(req,res)=>{
    const userId = req.user.id;
    if(userId){
        client.query('select * from friends inner join users on users.id=friends.receiver_id where sender_id=$1 and status=1',[userId],(err,result)=>{
            if(!err){
                res.json({message:result.rows});
            }else{res.json({message:err.message})};
        })
    }
})


module.exports = friendsRouter;