import React from 'react';

// A simple dictionary to map tag names to display text and styles
const tagStyles = {
  'early_supporter': { text: 'Early Supporter', style: 'badge-gold' },
  'hip_hop_syndicate': { text: 'Hip-Hop Syndicate', style: 'badge-purple' },
  // Add more tags here as you create them
};

const UserBadges = ({ tags }) => {
  // If tags array is null, empty, or not an array, render nothing
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return null;
  }

  return (
    <div className="user-badges-container">
      <h4>Tags</h4>
      <div className="badges-list">
        {tags.map(tag => {
          const tagInfo = tagStyles[tag] || { text: tag, style: 'badge-default' };
          return (
            <span key={tag} className={`badge ${tagInfo.style}`}>
              {tagInfo.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default UserBadges;