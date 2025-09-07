
import React from 'react';

// This technique tells the build system (Webpack) to include all .png files from this directory.
const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item); });
  return images;
}

// Dynamically import all images from the Decals folder
const pinImages = importAll(require.context('../assets/Decals', false, /\.(png|jpe?g)$/i));

/**
 * A simple component that displays a single pin image based on its name.
 * @param {{ pinName: string, description: string }} props
 */
export const PinImage = ({ pinName, description = '' }) => {
    // We derive the image key from the pin name by creating the expected filename.
    const imageName = `${pinName.toUpperCase()}.png`;
    const imageSrc = pinImages[imageName];

    if (!imageSrc) {
        // Graceful fallback for a missing image
        return (
            <div className="pin-image-wrapper missing-image" title={`Image for ${pinName} not found`}>
                ?
            </div>
        );
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
