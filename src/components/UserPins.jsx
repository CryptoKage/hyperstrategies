// ==============================================================================
// START: REPLACE the PinImage component in UserPins.jsx
// ==============================================================================
export const PinImage = ({ pinName, description = '' }) => {
    if (!pinName) {
        return <div className="pin-image-wrapper missing-image" title="Unknown Pin">?</div>;
    }
    
    // --- THIS IS THE FIX ---
    // We remove all spaces from the pin name before creating the filename.
    // "EARLY SUPPORTER" now correctly becomes "EARLYSUPPORTER".
    const sanitizedPinName = pinName.replace(/\s/g, '');
    const imageName = `${sanitizedPinName.toUpperCase()}.png`;
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
