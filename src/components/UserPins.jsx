// ==============================================================================
// FINAL, DEFINITIVE VERSION: PASTE THIS to replace your full UserPins.jsx file
// ==============================================================================
import React from 'react';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item); });
  return images;
}

const pinImages = importAll(require.context('../assets/Decals', false, /\.(png|jpe?g)$/i));

/**
 * A robust component that displays a single pin image.
 * It prioritizes using a direct filename but falls back to sanitizing the pin name.
 * @param {{ pinName: string, imageFilename?: string, description?: string }} props
 */
export const PinImage = ({ pinName, imageFilename, description = '' }) => {
    if (!pinName) {
        return <div className="pin-image-wrapper missing-image" title="Unknown Pin">?</div>;
    }

    let imageName;
    if (imageFilename) {
        // Preferred: Use the direct, reliable filename from the API.
        imageName = imageFilename;
    } else {
        // Fallback: Sanitize the pinName.
        const sanitizedPinName = pinName.replace(/\s/g, '');
        imageName = `${sanitizedPinName.toUpperCase()}.png`;
    }
    
    // --- THIS IS THE FIX ---
    // Use the correct 'pinImages' variable (with an 's').
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
