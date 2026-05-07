import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';

const IconDashboard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
);
const IconPlates = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <path d="M6 11h.01M18 11h.01M9 11h6" />
    </svg>
);
const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const IconLogout = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const IconChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IconChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const ROLE_LABELS = {
    administrator: 'Administrator',
    lto: 'LTO User',
    dealer: 'Dealer',
};

const ROLE_COLORS = {
    administrator: '#f59e0b',
    lto: '#3b82f6',
    dealer: '#10b981',
};

export default function Sidebar({ dark, setDark }) {
    const { theme, collapsed, setCollapsed } = useContext(ThemeContext);
    const navigate = useNavigate();
    const role = localStorage.getItem('platex_role') || 'administrator';
    const username = localStorage.getItem('platex_user') || '';

    const handleLogout = () => {
        localStorage.removeItem('platex_token');
        localStorage.removeItem('platex_user');
        localStorage.removeItem('platex_role');
        localStorage.removeItem('platex_site_code');
        localStorage.removeItem('platex_dealer_name');
        navigate('/admin/login');
    };

    const navItems = [
        { to: '/admin', label: 'Dashboard', icon: <IconDashboard />, end: true },
        { to: '/admin/plates', label: 'Plate Records', icon: <IconPlates /> },
        ...(role === 'administrator' ? [{ to: '/admin/users', label: 'User Management', icon: <IconUsers /> }] : []),
    ];

    const w = collapsed ? '64px' : '240px';

    const iconBtn = {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px', borderRadius: '8px',
        background: 'rgba(255,255,255,0.1)', border: 'none',
        color: 'rgba(255,255,255,0.8)', cursor: 'pointer', flexShrink: 0,
    };

    return (
        <nav style={{
            background: theme.bgSidebar,
            borderRight: `1px solid ${theme.border}`,
            width: w,
            minHeight: '100vh',
            position: 'fixed',
            top: 0, left: 0,
            zIndex: 100,
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Logo row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                marginBottom: '20px',
                gap: '12px',
                padding: '0 2px',
            }}>
                {/* Logo icon always visible */}
                <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="10" rx="2" />
                        <path d="M6 11h.01M18 11h.01M9 11h6" />
                    </svg>
                </div>

                {/* Brand text — hidden when collapsed */}
                {!collapsed && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                            fontSize: '1.05rem', color: '#ffffff', letterSpacing: '0.04em',
                            whiteSpace: 'nowrap',
                        }}>LTO-VII <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>|</span> Plate Spotter</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>ADMIN PANEL</div>
                    </div>
                )}
            </div>

            {/* User badge — hidden when collapsed */}
            {!collapsed && (
                <div style={{
                    padding: '10px 12px', marginBottom: '16px',
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${ROLE_COLORS[role] || '#3b82f6'}`,
                }}>
                    <div style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</div>
                    <div style={{
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                        color: ROLE_COLORS[role] || '#3b82f6', textTransform: 'uppercase',
                    }}>{ROLE_LABELS[role] || role}</div>
                </div>
            )}

            {/* Collapsed role dot */}
            {collapsed && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: ROLE_COLORS[role] || '#3b82f6',
                    }} />
                </div>
            )}

            {/* Nav label */}
            {!collapsed && (
                <div style={{
                    fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '0 4px', marginBottom: '8px',
                }}>Navigation</div>
            )}

            {/* Nav items */}
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: collapsed ? 0 : '12px',
                        padding: collapsed ? '10px 0' : '10px 14px',
                        borderRadius: '8px',
                        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                        background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                        borderLeft: collapsed ? 'none' : (isActive ? '3px solid #ffffff' : '3px solid transparent'),
                        outline: collapsed && isActive ? '2px solid rgba(255,255,255,0.4)' : 'none',
                        fontSize: '0.875rem', fontWeight: 500,
                        textDecoration: 'none', margin: '2px 0',
                    })}
                >
                    {item.icon}
                    {!collapsed && item.label}
                </NavLink>
            ))}

            <div style={{ marginTop: 'auto' }} />

            {/* Sidebar collapse toggle */}
            <button
                onClick={() => setCollapsed(c => !c)}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: collapsed ? 0 : '10px',
                    padding: collapsed ? '10px 0' : '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.8rem', fontWeight: 500,
                    cursor: 'pointer', width: '100%',
                    marginBottom: '8px',
                }}
            >
                {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
                {!collapsed && 'Collapse'}
            </button>

            {/* Dark mode toggle */}
            <div style={{
                padding: collapsed ? '10px 0' : '12px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '10px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
            }}>
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{dark ? '◑' : '○'}</span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                            {dark ? 'Dark Mode' : 'Light Mode'}
                        </span>
                    </div>
                )}
                <div
                    onClick={() => setDark(d => !d)}
                    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                    style={{
                        width: '42px', height: '24px',
                        background: dark ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                        borderRadius: '999px', cursor: 'pointer',
                        position: 'relative', flexShrink: 0,
                    }}
                >
                    <div style={{
                        position: 'absolute', top: '3px',
                        left: dark ? '21px' : '3px',
                        width: '18px', height: '18px',
                        background: '#ffffff', borderRadius: '50%',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                title={collapsed ? 'Logout' : undefined}
                style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: collapsed ? 0 : '10px',
                    padding: collapsed ? '10px 0' : '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#fca5a5', fontSize: '0.875rem',
                    fontWeight: 500, cursor: 'pointer',
                    width: '100%',
                }}>
                <IconLogout />
                {!collapsed && 'Logout'}
            </button>
        </nav>
    );
}
