import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';

const PinManagementPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPins, setUserPins] = useState([]); // Will now be an array of objects
    const [isLoadingUserPins, setIsLoadingUserPins] = useState(false);
    const [allPinDefs, setAllPinDefs] = useState([]);
    const [pinToMint, setPinToMint] = useState('');

    useEffect(() => {
        api.get('/pins/definitions').then(res => {
            setAllPinDefs(res.data);
            if (res.data.length > 0) setPinToMint(res.data[0].pin_name);
        }).catch(err => {
            setError("Could not load Pin definitions.");
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        if (searchQuery.length < 2) { setSearchResults([]); return; }
        setIsSearching(true);
        const handler = setTimeout(() => {
            api.get(`/admin/pins/search-users?query=${searchQuery}`)
                .then(res => setSearchResults(res.data))
                .finally(() => setIsSearching(false));
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        setSearchQuery('');
        setSearchResults([]);
        setIsLoadingUserPins(true);
        try {
            const res = await api.get(`/admin/pins/user/${user.id}`);
            setUserPins(res.data); // The response is now an array of objects
        } catch (err) {
            console.error("Error fetching user pins:", err);
        } finally {
            setIsLoadingUserPins(false);
        }
    };

    const handleMintPin = async () => {
        if (!selectedUser || !pinToMint) return;
        try {
            const res = await api.post('/admin/pins/mint', { userId: selectedUser.id, pinName: pinToMint });
            // Add the newly minted pin to the top of our local list for immediate UI feedback
            setUserPins(prevPins => [res.data.newPin, ...prevPins]);
        } catch (err) {
            alert('Failed to mint pin.');
        }
    };

    const handleRevokePin = async (pinIdToRevoke) => {
        if (!selectedUser) return;
        try {
            await api.post('/admin/pins/revoke', { pinId: pinIdToRevoke });
            // Remove the revoked pin from our local list for immediate UI feedback
            setUserPins(prevPins => prevPins.filter(p => p.pin_id !== pinIdToRevoke));
        } catch (err) {
            alert('Failed to revoke pin.');
        }
    };

    const renderContent = () => {
        if (isLoading) return <p>Loading Pin Definitions...</p>;
        if (error) return <p className="error-message">{error}</p>;
        return (
            <>
                <div className="admin-actions-card" style={{ marginBottom: '24px' }}>
                    <h3>Find User to Manage</h3>
                    <input type="text" placeholder="Search by username or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                        <div className="assign-pin" style={{ marginBottom: '20px' }}>
                            <h4>Mint New Pin:</h4>
                            <select value={pinToMint} onChange={(e) => setPinToMint(e.target.value)} disabled={allPinDefs.length === 0}>
                                {allPinDefs.map(def => (<option key={def.pin_name} value={def.pin_name}>{def.pin_name}</option>))}
                            </select>
                            <button onClick={handleMintPin} className="btn-primary">Mint Pin</button>
                        </div><hr/>
                        {isLoadingUserPins ? <p>Loading user pins...</p> : (
                            <div className="current-pins">
                                <h4>Owned Pins ({userPins.length}):</h4>
                                {userPins.length > 0 ? (
                                    userPins.map(pin => (
                                        <div key={pin.pin_id} className="user-pin-item">
                                            <span>{pin.pin_name} (ID: {pin.pin_id})</span>
                                            <button onClick={() => handleRevokePin(pin.pin_id)} className="btn-danger-small">Revoke</button>
                                        </div>
                                    ))
                                ) : <p>This user has no pins.</p>}
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    };

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Pin Management</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>
                <div className="admin-card">{renderContent()}</div>
            </div>
        </Layout>
    );
};

export default PinManagementPage;
