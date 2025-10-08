// src/components/PinSlotSkeleton.jsx

import React from 'react';

const PinSlotSkeleton = () => {
    // This component renders a placeholder box that mimics the look of a pin slot.
    // The 'skeleton' class provides the pulsing animation.
    return (
        <div className="pins-skeleton-slot skeleton">
            {/* This div is intentionally empty. Its appearance is handled entirely by CSS. */}
        </div>
    );
};

export default PinSlotSkeleton;
