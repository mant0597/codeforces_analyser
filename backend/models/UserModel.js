const mongoose=require("mongoose");
const userSchema=mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Please fill a valid email address'],
        lowercase:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
         match: [
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (#?!@$%^&*-).'
    ]
    },
    codeforces_id:{
        type:String,
        required:true,
    }
})
module.exports=mongoose.model("User",userSchema);