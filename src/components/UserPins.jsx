// src/components/UserPins.jsx
// FINAL VERSION: This version correctly and dynamically loads images from your assets folder.

import React, { useState, useEffect } from 'react';
import api from '../api/api';

// --- THE FIX: A function to dynamically require images from the assets folder ---
// This technique tells the build system (Webpack) to include all .png files from this directory.
const importAll = (r) => {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

const pinImages = importAll(require.context('../assets/Decals', false, /\.(png|jpe?g)$/i));

const UserPins = ({ userPinNames }) => {
    const [allPinDefs, setAllPinDefs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPinDefinitions = async () => {
            try {
                const response = await api.get('/pins/definitions');
                setAllPinDefs(response.data);
            } catch (error) {
                console.error("Could not fetch pin definitions:", error);
                setError("Failed to load Pin definitions.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPinDefinitions();
    }, []);

    if (!userPinNames || !Array.isArray(userPinNames) || userPinNames.length === 0) {
        return null;
    }
    
    const userOwnedPins = allPinDefs.filter(def => userPinNames.includes(def.pin_name));

    const renderContent = () => {
        if (isLoading) return <p>Loading Pins...</p>;
        if (error) return <p className="error-message">{error}</p>;
        if (userOwnedPins.length === 0) return null;

        return (
            <div className="pins-list">
                {userOwnedPins.map(pin => {
                    // --- THE FIX: Look up the correct image path from our imported images ---
                    // The image_url from the DB (e.g., 'SHDWMF.png') is used as a key to find the real path.
                    const imageName = pin.image_url.split('/').pop(); // Extracts 'SHDWMF.png' from '/assets/Decals/SHDWMF.png'
                    const imageSrc = pinImages[imageName];

                    if (!imageSrc) {
                        // This is a graceful fallback in case an image is missing
                        return <div key={pin.pin_name} className="pin-image-wrapper missing-image" title={pin.pin_description}>?</div>;
                    }

                    return (
                        <div key={pin.pin_name} className="pin-image-wrapper" title={pin.pin_description}>
                            <img 
                                src={imageSrc} 
                                alt={pin.pin_description} 
                                className="pin-image" 
                            />
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="user-pins-container" style={{ marginTop: '1.5rem' }}>
            <h4>Pins</h4>
            {renderContent()}
        </div>
    );
};

export default UserPins;
