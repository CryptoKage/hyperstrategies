// ==============================================================================
// START: PASTE THIS ENTIRE BLOCK into your new src/components/TelegramLoginButton.jsx
// ==============================================================================
import React, { useEffect, useRef } from 'react';

const TelegramLoginButton = ({ onAuth }) => {
  const componentRef = useRef(null);

  useEffect(() => {
    // We only want to run this effect once, when the component mounts.
    const container = componentRef.current;
    if (!container) return;

    // This function will be called by the Telegram script after successful authentication.
    window.onTelegramAuth = (user) => {
      // Pass the authenticated user data up to the parent component (Profile.jsx)
      onAuth(user);
    };

    // Create the script tag for the Telegram Login Widget
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    
    // Set the necessary attributes for the widget
    script.setAttribute('data-telegram-login', process.env.REACT_APP_TELEGRAM_BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    // Append the script to our component's div.
    // This will cause the Telegram button to render here.
    container.appendChild(script);

    // Cleanup function to remove the global function when the component unmounts
    return () => {
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [onAuth]); // The effect depends on the onAuth function

  return <div ref={componentRef} />;
};

export default TelegramLoginButton;
// ==============================================================================
// END OF FILE
// ==============================================================================
