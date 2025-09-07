
import React from 'react';

// This technique tells the build system (Webpack) to include all .png files from this directory.
const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item); });
  return images;
}

// Dynamically import all images from the Decals folder
export const PinImage = ({ pinName, description = '' }) => {
    // --- THIS IS THE FIX: Add a safety check for pinName ---
    if (!pinName) {
        return <div className="pin-image-wrapper missing-image" title="Unknown Pin">?</div>;
    }
    
    const imageName = `${pinName.toUpperCase()}.png`;
    const imageSrc = pinImages[imageName];

    if (!imageSrc) {
        return <div className="pin-image-wrapper missing-image" title={`Image for ${pinName} not found`}>?</div>;
    }

    return (
        <div className="pin-image-wrapper" title={description || pinName}>
            <img src={imageSrc} alt={description || pinName} className="pin-image" />
        </div>
    );
};
