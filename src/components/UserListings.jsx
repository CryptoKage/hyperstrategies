import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const UserListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchListings = async () => {
      try {
        const res = await api.get(`/listings/user/${user.user_id}`);
        setListings(res.data);
      } catch (err) {
        console.error('Failed to load user listings', err);
      }
    };
    fetchListings();
  }, [user]);

  const cancelListing = async (id) => {
    try {
      await api.post(`/listings/${id}/cancel`);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Failed to cancel listing', err);
    }
  };

  return (
    <div className="user-listings">
      <h3>My Listings</h3>
      <ul>
        {listings.map((l) => (
          <li key={l.id}>
            Tab {l.tab_id} – ${l.price} ({l.status})
            {l.status === 'active' && (
              <button onClick={() => cancelListing(l.id)}>Cancel</button>
            )}
          </li>
        ))}
        {listings.length === 0 && <li>No listings</li>}
      </ul>
    </div>
  );
};

export default UserListings;
