import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BookOpen, PlusCircle, Heart, User, Settings, LogOut, ChefHat, Search, Bell } from 'lucide-react';
import RecipeFeed from './RecipeFeed.js';
import MyRecipes from './MyRecipes.js';
import PostRecipe from './PostRecipe.js';
import SavedRecipes from './SavedRecipes.js';
import Profile from './Profile.js';
import '../styles/Dashboard.css';

// Mock recipe data
const mockRecipes = [
    {
        id: 1,
        title: "Spicy Thai Basil Chicken",
        description: "Authentic Thai dish with fresh basil and chilies",
        image: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400",
        author: "Chef Maria",
        authorRole: "chef",
        cookTime: "25 mins",
        difficulty: "Medium",
        likes: 124,
        category: "Asian",
        createdAt: "2024-06-15"
    },
    {
        id: 2,
        title: "Classic Margherita Pizza",
        description: "Traditional Italian pizza with fresh mozzarella and basil",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        author: "John Doe",
        authorRole: "user",
        cookTime: "45 mins",
        difficulty: "Hard",
        likes: 89,
        category: "Italian",
        createdAt: "2024-06-14"
    },
    {
        id: 3,
        title: "Chocolate Lava Cake",
        description: "Deadent dessert with molten chocolate center",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
        author: "Pastry Chef Anna",
        authorRole: "chef",
        cookTime: "30 mins",
        difficulty: "Medium",
        likes: 203,
        category: "Dessert",
        createdAt: "2024-06-13"
    }
];

const Dashboard = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [recipes, setRecipes] = useState(mockRecipes);
    const [savedRecipes, setSavedRecipes] = useState([]);
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

    const toggleSaveRecipe = (recipeId) => {
        setSavedRecipes(prev => 
            prev.includes(recipeId) 
                ? prev.filter(id => id !== recipeId)
                : [...prev, recipeId]
        );
    };

    const sidebarItems = [
        { id: 'home', label: 'Recipe Feed', icon: Home },
        { id: 'my-recipes', label: 'My Recipes', icon: BookOpen },
        { id: 'post-recipe', label: 'Post Recipe', icon: PlusCircle },
        { id: 'saved', label: 'Saved Recipes', icon: Heart },
        { id: 'profile', label: 'Profile', icon: User },
        ...(currentUser?.role === 'admin' ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
    ];

    if (!currentUser) {
        return <div className="flex items-center justify-center min-h-screen text-gray-600">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
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

            <div className="flex">
                <aside className="w-64 bg-white shadow-md p-4 h-[calc(100vh-68px)]">
                    <nav className="space-y-2">
                        {sidebarItems.map(item => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors ${
                                        activeTab === item.id ? 'bg-orange-50 text-orange-500' : ''
                                    }`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex-1 p-6">
                    {activeTab === 'home' && (
                        <RecipeFeed 
                            recipes={recipes} 
                            currentUser={currentUser}
                            savedRecipes={savedRecipes}
                            onToggleSave={toggleSaveRecipe}
                        />
                    )}
                    
                    {activeTab === 'my-recipes' && (
                        <MyRecipes 
                            recipes={recipes.filter(r => r.author === currentUser.name)} 
                            currentUser={currentUser}
                        />
                    )}
                    
                    {activeTab === 'post-recipe' && (
                        <PostRecipe 
                            currentUser={currentUser}
                            onRecipePosted={(recipe) => setRecipes(prev => [recipe, ...prev])}
                        />
                    )}
                    
                    {activeTab === 'saved' && (
                        <SavedRecipes 
                            recipes={recipes.filter(r => savedRecipes.includes(r.id))}
                            savedRecipes={savedRecipes}
                            onToggleSave={toggleSaveRecipe}
                        />
                    )}
                    
                    {activeTab === 'profile' && (
                        <Profile currentUser={currentUser} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;