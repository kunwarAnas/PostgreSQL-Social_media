const express = require('express');
const protectedRoute = require('../Middleware/protectedRoute.js');
const client = require('../Database');
const { post } = require('./auth.js');

const postRouter = express.Router();

// Get all posts

postRouter.get('/allposts',protectedRoute,(req,res)=>{
    client.query('select fullname,email,profile_pic,video_url from posts p cross join users u where p.user_id = u.id;',(err,result)=>{
        if(!err && result){
            res.json({
                post:result.rows
            })  
        }else{
            res.json({
                message:err.message
            })
        }
    })
})

// Get a particular post

postRouter.get('/:id',protectedRoute,(req,res)=>{
    const postId = req.params.id;
    client.query('select fullname,email,profile_pic,video_url from posts as p inner join users as u on p.user_id = u.id where p.id = $1 ;',[postId],(err,result)=>{
        if(!err){
            res.json({
                post:result.rows
            })
        }else{
            res.json({
                message:err.message
            })
        }
    })
})

// Get posts of a user

postRouter.get('/userpost/:id',protectedRoute,(req,res)=>{
    const userId = req.params.id;
    client.query('select fullname,email,profile_pic,video_url from posts as p inner join users as u on p.user_id = u.id where u.id = $1 ;',[userId],(err,result)=>{
        if(!err){
            res.json({
                post:result.rows
            })
        }else{
            res.json({
                message:err.message
            })
        }
    })
})

// Like a post

postRouter.post('/like/:id',protectedRoute,(req,res)=>{
    const postId = req.params.id;
    const {id:userId} = req.user;
    if(postId && userId){
        client.query('insert into likes (user_id,post_id) values ($1,$2)',[userId,postId],(err,result)=>{
            if(!err && result){
                res.json({
                    message:'Post Liked',
                })
            }else{
                res.json({
                    message:err.message,
                }) 
            }
        })
    }else{
        res.json({
            message:'Something went wrong',
        }) 
    }
})

// unlike a post 

postRouter.delete('/unlike/:id',protectedRoute,(req,res)=>{
    const postId = req.params.id;
    const {id:userId} = req.user;
    if(postId && userId){
        client.query('delete from likes where user_id=$1 and post_id=$2',[userId,postId],(err,result)=>{
            if(!err && result){
                res.json({
                    message:'Post unLiked',
                })
            }else{
                res.json({
                    message:err.message,
                }) 
            }
        })
    }else{
        res.json({
            message:'Something went wrong',
        }) 
    }
})

// check like if the user liked the post or not 

postRouter.get('/checklike/:id',protectedRoute,(req,res)=>{
    const postId = req.params.id;
    const {id:userId} = req.user;
    client.query('select * from likes where user_id=$1 and post_id=$2',[userId,postId],(err,result)=>{
        if(err){
            res.json({
                message:err.message
            })
        }else{
            if(result.rows.length>=1){
                res.json({message:'post is liked' , success:1});
            }else{
                res.json({message:'post is not liked' , success:0});
            }
        }
    })
})

// check like count of a post 

postRouter.get('/countlike/:id',protectedRoute,(req,res)=>{
    const postId = req.params.id;
    const {id:userId} = req.user;
    client.query('select count(*) as count from likes where post_id=$1',[postId],(err,result)=>{
        if(err){
            res.json({
                message:err.message
            })
        }else{
            res.json({message:result.rows});
        }
    })
})

// comment on a post 

postRouter.post('/comment/:id',protectedRoute,(req,res)=>{
    const postId = req.params.id;
    const {id:userId}= req.user;
    const comment = req.body.comment;
    if(postId && userId && comment){
        client.query('insert into comments (user_id,post_id,text) values($1,$2,$3)',[userId,postId,comment],(err,result)=>{
            if(err){
                res.json({
                    message:err.message
                })
            }else{
                res.json({
                    message:'comment added'
                })
            }
        })
    }
})

// update a comment 

postRouter.patch('/updatecomment/:id',protectedRoute,(req,res)=>{
    const commentId = req.params.id;
    const comment = req.body.comment;
    if(commentId && comment){
        client.query('update comments set text=$1 where id=$2',[comment,commentId],(err,result)=>{
            if(err){
                res.json({
                    message:err.message
                })
            }else{
                res.json({
                    message:'comment updated'
                })
            }
        })
    }
})

// delete a comment 

postRouter.delete('/deletecomment/:id',protectedRoute,(req,res)=>{
    const commentId = req.params.id;
    if(commentId){
        client.query('delete from comments where id=$1',[commentId],(err,result)=>{
            if(err){
                res.json({
                    message:err.message
                })
            }else{
                res.json({
                    message:'comment deleted'
                })
            }
        })
    }
})


// get comments of a post with comment user details

postRouter.get('/getcomment/:id',protectedRoute,(req,res)=>{
    const postId = req.params.id;
    if(postId){
        client.query('select c.post_id,c.user_id,text,fullname,email from comments as c inner join posts as p on c.post_id = p.id inner join users as u on c.user_id = u.id where p.id=$1;',[postId],(err,result)=>{
            if(err){
                res.json({
                    message:err.message
                })
            }else{
                res.json({
                    message:result.rows
                })
            }
        })
    }
})



module.exports=postRouter;