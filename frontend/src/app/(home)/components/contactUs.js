// import React from 'react';
// import styles from '@/app/(home)/styles/Profile.module.css'
// import { useForm } from 'react-hook-form';
// import { useDispatch } from 'react-redux';
// import { loader } from '../redux/loaderSlice';
// import { addToast } from '../redux/toastSlice';

// const page = () => {

//     const url = process.env.NEXT_PUBLIC_API_URL
//     const {register, handleSubmit ,formState:{errors},reset} = useForm();
//     const dispatch = useDispatch();

//     const onSubmit = async (data) =>{
//         dispatch(loader(true))
//         try{
//             const response = await fetch(`${url}/contact/`,{
//                 method:"POST",
//                 headers:{
//                     "Content-Type":"application/json",
//                 },
//                 body:JSON.stringify({data})
//             })
//             const json = await response.json();
//             if(json.success){
//                 dispatch(addToast({message:json.message,type:"success"}))
//                 reset();
//             }else{
//                 dispatch(addToast({message:json.message,type:"error"}))
//                 reset();
//             }

//         }catch(error){
//             console.log("Internal server error",error);
//         }finally{
//             dispatch(loader(false))
//         }

//     }

//     return (
//         <form className={styles.form_container}>
//             <div className="row mb-3">
//                 <h3 className={styles.heading}><b>Contact us</b></h3>
//                 {/* <label htmlFor="email">Edit profile</label> */}
//                 {/* First Name */}
//                 <div className="col-md-6">

//                     <div className="input-field">
//                         <label htmlFor="email">FirstName</label>
//                         <div className="input">
//                             <input
//                                 type="text"
//                                 placeholder="Enter your FirstName"
//                                 id="contact"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Last Name */}
//                 <div className="col-md-6">
//                     <div className="input-field">
//                         <label htmlFor="email">Last Name</label>
//                         <div className="input">
//                             <input
//                                 type="text"
//                                 placeholder="Enter your Last Name"
//                                 id="contact"
//                             //   className="form-control"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="row mb-3">
//                 {/* Email */}
//                 <div className="col-md-6">
//                     <div className="input-field">
//                         <label htmlFor="email">Email</label>
//                         <div className="input">
//                             <input
//                                 type="text"
//                                 placeholder="Enter your Email Address"
//                                 id="email"
//                             //   className="form-control"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* How we can help you? */}
//                 <div className="row mb-3">
//                     <div className="col-12">
//                         <div className="input-field">
//                             <label htmlFor="help">How we can help you?</label>
//                             <div className="input">
//                                 <textarea
//                                     id="help"
//                                     placeholder="Enter your message here"
//                                     rows="4"
//                                     className={styles.textarea}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className={styles.button_container}>
//                     <button type="button" className={styles.cancel_button}>Cancel</button>
//                     <button type="submit" className={styles.button}>Save Changes</button>
//                 </div>

//             </div>

//         </form>

//     );
// };

// export default page;
