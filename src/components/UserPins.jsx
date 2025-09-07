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
    
    // --- THIS IS THE FIX ---
    // The variable 'pinImages' (with an 's') was correctly defined above.
    // I was likely using the wrong variable name inside the component.
    const imageName = `${pinName.toUpperCase()}.png`;
    const imageSrc = pinImages[imageName]; // Use the correct variable name 'pinImages'

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
