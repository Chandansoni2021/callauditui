// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { FaLinkedinIn, FaArrowLeft } from 'react-icons/fa';
// import { Link, useNavigate } from 'react-router-dom';
// import microsoft from '../assets/microsoft.png';
 
// const LoginPage = ({ onLogin }) => {
//   // Form states
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [signUpUsername, setSignUpUsername] = useState('');
//   const [signUpEmail, setSignUpEmail] = useState('');
//   const [signUpPassword, setSignUpPassword] = useState('');
 
//   // UI states
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [error, setError] = useState('');
//   const [signUpError, setSignUpError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSignUpLoading, setIsSignUpLoading] = useState(false);
//   const [isCheckingToken, setIsCheckingToken] = useState(true);
 
//   const navigate = useNavigate();
 
//   // Handle token refresh
//   const handleRefreshToken = async (refreshToken) => {
//     try {
//       const response = await fetch('  /refresh', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ refresh_token: refreshToken })
//       });
 
//       if (!response.ok) {
//         throw new Error('Failed to refresh token');
//       }
 
//       const data = await response.json();
//       localStorage.setItem('access_token', data.access_token);
//       if (data.refresh_token) {
//         localStorage.setItem('refresh_token', data.refresh_token);
//       }
//       return data.access_token;
//     } catch (error) {
//       console.error('Refresh token error:', error);
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//       return null;
//     }
//   };
 
//   // Handle logout
//   const handleLogout = () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//     onLogin(false);
//     navigate('/login');
//   };
 
//   // Check for existing tokens on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       const accessToken = localStorage.getItem('access_token');
//       const refreshToken = localStorage.getItem('refresh_token');
     
//       if (!accessToken) {
//         setIsCheckingToken(false);
//         return;
//       }
 
//       try {
//         // Verify token by making a simple request
//         const response = await fetch('http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/protected', {
//           headers: {
//             'Authorization': `Bearer ${accessToken}`
//           }
//         });
       
//         if (response.ok) {
//           onLogin(true);
//           navigate('/dashboard');
//           return;
//         }
       
//         // If access token is invalid, try to refresh
//         if (refreshToken) {
//           const newToken = await handleRefreshToken(refreshToken);
//           if (newToken) {
//             onLogin(true);
//             navigate('/dashboard');
//             return;
//           }
//         }
       
//         // If we get here, tokens are invalid
//         handleLogout();
//       } catch (err) {
//         console.error('Auth check error:', err);
//         handleLogout();
//       } finally {
//         setIsCheckingToken(false);
//       }
//     };
   
//     checkAuth();
//   }, [navigate, onLogin]);
 
//   // Sign-in handler
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
 
//     try {
//       const response = await fetch('http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/token', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Accept': 'application/json',
//         },
//         body: new URLSearchParams({
//           username: username,
//           password: password,
//           grant_type: 'password'
//         })
//       });
     
//       const data = await response.json();
     
//       if (!response.ok) {
//         throw new Error(data.detail || data.message || 'Login failed');
//       }
 
//       // Store both tokens
//       localStorage.setItem('access_token', data.access_token);
//       localStorage.setItem('refresh_token', data.refresh_token);
     
//       onLogin(true);
//       navigate('/dashboard');
//     } catch (err) {
//       console.error('Login error:', err);
//       setError(err.message || 'An error occurred during login');
//     } finally {
//       setIsLoading(false);
//     }
//   };
 
//   // Sign-up handler
//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     setIsSignUpLoading(true);
//     setSignUpError('');
 
//     try {
//       const formData = new FormData();
//       formData.append('username', signUpUsername);
//       formData.append('email_id', signUpEmail);
//       formData.append('password', signUpPassword);
 
//       const response = await fetch('http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/register', {
//         method: 'POST',
//         body: formData
//       });
 
//       const result = await response.json();
 
//       if (!response.ok || !result.success) {
//         throw new Error(result.message || 'Registration failed');
//       }
 
//       // Clear form and show success
//       setSignUpUsername('');
//       setSignUpEmail('');
//       setSignUpPassword('');
//       setIsSignUp(false);
//       setError('Registration successful! Please sign in.');
//     } catch (err) {
//       console.error('Sign up error:', err);
//       setSignUpError(err.message || 'An error occurred during registration');
//     } finally {
//       setIsSignUpLoading(false);
//     }
//   };
 
//   // Loading state while checking token
//   if (isCheckingToken) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
//           <p className="mt-4 text-white">Checking your session...</p>
//         </div>
//       </div>
//     );
//   }
 
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, ease: 'easeOut' }}
//       className="flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-8 min-h-screen"
//     >
//       <div className="relative w-full max-w-5xl">
//         <Link
//           to="/"
//           className="fixed top-6 left-6 text-white text-2xl z-50 hover:text-gray-200 transition"
//         >
//           <FaArrowLeft />
//         </Link>
 
//         <div className="bg-white rounded-2xl shadow-2xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
//           {/* Left Side */}
//           <div className="relative">
//             <div className={`rounded-[1rem] border-2 border-white absolute inset-0 p-10 text-white
//               bg-[rgba(0,0,255,0.6)] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
//               backdrop-blur-[20px]
//               flex flex-col items-center justify-center text-center
//               transition-opacity duration-700 ${isSignUp ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
//               <h2 className="text-3xl font-bold mb-4">Revolutionize Your Hiring</h2>
//               <p className="mb-4">AI-powered applicant tracking that finds the perfect candidates faster than ever before.</p>
//               <div className="flex justify-center space-x-4 mb-4">
//                 <button className="p-2 bg-gray-200 rounded-full">
//                   <img src={microsoft} alt="Microsoft Login" className="w-6 h-6" />
//                 </button>
//               </div>
//               <button
//                 onClick={() => setIsSignUp(false)}
//                 className="border border-white px-6 py-2 rounded-full bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition"
//               >
//                 Sign In
//               </button>
//             </div>
 
//             {/* Sign In Form */}
//             <div className={`p-8 transition-transform duration-700 ${isSignUp ? '-translate-x-full opacity-0 absolute w-full' : 'opacity-100 static'}`}>
//               <form onSubmit={handleLogin}>
//                 <h1 className="text-3xl font-bold mb-4 text-center">Sign In to Meridian 👋</h1>
//                 <div className="flex justify-center space-x-4 mb-4">
//                   <button type="button" className="p-2 bg-gray-200 rounded-full">
//                     <FaLinkedinIn />
//                   </button>
//                 </div>
//                 <p className="text-sm text-center mb-4">or use your account</p>
               
//                 {error && (
//                   <div className={`mb-4 p-2 rounded text-sm ${error.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                     {error}
//                   </div>
//                 )}
               
//                 <input
//                   type="text"
//                   placeholder="Username"
//                   className="w-full p-3 mb-3 border rounded"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required
//                 />
//                 <input
//                   type="password"
//                   placeholder="Password"
//                   className="w-full p-3 mb-3 border rounded"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//                 <button
//                   type="submit"
//                   className="w-full bg-indigo-600 text-white py-2 rounded-full hover:bg-indigo-700 transition flex justify-center items-center"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Signing In...
//                     </>
//                   ) : 'Sign In'}
//                 </button>
//                 <div className="mt-8 flex justify-center text-sm text-indigo-600 mb-3 inline-block">
//                   <button type="button">Forgot your password?</button>
//                 </div>
//               </form>
//             </div>
//           </div>
 
//           {/* Right Side */}
//           <div className="relative">
//             <div className={`rounded-[1rem] border-2 border-white absolute inset-0 p-10 text-white
//               bg-[rgba(0,0,255,0.6)] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
//               backdrop-blur-[20px]
//               flex flex-col items-center justify-center text-center
//               transition-opacity duration-700 ${isSignUp ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
//               <h2 className="text-3xl font-bold mb-4">Join Meridian Today!</h2>
//               <p className="mb-4">Enter your personal details and start your journey with us.</p>
//               <div className="flex justify-center space-x-4 mb-4">
//                 <button className="p-2 bg-gray-200 rounded-full">
//                   <img src={microsoft} alt="Microsoft Login" className="w-6 h-6" />
//                 </button>
//               </div>
//               <button
//                 onClick={() => setIsSignUp(true)}
//                 className="border border-white px-6 py-2 rounded-full bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition"
//               >
//                 Sign Up
//               </button>
//             </div>
 
//             {/* Sign Up Form */}
//             <div className={`p-8 transition-transform duration-700 absolute md:static w-full ${isSignUp ? 'opacity-100 static' : 'opacity-0 translate-x-full absolute'}`}>
//               <form onSubmit={handleSignUp}>
//                 <h1 className="text-3xl font-bold mb-4 text-center">Create a Meridian Account 🚀</h1>
//                 <div className="flex justify-center space-x-4 mb-4">
//                   <button type="button" className="p-2 bg-gray-200 rounded-full">
//                     <FaLinkedinIn />
//                   </button>
//                 </div>
//                 <p className="text-sm text-center mb-4">or use your email for registration</p>
               
//                 {signUpError && (
//                   <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
//                     {signUpError}
//                   </div>
//                 )}
               
//                 <input
//                   type="text"
//                   placeholder="User Name"
//                   className="w-full p-3 mb-3 border rounded"
//                   value={signUpUsername}
//                   onChange={(e) => setSignUpUsername(e.target.value)}
//                   required
//                 />
//                 <input
//                   type="email"
//                   placeholder="Email"
//                   className="w-full p-3 mb-3 border rounded"
//                   value={signUpEmail}
//                   onChange={(e) => setSignUpEmail(e.target.value)}
//                   required
//                 />
//                 <input
//                   type="password"
//                   placeholder="Password"
//                   className="w-full p-3 mb-3 border rounded"
//                   value={signUpPassword}
//                   onChange={(e) => setSignUpPassword(e.target.value)}
//                   required
//                 />
//                 <button
//                   type="submit"
//                   className="w-full bg-indigo-600 text-white py-2 rounded-full hover:bg-indigo-700 transition flex justify-center items-center"
//                   disabled={isSignUpLoading}
//                 >
//                   {isSignUpLoading ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Registering...
//                     </>
//                   ) : 'Sign Up'}
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
 
//         {/* Footer */}
//         <div className="text-center mt-12 text-white text-xs">
//           <p>Meridian Solutions Pvt. Ltd. © 2025. All rights reserved</p>
//           <p className="mt-1">Singapore • US • India • UAE</p>
//         </div>
//       </div>
//     </motion.div>
//   );
// };
 
// export default LoginPage;
 
 