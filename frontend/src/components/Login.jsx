import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

const Login = () => {
    const[input,setInput]=useState({
        email:"",
        password:""
    });
    const [loading,setLoading]=useState(false);
    const Navigate =useNavigate();
    const dispatch=useDispatch ();
    const changeEventHandler=(e)=>{
        setInput({...input,[e.target.name]:e.target.value});
    }

        const singupHandler = async(e) =>{
            e.preventDefault();
         
             try {
                setLoading(true);
                const res = await axios.post('http://localhost:8000/api/v1/user/login',input,{
                    headers:{
                        'Content-Type':'application/json'
                    },
                    withCredentials:true
                });
                if(res.data.success){
                    dispatch(setAuthUser(res.data.user));
                    Navigate('/')
                    toast.success(res.data.message);
                      setInput({ 
                        email:"",
                        password:""
                        })
                }
             } catch (error) {
                console.log(error);
                toast.error(error.response.data.message);
             } finally{
                setLoading(false);
             }
        }
  return (
    <div className='flex items-center w-screen h-screen justify-center'>
        <form onSubmit={singupHandler} className=' shadow-lg flex flex-col gap-5 p-8'>
        <div className='my-4'>
            <h1 className='text-center font-bold text-xl'>LOGO</h1>
            <p className='text-sm text-center'>Login to see Photos & Videos from your friends</p>
        </div>

         <div>
            <span className='font-medium flex'>Email</span>
            <Input type="email" 
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2" />
        </div>
         <div>
            <span className='font-medium flex'>Password</span>
            <Input type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2" />
        </div>
            {
                loading?(
                    <Button>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Please wait
                    </Button>):(
                                 <Button  type="submit" className="bg-slate-950 text-white"> Login</Button>
                    )
            }
                    <span className='text-center'> Don't have an account ?<Link to="/singup" className="text-blue-600">Singup</Link>
                    </span>
        </form>
   </div>
  )
}

export default Login
