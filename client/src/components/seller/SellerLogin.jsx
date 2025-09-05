import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SellerLogin = () => { 
    const {isSeller , setIsSeller, navigate, axios} = useAppContext();
    const [email , setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();
            const {data} = await axios.post('/api/seller/login',{email, password});
            if(data.success){
                setIsSeller(true);
                navigate("/seller");
            }else{
                toast.error(data.message);
            }
            
        } catch (error) {
            toast.error(error.message);
        }
        
    }

    useEffect(()=>{
        if(isSeller){
            navigate("/seller");
        }
    },[isSeller]) 

  return !isSeller &&(
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center justify-center text-sm text-gray-600'>
        <div className='flex flex-col gap-5 p-8 py-12 min-w-80 sm:min-w-96 rounded-lg shadow-xl'>
            <p className='text-2xl font-medium m-auto'>
                <span className='text-primary'>Seller</span>
                Login
            </p>
            <div className='w-full'>
                <p>Email</p>
                <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Enter your email' className='border border-gray-200 p-2 rounded w-full mt-1 outline-primary' required/>
                <p className='mt-4'>Password</p>
                <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Enter your password' className='border border-gray-200 p-2 rounded w-full mt-1 outline-primary' required/>
            </div>
            <button className='bg-primary text-white py-2 w-full rounded-md cursor-pointer mt-4'>Login</button>
        </div>
    </form>
  )
}

export default SellerLogin