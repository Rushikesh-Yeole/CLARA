import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from './loading';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const ACCESS_TOKEN = 'access_token';

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [id, setId] = useState("");
    const [classes, setClasses] = useState([""]);
    const [loading, setLoading] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const navigate = useNavigate();
    const methodName = method === 'login' ? "Login" : "Register";

    // Animation on mount
    useEffect(() => {
        setAnimateIn(true);
    }, []);

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            let response;
            if (method === 'login') {
                // Match the TeacherLogin model in auth.py
                response = await axios.post(route, { 
                    username, 
                    password 
                });
                
                // Store token according to the Token model in auth.py
                localStorage.setItem(ACCESS_TOKEN, response.data.access_token);
                
                // Success notification
                toast.success('Login successful!', {
                    duration: 3000,
                    position: 'top-center',
                });

                // Success animation before redirect
                setAnimateIn(false);
                setTimeout(() => {
                    navigate('/');
                }, 600);
            } else {
                // Match the TeacherRegister model in main.py
                response = await axios.post(route, { 
                    id, 
                    name: username, 
                    password, 
                    classes 
                });
                
                // Success notification
                toast.success('Registration successful! Redirecting to login...', {
                    duration: 3000,
                    position: 'top-center',
                });

                // Success animation before redirect
                setAnimateIn(false);
                setTimeout(() => {
                    navigate('/login');
                }, 600);
            }
        }
        catch (error) {
            console.error("Error:", error.response?.data || error.message);
            if (method === 'login') {
                toast.error('Invalid credentials or account not registered', {
                    duration: 4000,
                    position: 'top-center',
                });
            } else {
                toast.error('Please enter valid credentials or account already exists', {
                    duration: 4000,
                    position: 'top-center',
                });
            }
        } finally {
            setLoading(false);
        }
    }

    const handleClassChange = (index, value) => {
        const newClasses = [...classes];
        newClasses[index] = value;
        setClasses(newClasses);
    };

    const addClassField = () => {
        setClasses([...classes, ""]);
    };

    const removeClassField = (index) => {
        const newClasses = classes.filter((_, i) => i !== index);
        setClasses(newClasses);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <Toaster />
            <div 
                className={`max-w-md w-full bg-white p-8 rounded-xl shadow-xl transform transition-all duration-500 
                ${animateIn ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'} 
                hover:shadow-2xl border border-slate-100`}
            >
                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-slate-800 mb-1 transition-all duration-300">{methodName}</h1>
                        <div className="w-16 h-1 bg-indigo-600 mx-auto mb-4 rounded-full transition-all duration-300 hover:w-24"></div>
                        <p className="text-slate-500 text-sm mb-6">
                            {method === 'login' ? 'Welcome back! Please enter your credentials' : 'Create your account to get started'}
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="transform transition-all duration-300 hover:translate-x-1">
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">{method === 'login' ? 'Username' : 'Name'}</label>
                            <input
                                id="username"
                                type="text"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none bg-white shadow-sm"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={method === 'login' ? 'Enter your username' : 'Enter your name'}
                                required
                            />
                        </div>
                        
                        {method === 'register' && (
                            <>
                                <div className="transform transition-all duration-300 hover:translate-x-1">
                                    <label htmlFor="id" className="block text-sm font-medium text-slate-700 mb-1">ID</label>
                                    <input
                                        id="id"
                                        type="text"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none bg-white shadow-sm"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        placeholder="Enter your ID"
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Classes</label>
                                    {classes.map((cls, index) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center space-x-2 transform transition-all duration-300 hover:translate-x-1"
                                        >
                                            <input
                                                type="text"
                                                className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none bg-white shadow-sm"
                                                value={cls}
                                                onChange={(e) => handleClassChange(index, e.target.value)}
                                                placeholder={`Class ${index + 1}`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center hover:rotate-12 shadow-sm"
                                                onClick={() => removeClassField(index)}
                                                disabled={classes.length <= 1}
                                                title="Remove class"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    <div className="transform transition-all duration-300 hover:translate-y-1">
                                        <button
                                            type="button"
                                            className="w-full p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 group shadow-sm"
                                            onClick={addClassField}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>Add Class</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <div className="transform transition-all duration-300 hover:translate-x-1">
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                                {method === 'login' && (
                                    <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors" onClick={(e) => {
                                        e.preventDefault();
                                        toast.info('Password reset functionality will be available soon', {
                                            duration: 3000,
                                            position: 'top-center',
                                        });
                                    }}>Forgot Password?</a>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none bg-white shadow-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>
                    
                    {loading && (
                        <div className="flex justify-center">
                            <Loading />
                        </div>
                    )}
                    
                    <div className="space-y-3 pt-2">
                        <button
                            type="submit"
                            className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 font-medium group shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            <span className="group-hover:animate-pulse">{loading ? `${methodName}...` : methodName}</span>
                        </button>
                        
                        {method === 'login' ? (
                            <div className="text-center pt-2 transform transition-opacity duration-500">
                                <p className="text-slate-600 text-sm">Don't have an account?</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAnimateIn(false);
                                        toast.info('Redirecting to registration...', {
                                            duration: 2000,
                                            position: 'top-center',
                                        });
                                        setTimeout(() => navigate('/register'), 400);
                                    }}
                                    className="w-full p-3 bg-white text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transform transition-all duration-300 hover:scale-105 mt-2 font-medium shadow-sm"
                                >
                                    Register Now
                                </button>
                            </div>
                        ) : (
                            <div className="text-center pt-2 transform transition-opacity duration-500">
                                <p className="text-slate-600 text-sm">Already have an account?</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAnimateIn(false);
                                        toast.info('Redirecting to login...', {
                                            duration: 2000,
                                            position: 'top-center',
                                        });
                                        setTimeout(() => navigate('/login'), 400);
                                    }}
                                    className="w-full p-3 bg-white text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transform transition-all duration-300 hover:scale-105 mt-2 font-medium shadow-sm"
                                >
                                    Login Instead
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            {/* <div className="mt-8 text-center text-slate-500 text-xs">
                &copy; {new Date().getFullYear()} Learning Management System. All rights reserved.
            </div> */}
        </div>
    );
}

export default Form;