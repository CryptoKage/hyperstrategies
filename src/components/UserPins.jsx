// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// START: REPLACE the PinImage component in UserPins.jsx with this final version
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
/**
 * A robust component that displays a single pin image.
 * It prioritizes using a direct filename but falls back to sanitizing the pin name.
 * @param {{ pinName: string, imageFilename?: string, description?: string }} props
 */
export const PinImage = ({ pinName, imageFilename, description = '' }) => {
    if (!pinName) {
        return <div className="pin-image-wrapper missing-image" title="Unknown Pin">?</div>;
    }

    // --- THIS IS THE NEW LOGIC ---
    let imageName;
    if (imageFilename) {
        // 1. (Preferred) Use the direct, reliable filename from the API if it exists.
        imageName = imageFilename;
    } else {
        // 2. (Fallback) If the filename isn't provided, sanitize the pinName as we did before.
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
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// END OF REPLACEMENT
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
