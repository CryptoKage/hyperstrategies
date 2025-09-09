// ==============================================================================
// FINAL VERSION: REPLACE the PinImage component in UserPins.jsx
// ==============================================================================
export const PinImage = ({ pinName, imageFilename, description = '' }) => {
    if (!pinName) {
        return <div className="pin-image-wrapper missing-image" title="Unknown Pin">?</div>;
    }

    // --- THIS IS THE NEW LOGIC ---
    let imageName;
    if (imageFilename) {
        // 1. (Preferred) Use the direct, reliable filename from the API.
        imageName = imageFilename;
    } else {
        // 2. (Fallback) If the filename isn't provided, sanitize the pinName.
        const sanitizedPinName = pinName.replace(/\s/g, '');
        imageName = `${sanitizedPinName.toUpperCase()}.png`;
    }
    
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
// END OF REPLACEMENT
// ==============================================================================
