import React, { useContext, useState } from 'react'
import AdminNav from '../components/AdminNav'
import AdminSidebar from '../components/AdminSidebar'
import upload from '../assets/upload image.jpg'
import { authDataContext } from '../../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../component/Loading'

function AdminAdd() {
  let [image1, setImage1] = useState(false)
  let [image2, setImage2] = useState(false)
  let [image3, setImage3] = useState(false)
  let [image4, setImage4] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Men")
  const [price, setPrice] = useState("")
  const [subCategory, setSubCategory] = useState("TopWear")
  const [bestseller, setBestSeller] = useState(false)
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(false)
  let { serverUrl } = useContext(authDataContext)

  const handleAddProduct = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      let formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))
      formData.append("image1", image1)
      formData.append("image2", image2)
      formData.append("image3", image3)
      formData.append("image4", image4)

      let result = await axios.post(serverUrl + "/api/product/addproduct", formData, { withCredentials: true })

      toast.success("ADD Product Successfully")
      setLoading(false)

      if (result.data) {
        setName("")
        setDescription("")
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice("")
        setBestSeller(false)
        setCategory("Men")
        setSubCategory("TopWear")
      }
    } catch (error) {
      setLoading(false)
      toast.error("Add Product Failed")
    }
  }

  return (
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-[white] overflow-x-hidden relative'>
      <AdminNav />
      <AdminSidebar />

      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        <form action="" onSubmit={handleAddProduct} className='w-[100%] md:w-[90%] h-[100%] mt-[70px] flex flex-col gap-[30px] py-[90px] px-[30px] md:px-[60px]'>
          <div className='w-[400px] h-[50px] text-[25px] md:text-[40px] text-white'>Add Product Page</div>

          <div className='w-[80%] h-[130px] flex items-start justify-center flex-col mt-[20px] gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Upload Images</p>
            <div className='w-[100%] h-[100%] flex items-center justify-start'>
              <label htmlFor="image1" className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
                <img src={!image1 ? upload : URL.createObjectURL(image1)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
                <input type="file" id='image1' hidden onChange={(e) => setImage1(e.target.files[0])} required />
              </label>
              <label htmlFor="image2" className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
                <img src={!image2 ? upload : URL.createObjectURL(image2)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
                <input type="file" id='image2' hidden onChange={(e) => setImage2(e.target.files[0])} required />
              </label>
              <label htmlFor="image3" className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
                <img src={!image3 ? upload : URL.createObjectURL(image3)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
                <input type="file" id='image3' hidden onChange={(e) => setImage3(e.target.files[0])} required />
              </label>
              <label htmlFor="image4" className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
                <img src={!image4 ? upload : URL.createObjectURL(image4)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
                <input type="file" id='image4' hidden onChange={(e) => setImage4(e.target.files[0])} required />
              </label>
            </div>
          </div>

          <div className='w-[80%] h-[100px] flex items-start justify-center flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Name</p>
            <input type="text" placeholder='Type here' className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]' onChange={(e) => setName(e.target.value)} value={name} required />
          </div>

          <div className='w-[80%] flex items-start justify-center flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Description</p>
            <textarea placeholder='Type here' className='w-[600px] max-w-[98%] h-[100px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] py-[10px] text-[18px] placeholder:text-[#ffffffc2]' onChange={(e) => setDescription(e.target.value)} value={description} required />
          </div>

          <div className='w-[80%] flex items-center gap-[10px] flex-wrap'>
            <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold w-[100%]'>Product Category</p>
              <select className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px]' onChange={(e) => setCategory(e.target.value)}>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
            <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold w-[100%]'>Sub-Category</p>
              <select className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px]' onChange={(e) => setSubCategory(e.target.value)}>
                <option value="TopWear">TopWear</option>
                <option value="BottomWear">BottomWear</option>
                <option value="WinterWear">WinterWear</option>
              </select>
            </div>
          </div>

          <div className='w-[80%] h-[100px] flex items-start justify-center flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Price</p>
            <input type="number" placeholder='₹ 2000' className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]' onChange={(e) => setPrice(e.target.value)} value={price} required />
          </div>

          <div className='w-[80%] h-[220px] md:h-[100px] flex items-start justify-center flex-col gap-[10px] py-[10px] md:py-[0px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Size</p>
            <div className='flex items-center justify-start gap-[15px] flex-wrap'>
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <div key={size} className={`px-[20px] py-[7px] rounded-lg bg-slate-600 text-[18px] hover:border-[#46d1f7] border-[2px] cursor-pointer ${sizes.includes(size) ? "bg-green-400 text-black border-[#46d1f7]" : ""}`} onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size])}>{size}</div>
              ))}
            </div>
          </div>

          <div className='w-[80%] flex items-center justify-start gap-[10px] mt-[20px]'>
            <input type="checkbox" id='checkbox' className='w-[25px] h-[25px] cursor-pointer' onChange={() => setBestSeller(prev => !prev)} />
            <label htmlFor="checkbox" className='text-[18px] md:text-[22px] font-semibold'>Add to BestSeller</label>
          </div>

          <button className='w-[140px] px-[20px] py-[20px] rounded-xl bg-[#65d8f7] flex items-center justify-center gap-[10px] text-black active:bg-slate-700 active:text-white active:border-[2px] border-white'>{loading ? <Loading /> : "Add Product"}</button>
        </form>
      </div>
    </div>
  )
}

export default AdminAdd
