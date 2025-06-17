import React from 'react';
import { Heart, ChefHat } from 'lucide-react';

const RecipeCard = ({ recipe, currentUser, isSaved, onToggleSave }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
                <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
                <button 
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                        isSaved ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'
                    } hover:bg-orange-600 hover:text-white transition-colors`}
                    onClick={() => onToggleSave(recipe.id)}
                >
                    <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
            </div>
            
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{recipe.title}</h3>
                <p className="text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
                
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                            {recipe.author[0]}
                        </div>
                        <div>
                            <span className="block font-medium">{recipe.author}</span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                {recipe.authorRole === 'chef' && <ChefHat size={12} />}
                                {recipe.authorRole}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{recipe.cookTime}</span>
                        <span>{recipe.difficulty}</span>
                        <span className="flex items-center gap-1">
                            <Heart size={14} />
                            {recipe.likes}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;