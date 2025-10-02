// src/components/ComingSoon.jsx - SIMPLIFIED VERSION

import React from 'react';

// The component now accepts the final translated text as props.
const ComingSoon = ({ title, description }) => {
    return (
        <div className="coming-soon-container">
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    );
};

export default ComingSoon;
