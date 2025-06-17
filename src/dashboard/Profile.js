import React, { useState } from 'react';
import { ChefHat, Star } from 'lucide-react';

const Profile = ({ currentUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        bio: currentUser.bio || '',
        speciality: null,
        experience: null
    });

    const handleSave = () => {
        const updatedUser = { ...currentUser, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl">
                        {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                        <div className="flex items-center gap-2 text-gray-600">
                            {currentUser.role === 'chef' && <ChefHat size={16} />}
                            <span>{currentUser.role === 'chef' ? 'Professional Chef' : 'Home Cook'}</span>
                            {currentUser.isVerified && <Star size={14} className="text-orange-500" />}
                        </div>
                        <div className="mt-2 flex gap-4 text-sm text-gray-600">
                            <div>
                                <span className="block font-medium">{currentUser.recipesCount || 0}</span>
                                <span>Recipes</span>
                            </div>
                            <div>
                                <span className="block font-medium">{currentUser.followersCount || 0}</span>
                                <span>Followers</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                {isEditing ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                rows="4"
                                placeholder="Tell us about yourself..."
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {currentUser.role === 'chef' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Specialty</label>
                                    <select
                                        value={profileData.speciality}
                                        onChange={(e) => setProfileData({...profileData, speciality: e.target.value})}
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Select specialty</option>
                                        <option value="italian">Italian Cuisine</option>
                                        <option value="french">French Cuisine</option>
                                        <option value="asian">Asian Cuisine</option>
                                        <option value="indian">Indian Cuisine</option>
                                        <option value="mediterranean">Mediterranean</option>
                                        <option value="mexican">Mexican Cuisine</option>
                                        <option value="american">American Cuisine</option>
                                        <option value="pastry">Pastry & Desserts</option>
                                        <option value="vegetarian">Vegetarian/Vegan</option>
                                        <option value="seafood">Seafood</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Experience</label>
                                    <select
                                        value={profileData.experience}
                                        onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Select experience</option>
                                        <option value="1-2">1-2 years</option>
                                        <option value="3-5">3-5 years</option>
                                        <option value="6-10">6-10 years</option>
                                        <option value="10+">10+ years</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="flex gap-4">
                            <button 
                                onClick={handleSave} 
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                Save Changes
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">About</h3>
                            <p className="text-gray-600">{currentUser.bio || 'No bio added yet.'}</p>
                        </div>

                        {currentUser.role === 'chef' && (
                            <>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Specialty</h3>
                                    <p className="text-gray-600">{currentUser.speciality || 'Not specified'}</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
                                    <p className="text-gray-600">{currentUser.experience || 'Not specified'}</p>
                                </div>
                            </>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Member Since</h3>
                            <p className="text-gray-600">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;