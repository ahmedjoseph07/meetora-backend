import crypto from "crypto";
import statusCode from "http-status";
import {User} from "../models/UserModel.js";
import  bcrypt,{hash} from "bcrypt";

const login = async(req,res)=>{
    const {username,password} = req.body;
    if(!username|| !password){
        res.status(statusCode.BAD_REQUEST).json({message:"Provide Credentials"})
    } 
    try {
        const user = await User.findOne({username})
        if(!user){
            return res.status(statusCode.NOT_FOUND).json({message:"User Not Found"});
        }
        if(bcrypt.compare(password,user.password)){
            let token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(statusCode.OK).json({token:token})
        }
    } catch (err) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({message:`Something went wrong ${err}`})
    }
}

const register = async(req,res) =>{
    const {name,username,password} = req.body;

    try {
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(statusCode.FOUND).json({message:"User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password,12);

        const newUser = new User({
            name:name,
            username:username,
            password:hashedPassword
        })

        await newUser.save();
        res.status(statusCode.CREATED).json({message:"User registered successfully"})

    } catch (err)
    {
        res.json({message:"Something went wrong"})
    }
}


export {login,register}