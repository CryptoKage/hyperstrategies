// src/components/BottomNavBar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Using Feather icons from react-icons - they are clean and modern
import { FiGrid, FiDollarSign, FiAward, FiUser } from 'react-icons/fi';

const BottomNavBar = () => {
    const { t } = useTranslation();

    const navItems = [
        { to: '/dashboard', icon: <FiGrid size={24} />, label: t('header.dashboard') },
        { to: '/wallet',    icon: <FiDollarSign size={24} />, label: t('header.wallet') },
        { to: '/rewards',   icon: <FiAward size={24} />, label: t('header.rewards') },
        { to: '/profile',   icon: <FiUser size={24} />, label: t('header.profile') },
    ];

    return (
        <nav className="bottom-nav-bar">
            {navItems.map((item) => (
                <NavLink 
                    key={item.to} 
                    to={item.to} 
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <div className="nav-icon">{item.icon}</div>
                    <span className="nav-label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNavBar;
