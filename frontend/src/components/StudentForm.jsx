import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './Form.css';

function StudentForm() {
    const [name, setName] = useState('');
    const [rollno, setNo] = useState('');
    const [batch, setBatch] = useState('');
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [email, setEmail] = useState('');
    
    // Animation on mount
    useEffect(() => {
        setAnimateIn(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('roll', rollno);
        formData.append('batch', batch);
        formData.append('email', email);
        images.forEach((image) => {
            formData.append(`images`, image);
        });

        try {
            const response = await fetch('http://localhost:8000/student', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                // Animate out before resetting
                setAnimateIn(false);
                
                // Success notification with toast
                toast.success('Student added successfully!', {
                    duration: 3000,
                    position: 'top-center',
                });
                
                setTimeout(() => {
                    // Reset form after successful submission
                    setName('');
                    setNo('');
                    setBatch('');
                    setEmail('');
                    setImages([]);
                    setPreviewUrls([]);
                    setAnimateIn(true);
                }, 600);
            } else {
                // Error notification with toast
                toast.error('Failed to add student', {
                    duration: 4000,
                    position: 'top-center',
                });
                
                // Add shake animation to form
                document.querySelector('form').classList.add('error-shake');
                setTimeout(() => {
                    document.querySelector('form').classList.remove('error-shake');
                }, 500);
            }
        } catch (error) {
            console.error('Error:', error);
            
            // Error notification with toast
            toast.error('An error occurred while adding the student', {
                duration: 4000,
                position: 'top-center',
            });
            
            // Add shake animation to form
            document.querySelector('form').classList.add('error-shake');
            setTimeout(() => {
                document.querySelector('form').classList.remove('error-shake');
            }, 500);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setImages(selectedFiles);
        
        // Create preview URLs for selected images
        const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
        
        // Show toast notification for uploaded images
        toast.success(`${selectedFiles.length} image(s) selected`, {
            duration: 2000,
            position: 'bottom-right',
        });
    };
    
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        // Only process image files
        const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            setImages(imageFiles);
            const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(newPreviewUrls);
            
            // Show toast notification for dropped images
            toast.success(`${imageFiles.length} image(s) uploaded via drag & drop`, {
                duration: 2000,
                position: 'bottom-right',
            });
        } else {
            // Show error toast for non-image files
            toast.error('Please upload only image files', {
                duration: 3000,
                position: 'bottom-right',
            });
        }
    };
    
    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
        
        const newUrls = [...previewUrls];
        URL.revokeObjectURL(newUrls[index]); // Clean up the URL
        newUrls.splice(index, 1);
        setPreviewUrls(newUrls);
        
        // Show toast notification for removed image
        toast.info('Image removed', {
            duration: 1500,
            position: 'bottom-right',
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            {/* Toast container */}
            <Toaster />
            
            <div 
                className={`max-w-md w-full bg-white rounded-xl shadow-lg transform transition-all duration-500 
                ${animateIn ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'} 
                hover:shadow-2xl overflow-hidden`}
            >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-0 left-0 w-20 h-20 rounded-full bg-white opacity-10 transform -translate-x-10 -translate-y-10"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 transform translate-x-16 translate-y-16"></div>
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-center">Student Entry</h1>
                        <div className="w-16 h-1 bg-white mx-auto my-3 rounded-full transition-all duration-300 hover:w-32"></div>
                        <p className="text-indigo-100 text-center">Add a new student to the database</p>
                    </div>
                </div>
                
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="transform transition-all duration-300 hover:translate-x-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                required 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none"
                                placeholder="Enter student's full name"
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="transform transition-all duration-300 hover:translate-x-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                                <input 
                                    type="text" 
                                    value={rollno} 
                                    required 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none"
                                    placeholder="e.g. 21278"
                                    onChange={(e) => setNo(e.target.value)}
                                />
                            </div>
                            
                            <div className="transform transition-all duration-300 hover:translate-x-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                                <input 
                                    type="text" 
                                    value={batch} 
                                    required 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none"
                                    placeholder="e.g. 2h2"
                                    onChange={(e) => setBatch(e.target.value)}
                                />                            
                            </div>                  
                        </div>
                        <div className="transform transition-all duration-300 hover:translate-x-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    required 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none"
                                    placeholder="Enter student's email"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                        </div>                          
                        
                        <div className="transform transition-all duration-300 hover:translate-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos</label>
                            <div 
                                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-200
                                ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="space-y-1 text-center">
                                    <svg 
                                        className={`mx-auto h-12 w-12 transition-all duration-300 ${isDragging ? 'text-indigo-500 scale-110' : 'text-gray-400'}`}
                                        stroke="currentColor" 
                                        fill="none" 
                                        viewBox="0 0 48 48" 
                                        aria-hidden="true"
                                    >
                                        <path 
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none transition-all duration-200">
                                            <span className="hover:underline">Upload files</span>
                                            <input 
                                                type="file" 
                                                multiple 
                                                required 
                                                className="sr-only"
                                                onChange={handleImageChange}
                                                accept="image/*"
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 10MB
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {previewUrls.length > 0 && (
                            <div className="mt-2 animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Images</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative h-20 rounded-md overflow-hidden group">
                                            <img 
                                                src={url} 
                                                alt={`Preview ${index}`} 
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            className="w-full p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 font-medium flex items-center justify-center button-hover-effect"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add Student
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
            {/* <div className="mt-8 text-center text-slate-500 text-xs">
                &copy; {new Date().getFullYear()} Learning Management System. All rights reserved.
            </div> */}
        </div>
    );
}

export default StudentForm;