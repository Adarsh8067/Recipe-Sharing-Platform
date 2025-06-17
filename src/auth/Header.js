import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ChefHat, Search, Bell, LogOut } from 'lucide-react';

const Header = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!user || !token) {
            navigate('/login');
            return;
        }
        
        setCurrentUser(JSON.parse(user));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!currentUser) {
        return <div className="flex items-center justify-center min-h-screen text-gray-600">Loading...</div>;
    }

    return (
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ChefHat className="text-orange-500" />
                    RecipeShare
                </h1>
            </div>
            
            <div className="flex-1 max-w-xl mx-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search recipes, ingredients, chefs..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button className="relative text-gray-600 hover:text-orange-500">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </button>
                
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center">
                        {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                    </div>
                    <div>
                        <span className="block font-medium">{currentUser.name}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            {currentUser.role === 'chef' && <ChefHat size={12} />}
                            {currentUser.role}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="text-gray-600 hover:text-orange-500">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;