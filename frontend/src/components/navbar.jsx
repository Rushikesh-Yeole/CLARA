import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <nav className="bg-gray-800 p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <NavLink to='/' className='text-white px-3 py-2 rounded-md text-lg font-medium hover:bg-gray-700'>Capture Videos</NavLink>
                    <NavLink to='/login' className='text-white px-3 py-2 rounded-md text-lg font-medium hover:bg-gray-700'>Login</NavLink>
                    <NavLink to='/viewattendance' className='text-white px-3 py-2 rounded-md text-lg font-medium hover:bg-gray-700'>View Attendance</NavLink>
                </div>
                <div className="text-white text-4xl font-bold text-center mr-30"><h1 className="mr-40">Attendance System</h1></div>
                <div className="relative inline-block text-left" ref={dropdownRef}>
                    <button onClick={toggleDropdown} className='text-white px-3 py-2 rounded-md text-lg font-medium hover:bg-gray-700'>
                        Register
                    </button>
                    {isDropdownOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <NavLink to='/register' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100' role="menuitem">Register Teacher</NavLink>
                                <NavLink to='/registerstudents' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100' role="menuitem">Register Students</NavLink>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}

export default Navbar;