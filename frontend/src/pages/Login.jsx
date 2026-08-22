import React, { useContext, useState } from 'react'
import Logo from "../assets/Trendoraw.png"
import { useNavigate } from 'react-router-dom'
import google from '../assets/google.png'
import { IoEyeOutline, IoEye } from "react-icons/io5"
import { authDataContext } from '../context/authContext'
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../../utils/Firebase'
import { userDataContext } from '../context/UserContext'
import { adminDataContext } from '../context/AdminContext'
import Loading from '../component/Loading'
import { toast } from 'react-toastify'

function Login() {
  let [show, setShow] = useState(false)
  let [email, setEmail] = useState("")
  let [password, setPassword] = useState("")
  let { serverUrl } = useContext(authDataContext)
  let { getCurrentUser } = useContext(userDataContext)
  let { getAdmin, setAdminData } = useContext(adminDataContext)
  let [loading, setLoading] = useState(false)

  let navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      try {
        await axios.post(serverUrl + '/api/auth/adminlogin', { email, password }, { withCredentials: true })
        await getAdmin()
        toast.success("Admin Login Successful")
        navigate("/admin")
        return
      } catch {
        // Not admin credentials, try user login
      }

      await axios.post(serverUrl + '/api/auth/login', { email, password }, { withCredentials: true })
      await getCurrentUser()
      setAdminData(null)
      toast.success("User Login Successful")
      navigate("/")
    } catch (error) {
      toast.error("Login Failed")
    } finally {
      setLoading(false)
    }
  }

  const googlelogin = async () => {
    try {
      const response = await signInWithPopup(auth, provider)
      let user = response.user
      let name = user.displayName
      let email = user.email

      await axios.post(serverUrl + "/api/auth/googlelogin", { name, email }, { withCredentials: true })
      await getCurrentUser()
      setAdminData(null)
      navigate("/")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='w-[100vw] h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-[white] flex flex-col items-center justify-start'>
      <div className='w-[100%] h-[80px] flex items-center justify-start px-[30px] gap-[10px] cursor-pointer' onClick={() => navigate("/login")}>
        <img className='w-[100px] bg-transparent' src={Logo} alt="" />
        {/* <h1 className='text-[22px] font-sans'>Trendora</h1> */}
      </div>

      <div className='w-[100%] h-[100px] flex items-center justify-center flex-col gap-[10px]'>
        <span className='text-[25px] font-semibold'>Login Page</span>
        <span className='text-[16px]'>Welcome to Trendora, Place your order</span>
      </div>

      <div className='max-w-[600px] w-[90%] h-[500px] bg-[#00000025] border-[1px] border-[#96969635] backdrop:blur-2xl rounded-lg shadow-lg flex items-center justify-center'>
        <form action="" onSubmit={handleLogin} className='w-[90%] h-[90%] flex flex-col items-center justify-start gap-[20px]'>
          <div className='w-[90%] h-[50px] bg-[#42656cae] rounded-lg flex items-center justify-center gap-[10px] py-[20px] cursor-pointer' onClick={googlelogin}>
            <img src={google} alt="" className='w-[20px]' /> Login account with Google
          </div>
          <div className='w-[100%] h-[20px] flex items-center justify-center gap-[10px]'>
            <div className='w-[40%] h-[1px] bg-[#96969635]'></div> OR <div className='w-[40%] h-[1px] bg-[#96969635]'></div>
          </div>
          <div className='w-[90%] h-[400px] flex flex-col items-center justify-center gap-[15px] relative'>
            <input type="text" className='w-[100%] h-[50px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold' placeholder='Email' required onChange={(e) => setEmail(e.target.value)} value={email} />
            <input type={show ? "text" : "password"} className='w-[100%] h-[50px] border-[2px] border-[#96969635] backdrop:blur-sm rounded-lg shadow-lg bg-transparent placeholder-[#ffffffc7] px-[20px] font-semibold' placeholder='Password' required onChange={(e) => setPassword(e.target.value)} value={password} />
            {!show && <IoEyeOutline className='w-[20px] h-[20px] cursor-pointer absolute right-[5%] bottom-[57%]' onClick={() => setShow(prev => !prev)} />}
            {show && <IoEye className='w-[20px] h-[20px] cursor-pointer absolute right-[5%] bottom-[57%]' onClick={() => setShow(prev => !prev)} />}
            <button className='w-[100%] h-[50px] bg-[#6060f5] rounded-lg flex items-center justify-center mt-[20px] text-[17px] font-semibold'>{loading ? <Loading /> : "Login"}</button>
            <p className='flex gap-[10px]'>You haven't any account? <span className='text-[#5555f6cf] text-[17px] font-semibold cursor-pointer' onClick={() => navigate("/signup")}>Create New Account</span></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
