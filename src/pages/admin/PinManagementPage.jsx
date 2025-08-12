// FILE: /src/pages/admin/PinManagementPage.jsx
// This version is now structured IDENTICALLY to TreasuryPage.jsx, using your established patterns.

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';

const PinManagementPage = () => {
    // --- State Management: Mirrored from TreasuryPage ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPins, setUserPins] = useState([]);
    const [isLoadingUserPins, setIsLoadingUserPins] = useState(false);

    const [allPinDefs, setAllPinDefs] = useState([]);
    const [pinToAssign, setPinToAssign] = useState('');

    // --- Data Fetching: Fetching all possible pin definitions ---
    useEffect(() => {
        api.get('/pins/definitions').then(res => {
            setAllPinDefs(res.data);
            if (res.data.length > 0) {
                setPinToAssign(res.data[0].pin_name);
            }
        }).catch(err => {
            console.error("Failed to load pin definitions", err);
            setError("Could not load Pin definitions. Page may not function correctly.");
        }).finally(() => {
            setIsLoading(false); // Main page loading is done
        });
    }, []);

    // --- Debounced User Search Logic ---
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const handler = setTimeout(() => {
            api.get(`/admin/pins/search-users?query=${searchQuery}`)
                .then(res => setSearchResults(res.data))
                .finally(() => setIsSearching(false));
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // --- Event Handlers ---
    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        setSearchQuery('');
        setSearchResults([]);
        setIsLoadingUserPins(true);
        try {
            const res = await api.get(`/admin/pins/user/${user.id}`);
            setUserPins(res.data);
        } catch (err) {
            console.error("Error fetching user pins:", err);
        } finally {
            setIsLoadingUserPins(false);
        }
    };

    const handleAssignPin = async () => {
        if (!selectedUser || !pinToAssign) return;
        await api.post('/admin/pins/assign', { userId: selectedUser.id, pinName: pinToAssign });
        setUserPins(prev => [...new Set([...prev, pinToAssign])]); // Use a Set to prevent duplicates
    };

    const handleRevokePin = async (pinNameToRevoke) => {
        if (!selectedUser) return;
        await api.post('/admin/pins/revoke', { userId: selectedUser.id, pinName: pinNameToRevoke });
        setUserPins(prev => prev.filter(p => p !== pinNameToRevoke));
    };

    // --- Helper Render Function: Mirrored from TreasuryPage's renderContent ---
    const renderContent = () => {
        if (isLoading) return <p>Loading Pin Definitions...</p>;
        if (error) return <p className="error-message">{error}</p>;

        return (
            <>
                <div className="admin-actions-card" style={{ marginBottom: '24px' }}>
                    <h3>Find User to Manage</h3>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {isSearching && <p>Searching...</p>}
                    {searchResults.length > 0 && (
                        <ul className="search-results-list">
                            {searchResults.map(user => (
                                <li key={user.id} onClick={() => handleSelectUser(user)}>
                                    {user.username} ({user.email})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {selectedUser && (
                    <div className="admin-actions-card">
                        <h3>Managing Pins for: {selectedUser.username}</h3>
                        {isLoadingUserPins ? <p>Loading user pins...</p> : (
                            <>
                                <div className="current-pins">
                                    <h4>Current Pins:</h4>
                                    {userPins.length > 0 ? (
                                        userPins.map(pin => (
                                            <div key={pin} className="user-pin-item">
                                                <span>{pin}</span>
                                                <button onClick={() => handleRevokePin(pin)} className="btn-danger-small">Revoke</button>
                                            </div>
                                        ))
                                    ) : <p>This user has no pins.</p>}
                                </div>
                                <hr style={{margin: '20px 0'}}/>
                                <div className="assign-pin">
                                    <h4>Assign New Pin:</h4>
                                    <div className="form-group">
                                        <select value={pinToAssign} onChange={(e) => setPinToAssign(e.target.value)} disabled={allPinDefs.length === 0}>
                                            {allPinDefs.map(def => (
                                                <option key={def.pin_name} value={def.pin_name}>{def.pin_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button onClick={handleAssignPin} className="btn-primary" disabled={!pinToAssign}>Assign Pin</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </>
        );
    };

    // --- Main Return: Mirrored from TreasuryPage ---
    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Pin Management</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>
                <div className="admin-card">
                    {renderContent()}
                </div>
            </div>
        </Layout>
    );
};

export default PinManagementPage;
