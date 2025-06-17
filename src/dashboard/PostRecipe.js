import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const PostRecipe = ({ currentUser, onRecipePosted }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        cookTime: '',
        difficulty: 'Easy',
        category: '',
        image: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newRecipe = {
            id: Date.now(),
            ...formData,
            author: currentUser.name,
            authorRole: currentUser.role,
            likes: 0,
            createdAt: new Date().toISOString().split('T')[0],
            image: formData.image || 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400'
        };
        
        onRecipePosted(newRecipe);
        
        setFormData({
            title: '',
            description: '',
            ingredients: '',
            instructions: '',
            cookTime: '',
            difficulty: 'Easy',
            category: '',
            image: ''
        });
        
        alert('Recipe posted successfully!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Share a New Recipe</h2>
                <p className="text-gray-600 mt-1">Share your culinary creation with the community</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recipe Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Enter recipe title"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            required
                        >
                            <option value="">Select category</option>
                            <option value="Appetizer">Appetizer</option>
                            <option value="Main Course">Main Course</option>
                            <option value="Dessert">Dessert</option>
                            <option value="Asian">Asian</option>
                            <option value="Italian">Italian</option>
                            <option value="Mexican">Mexican</option>
                            <option value="Indian">Indian</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Brief description of your recipe"
                        rows="3"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ingredients</label>
                    <textarea
                        value={formData.ingredients}
                        onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                        placeholder="List ingredients (one per line)"
                        rows="6"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Instructions</label>
                    <textarea
                        value={formData.instructions}
                        onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                        placeholder="Step-by-step cooking instructions"
                        rows="8"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cook Time</label>
                        <input
                            type="text"
                            value={formData.cookTime}
                            onChange={(e) => setFormData({...formData, cookTime: e.target.value})}
                            placeholder="e.g., 30 mins"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
                    <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                    <PlusCircle size={20} />
                    Post Recipe
                </button>
            </form>
        </div>
    );
};

export default PostRecipe;