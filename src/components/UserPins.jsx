// FILE: /src/components/UserPins.jsx
// This is the new, upgraded component that displays Pin images.

import React, { useState, useEffect } from 'react';
import api from '../api/api'; // Assuming your centralized API client

const UserPins = ({ userPinNames }) => {
    const [allPinDefs, setAllPinDefs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all possible pin definitions when the component mounts
    useEffect(() => {
        const fetchPinDefinitions = async () => {
            try {
                const response = await api.get('/pins/definitions');
                setAllPinDefs(response.data);
            } catch (error) {
                console.error("Could not fetch pin definitions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPinDefinitions();
    }, []);

    // If the user has no pins, or we are loading, render nothing.
    if (isLoading || !userPinNames || !Array.isArray(userPinNames) || userPinNames.length === 0) {
        return null;
    }

    // Filter the full list of definitions to get only the pins this user owns.
    const userOwnedPins = allPinDefs.filter(def => userPinNames.includes(def.pin_name));

    if (userOwnedPins.length === 0) return null;

    return (
        <div className="user-pins-container">
            <h4>Pins</h4>
            <div className="pins-list">
                {userOwnedPins.map(pin => (
                    <div key={pin.pin_name} className="pin-image-wrapper" title={`${pin.pin_name}: ${pin.pin_description}`}>
                        <img 
                            src={pin.image_url} 
                            alt={pin.pin_description} 
                            className="pin-image" 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserPins;
