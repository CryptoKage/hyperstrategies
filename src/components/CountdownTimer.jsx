// src/components/CountdownTimer.jsx
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expiryTimestamp }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryTimestamp) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60); // Update every minute is fine, no need for seconds.

    return () => clearTimeout(timer);
  });

  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && interval !== 'minutes') {
      return;
    }
    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval]}
        {interval.charAt(0)}{" "}
      </span>
    );
  });

  return (
    <div className="countdown-timer">
      {timerComponents.length ? timerComponents : <span>Unlocked</span>}
    </div>
  );
};

export default CountdownTimer;