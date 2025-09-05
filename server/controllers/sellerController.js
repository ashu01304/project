// Login Seller : /api/seller/login

import jwt from 'jsonwebtoken';

export const sellerLogin = async (req, res)=>{
    try {
        const {email , password}= req.body;

    if(password=== process.env.SELLER_PASSWORD &&email === process.env.SELLER_EMAIL){
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('sellerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // use secure cookie in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // cross-site cookie in production
            maxAge: 7*24*60*60*1000 // 7 days
        });
        return res.json({success: true, message: "Login Successful"});
    }else{
        return res.json({success: false, message: "Invalid Credentials"});
    }
    } catch (error) {
        console.error({success: false, message: error.message});
    }
}

// seller isAuth : /api/seller/is-auth
export const isSellerAuth = async (req,res)=>{
    try{
        return res.json({success:true})

    }catch(error){
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Logout Seller : /api/seller/logout
export const sellerLogout = async (req, res)=>{
    try {
        res.clearCookie('sellerToken',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // use secure cookie in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // cross-site cookie in production
        });
        return res.json({success: true, message: "Logout Successful"});
    } catch (error) {
        console.error({success: false, message: error.message});
    }
}

