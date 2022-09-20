const jsonwebtoken = require('jsonwebtoken');
const secretKey = "cdninisi12kdii%$";

function protectedRoute(req,res,next){
    const token = req.cookies['LoginCookie'];
    if(token){
       jsonwebtoken.verify(token,secretKey,(err,user)=>{
           if(!err && user){
               req.user = user;
               next();
           }else{
               res.json({
                   message:err.message
               })
           }
       })
    }else{
        res.json({
            message:'unauthorised',
        })
    }
}


module.exports = protectedRoute;