// ==============================================================================
// FINAL VERSION: PASTE THIS ENTIRE BLOCK to replace your full UserPins.jsx file
// This version includes both the typo fix and the space-removal logic.
// ==============================================================================
import React from 'react';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item); });
  return images;
}

const pinImages = importAll(require.context('../assets/Decals', false, /\.(png|jpe?g)$/i));

/**
 * A simple component that displays a single pin image based on its name.
 * @param {{ pinName: string, description: string }} props
 */
export const PinImage = ({ pinName, description = '' }) => {
    if (!pinName) {
        return <div className="pin-image-wrapper missing-image" title="Unknown Pin">?</div>;
    }
    
    // 1. Sanitize the name by removing spaces for the filename lookup
    const sanitizedPinName = pinName.replace(/\s/g, '');
    const imageName = `${sanitizedPinName.toUpperCase()}.png`;
    
    // 2. Use the correct 'pinImages' variable to find the imported image
    const imageSrc = pinImages[imageName];

    if (!imageSrc) {
        return <div className="pin-image-wrapper missing-image" title={`Image for ${pinName} not found`}>?</div>;
    }

    return (
        <div className="pin-image-wrapper" title={description || pinName}>
            <img 
                src={imageSrc} 
                alt={description || pinName}
                className="pin-image" 
            />
        </div>
    );
};
// ==============================================================================
// END OF FILE REPLACEMENT
// ==============================================================================
