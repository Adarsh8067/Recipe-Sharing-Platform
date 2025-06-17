import React from 'react';
import { TrendingUp } from 'lucide-react';
import RecipeCard from './RecipeCard';

const RecipeFeed = ({ recipes, currentUser, savedRecipes, onToggleSave }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Latest Recipes</h2>
                <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp size={16} />
                    <span>{recipes.length} recipes</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map(recipe => (
                    <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        currentUser={currentUser}
                        isSaved={savedRecipes.includes(recipe.id)}
                        onToggleSave={onToggleSave}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecipeFeed;