const express = require('express');
const cors = require('cors');
const authRouter = require('./Routes/auth.js');
const postRouter = require('./Routes/posts.js');
const friendsRouter = require('./Routes/friends');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
    origin:'*'
}))

app.use(express.json());
app.use(cookieParser());

app.listen(8080,()=>{
    console.log('server is running at 8080');
})

app.get('/test',(req,res)=>{
    res.json({
        success: 'working'
    })
})

app.use('/auth',authRouter);
app.use('/post',postRouter);
app.use('/friends',friendsRouter);