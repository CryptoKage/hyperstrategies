
import React from 'react';
import { useTranslation } from 'react-i18next';

const ComingSoon = ({ featureKey }) => {
    const { t } = useTranslation();

    return (
        <div className="coming-soon-container">
            <h2>{t(`comingSoon.${featureKey}.title`, 'Coming Soon')}</h2>
            <p>{t(`comingSoon.${featureKey}.description`, 'This feature is currently under development. Check back soon for updates!')}</p>
        </div>
    );
};

export default ComingSoon;
