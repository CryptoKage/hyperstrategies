// ==============================================================================
// FINAL, TRIPLE-CHECKED VERSION: PASTE THIS to replace your full UserPins.jsx
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
        imageName = imageFilename;
    } else {
        const sanitizedPinName = pinName.replace(/\s/g, '');
        imageName = `${sanitizedPinName.toUpperCase()}.png`;
    }
    
    // --- THIS IS THE CORRECTED LINE ---
    // The variable is 'pinImages' (with an 's').
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
