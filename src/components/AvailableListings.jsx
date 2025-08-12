import React, { useEffect, useState } from 'react';
import api from '../api/api';

const AvailableListings = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings');
        setListings(res.data);
      } catch (err) {
        console.error('Failed to load listings', err);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="available-listings">
      <h3>Available Listings</h3>
      <ul>
        {listings.map((l) => (
          <li key={l.id}>Tab {l.tab_id} – ${l.price}</li>
        ))}
        {listings.length === 0 && <li>No listings available</li>}
      </ul>
    </div>
  );
};

export default AvailableListings;
