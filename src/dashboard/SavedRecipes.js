import React from 'react';
import { Heart } from 'lucide-react';

const SavedRecipes = ({ recipes, onToggleSave }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Saved Recipes</h2>
                <span className="text-gray-600">{recipes.length} saved recipes</span>
            </div>
            
            {recipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                    <Heart size={48} />
                    <h3 className="mt-4 text-xl font-semibold">No saved recipes yet</h3>
                    <p className="mt-2">Save recipes you love to find them easily later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map(recipe => (
                        <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800">{recipe.title}</h3>
                                <p className="text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{recipe.author}</span>
                                    <button 
                                        onClick={() => onToggleSave(recipe.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedRecipes;