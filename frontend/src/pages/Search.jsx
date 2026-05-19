import React, { useState, useContext } from 'react';
import { plateService } from '../services/api';
import { ThemeContext } from '../App';
import LTOLogo from '../assets/lto-7-logo.png';
import LTOLogo1 from '../assets/lto-7-logo-1.png';

const IconCheck = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
    </svg>
);
const IconBuilding = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M9 22v-9h6v9" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01" />
    </svg>
);
const IconStore = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);
const IconClock = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const IconSearch = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconDocument = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" />
    </svg>
);
const IconHash = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
);
const IconPin = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const IconList = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><line x1="4" y1="6" x2="4.01" y2="6" /><line x1="4" y1="12" x2="4.01" y2="12" /><line x1="4" y1="18" x2="4.01" y2="18" />
    </svg>
);
const IconEdit = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const IconGear = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);
const IconBadgeCheck = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
);
const IconMoon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);
const IconSun = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const STATUS_CONFIG = {
    'Available': {
        color: '#10b981', bg: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)', icon: <IconCheck size={32} />,
        message: 'Your plate is ready for pickup!',
    },
    'At LTO': {
        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.25)', icon: <IconBuilding size={32} />,
        message: 'Your plate is available at the LTO office.',
    },
    'At Dealer': {
        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.25)', icon: <IconStore size={32} />,
        message: 'Your plate is available at the dealer.',
    },
    'In Process': {
        color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',
        border: 'rgba(139,92,246,0.25)', icon: <IconClock size={32} />,
        message: 'Your plate is still being processed.',
    },
};

export default function Search() {
    const { theme, setDark } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState('mv');
    const [mv, setMv] = useState('');
    const [plate, setPlate] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const query = activeTab === 'mv' ? mv.trim() : plate.trim();
        if (!query) return;
        setLoading(true);
        setResult(null);
        setError('');
        setSearched(false);
        try {
            const res = activeTab === 'mv'
                ? await plateService.searchByMV(query)
                : await plateService.searchByPlate(query);
            setResult(res.data.data);
            setSearched(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            setSearched(true);
        } finally {
            setLoading(false);
        }
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setResult(null);
        setError('');
        setSearched(false);
        setMv('');
        setPlate('');
    };

    const statusCfg = result ? STATUS_CONFIG[result.status] : null;

    const mvSteps = [
        { icon: <IconDocument size={22} />, label: 'Get your MV File Number from your OR/CR' },
        { icon: <IconSearch size={22} />, label: 'Enter it in the search box above' },
        { icon: <IconPin size={22} />, label: 'See your plate status and where to claim it' },
    ];

    const plateSteps = [
        { icon: <IconHash size={22} />, label: 'Have your current plate number ready' },
        { icon: <IconSearch size={22} />, label: 'Enter it in the search box above' },
        { icon: <IconPin size={22} />, label: 'Check your replacement plate status' },
    ];

    const steps = activeTab === 'mv' ? mvSteps : plateSteps;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Animated gradient background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                background: theme.dark
                    ? 'linear-gradient(135deg, #0a0f1e, #0d1f3c, #0a0f1e, #071428)'
                    : 'linear-gradient(135deg, #e0f7ff, #f0f9ff, #e8f4fd, #f0faff, #e0f7ff)',
                backgroundSize: '400% 400%',
                animation: 'gradientMove 12s ease infinite',
            }} />

            {/* Bokeh - Light mode */}
            {!theme.dark && <>
                <div style={{ position: 'fixed', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(56,189,248,0.25)', filter: 'blur(70px)', top: '-100px', left: '-100px', zIndex: 0, animation: 'bokeh1 8s ease-in-out infinite' }} />
                <div style={{ position: 'fixed', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(147,197,253,0.3)', filter: 'blur(60px)', top: '25%', right: '-80px', zIndex: 0, animation: 'bokeh2 10s ease-in-out infinite' }} />
                <div style={{ position: 'fixed', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(56,189,248,0.2)', filter: 'blur(55px)', bottom: '15%', left: '15%', zIndex: 0, animation: 'bokeh3 9s ease-in-out infinite' }} />
                <div style={{ position: 'fixed', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(191,219,254,0.35)', filter: 'blur(50px)', bottom: '-60px', right: '20%', zIndex: 0, animation: 'bokeh1 11s ease-in-out infinite reverse' }} />
                <div style={{ position: 'fixed', width: '230px', height: '230px', borderRadius: '50%', background: 'rgba(125,211,252,0.25)', filter: 'blur(60px)', top: '50%', left: '-60px', zIndex: 0, animation: 'bokeh2 7s ease-in-out infinite reverse' }} />
            </>}

            {/* Bokeh - Dark mode */}
            {theme.dark && <>
                <div style={{ position: 'fixed', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(29,78,216,0.18)', filter: 'blur(80px)', top: '-100px', left: '-100px', zIndex: 0, animation: 'bokeh1 8s ease-in-out infinite' }} />
                <div style={{ position: 'fixed', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(6,182,212,0.12)', filter: 'blur(70px)', top: '25%', right: '-80px', zIndex: 0, animation: 'bokeh2 10s ease-in-out infinite' }} />
                <div style={{ position: 'fixed', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(59,130,246,0.12)', filter: 'blur(60px)', bottom: '15%', left: '15%', zIndex: 0, animation: 'bokeh3 9s ease-in-out infinite' }} />
                <div style={{ position: 'fixed', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', filter: 'blur(55px)', bottom: '-60px', right: '20%', zIndex: 0, animation: 'bokeh1 11s ease-in-out infinite reverse' }} />
            </>}

            {/* Top bar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 32px',
                borderBottom: `1px solid ${theme.border}`,
                background: theme.dark ? 'rgba(15,23,41,0.8)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(8px)',
                position: 'relative',
                zIndex: 10,
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={LTOLogo} alt="LTO Logo"
                             style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <div style={{
                            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                            fontSize: '1.1rem', color: theme.dark ? '#22d3ee' : '#1d4ed8',
                            letterSpacing: '0.08em', lineHeight: 1,
                        }}>LTO-VII</div>
                        <div style={{ fontSize: '0.55rem', color: theme.textMuted, letterSpacing: '0.1em' }}>
                            PLATE SPOTTER
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: theme.textMuted, display: 'flex', alignItems: 'center' }}>
                            {theme.dark ? <IconMoon size={14} /> : <IconSun size={14} />}
                        </span>
                        <div onClick={() => setDark(d => !d)} style={{
                            width: '38px', height: '22px',
                            background: theme.dark ? '#3b82f6' : '#cbd5e1',
                            borderRadius: '999px', cursor: 'pointer',
                            position: 'relative',
                        }}>
                            <div style={{
                                position: 'absolute', top: '3px',
                                left: theme.dark ? '19px' : '3px',
                                width: '16px', height: '16px',
                                background: '#ffffff', borderRadius: '50%',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '40px 20px',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Heading */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    {/* Hero logo replaces heading */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <img src={LTOLogo1} alt="LTO Logo"
                             style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                    </div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: theme.dark ? 'rgba(59,130,246,0.1)' : 'rgba(29,78,216,0.08)',
                        border: `1px solid ${theme.dark ? 'rgba(59,130,246,0.2)' : 'rgba(29,78,216,0.15)'}`,
                        borderRadius: '999px', padding: '6px 16px',
                        fontSize: '0.78rem', color: theme.dark ? '#60a5fa' : '#1d4ed8',
                        fontWeight: 600, letterSpacing: '0.05em',
                        marginBottom: '20px',
                    }}>
                        <IconSearch size={12} />
                        VEHICLE PLATE STATUS CHECKER
                    </div>
                    <p style={{
                        color: theme.textMuted, fontSize: '1rem',
                        maxWidth: '480px', margin: '0 auto', lineHeight: 1.6,
                    }}>
                        Search using your <strong style={{ color: theme.textPrimary }}>MV File Number</strong> or
                        your existing <strong style={{ color: theme.textPrimary }}>Plate Number</strong> to check
                        your plate status and where to claim it.
                    </p>
                </div>

                {/* Search box */}
                <div style={{
                    width: '100%', maxWidth: '520px',
                    background: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '16px',
                    boxShadow: theme.dark
                        ? '0 20px 60px rgba(0,0,0,0.4)'
                        : '0 20px 60px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}` }}>
                        {[
                            { key: 'mv', label: 'MV File Number', icon: <IconDocument size={14} /> },
                            { key: 'plate', label: 'Plate Number', icon: <IconHash size={14} /> },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => handleTabSwitch(tab.key)} style={{
                                flex: 1, padding: '14px 16px',
                                border: 'none', cursor: 'pointer',
                                background: activeTab === tab.key
                                    ? theme.bgCard
                                    : theme.dark ? 'rgba(15,23,41,0.5)' : '#f8fafc',
                                borderBottom: activeTab === tab.key
                                    ? '2px solid #2563eb'
                                    : '2px solid transparent',
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    fontSize: '0.82rem', fontWeight: 700,
                                    color: activeTab === tab.key ? '#2563eb' : theme.textMuted,
                                    marginBottom: '2px',
                                }}>
                                    {tab.icon}
                                    {tab.label}
                                </div>
                                <div style={{
                                    fontSize: '0.68rem',
                                    color: activeTab === tab.key
                                        ? (theme.dark ? '#60a5fa' : '#3b82f6')
                                        : theme.textMuted,
                                }}>
                                    {tab.desc}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <div style={{ padding: '28px' }}>
                        <form onSubmit={handleSearch}>
                            <label style={{
                                display: 'block', fontSize: '0.78rem', fontWeight: 700,
                                color: theme.textMuted, letterSpacing: '0.08em',
                                textTransform: 'uppercase', marginBottom: '10px',
                            }}>
                                {activeTab === 'mv' ? 'MV File Number' : 'Plate Number'}
                            </label>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                {activeTab === 'mv' ? (
                                    <input key="mv-input" value={mv}
                                           onChange={(e) => setMv(e.target.value.toUpperCase())}
                                           placeholder="e.g. 2312-00012345"
                                           style={{
                                               width: '100%', background: theme.bgInput,
                                               border: `1px solid ${theme.borderInput}`,
                                               borderRadius: '10px', color: theme.textPrimary,
                                               fontSize: '1rem', padding: '12px 16px',
                                               fontFamily: 'JetBrains Mono, monospace',
                                               fontWeight: 600, letterSpacing: '0.05em',
                                           }}
                                    />
                                ) : (
                                    <input key="plate-input" value={plate}
                                           onChange={(e) => setPlate(e.target.value.toUpperCase())}
                                           placeholder="e.g. ABC 1234"
                                           style={{
                                               width: '100%', background: theme.bgInput,
                                               border: `1px solid ${theme.borderInput}`,
                                               borderRadius: '10px', color: theme.textPrimary,
                                               fontSize: '1rem', padding: '12px 16px',
                                               fontFamily: 'JetBrains Mono, monospace',
                                               fontWeight: 600, letterSpacing: '0.05em',
                                           }}
                                    />
                                )}
                                <button type="submit" disabled={loading} style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                    border: 'none', borderRadius: '10px', color: 'white',
                                    padding: '13px 20px', cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: 700, fontSize: '0.95rem',
                                    opacity: loading ? 0.7 : 1,
                                }}>
                                    {loading ? 'Searching...' : (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <IconSearch size={16} />
                                            Search
                                        </span>
                                    )}
                                </button>
                            </div>

                            <p style={{
                                color: theme.textMuted,
                                fontSize: '0.75rem',
                                marginTop: '10px',
                                marginBottom: 0
                            }}>
                                {activeTab === 'mv'
                                    ? 'Your MV File Number can be found on your Official Receipt (OR) or Certificate of Registration (CR).'
                                    : 'Enter your plate number to check its current status.'}
                            </p>
                        </form>
                    </div>
                </div>

                {/* Result */}
                {searched && (
                    <div className="fade-in" style={{width: '100%', maxWidth: '520px', marginTop: '20px'}}>
                        {error ? (
                            <div style={{
                                background: theme.dark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.04)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: '14px', overflow: 'hidden',
                            }}>
                                {/* Header */}
                                <div style={{
                                    background: theme.dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
                                    padding: '20px 24px',
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    borderBottom: '1px solid rgba(239,68,68,0.15)',
                                }}>
                                    <span style={{ color: '#ef4444', flexShrink: 0 }}>
                                        <IconSearch size={32} />
                                    </span>
                                    <div>
                                        <div style={{
                                            color: '#ef4444',
                                            fontWeight: 700,
                                            fontSize: '1.05rem',
                                            marginBottom: '2px'
                                        }}>
                                            No Record Found
                                        </div>
                                        <div style={{color: theme.textMuted, fontSize: '0.8rem'}}>
                                            {activeTab === 'mv'
                                                ? 'No plate record matched your MV File Number'
                                                : 'No plate record matched your Plate Number'}
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '20px 24px' }}>
                                    {activeTab === 'mv' ? (
                                        <>
                                            <p style={{ color: theme.textPrimary, fontSize: '0.875rem', fontWeight: 600, marginBottom: '10px' }}>
                                                What this could mean:
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                                                {[
                                                    { icon: <IconList size={16} />, text: 'Your MV File Number may not yet have an assigned plate in the system.' },
                                                    { icon: <IconEdit size={16} />, text: 'You may have entered your MV File Number incorrectly. Please double-check your OR/CR.' },
                                                ].map((item, i) => (
                                                    <div key={i} style={{
                                                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                                                        background: theme.dark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                        border: `1px solid ${theme.border}`,
                                                        borderRadius: '8px', padding: '10px 12px',
                                                    }}>
                                                        <span style={{ flexShrink: 0, color: theme.textMuted, marginTop: '1px' }}>{item.icon}</span>
                                                        <span style={{ fontSize: '0.8rem', color: theme.textMuted, lineHeight: 1.5 }}>{item.text}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Suggestion box */}
                                            <div style={{
                                                background: theme.dark ? 'rgba(59,130,246,0.08)' : 'rgba(29,78,216,0.06)',
                                                border: `1px solid ${theme.dark ? 'rgba(59,130,246,0.2)' : 'rgba(29,78,216,0.15)'}`,
                                                borderRadius: '10px', padding: '14px 16px',
                                                display: 'flex', gap: '12px', alignItems: 'flex-start',
                                            }}>
                                                <span style={{ color: theme.dark ? '#60a5fa' : '#1d4ed8', flexShrink: 0, marginTop: '2px' }}>
                                                    <IconBuilding size={20} />
                                                </span>
                                                <div>
                                                    <div style={{ color: theme.dark ? '#60a5fa' : '#1d4ed8', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                                                        What you can do
                                                    </div>
                                                    <div style={{ color: theme.textMuted, fontSize: '0.78rem', lineHeight: 1.6 }}>
                                                        Visit the <strong style={{ color: theme.textPrimary }}>nearest LTO office</strong> and
                                                        present your <strong style={{ color: theme.textPrimary }}>Official Receipt (OR) and Certificate of Registration (CR)</strong> to
                                                        inquire if your plate is already available for claiming.
                                                        You may also ask if you are eligible to claim a new plate number.
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p style={{ color: theme.textPrimary, fontSize: '0.875rem', fontWeight: 600, marginBottom: '10px' }}>
                                                What this could mean:
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                                                {[
                                                    { icon: <IconEdit size={16} />, text: 'You may have entered your plate number incorrectly, please check your Certificate of Registration or Official Receipt for the correct format or visit the nearest LTO Office in your area.' },
                                                ].map((item, i) => (
                                                    <div key={i} style={{
                                                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                                                        background: theme.dark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                        border: `1px solid ${theme.border}`,
                                                        borderRadius: '8px', padding: '10px 12px',
                                                    }}>
                                                        <span style={{ flexShrink: 0, color: theme.textMuted, marginTop: '1px' }}>{item.icon}</span>
                                                        <span style={{ fontSize: '0.8rem', color: theme.textMuted, lineHeight: 1.5 }}>{item.text}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Suggestion box */}
                                            <div style={{
                                                background: theme.dark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
                                                border: `1px solid ${theme.dark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                                borderRadius: '10px', padding: '14px 16px',
                                                display: 'flex', gap: '12px', alignItems: 'flex-start',
                                            }}>
                                                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>
                                                    <IconBuilding size={20} />
                                                </span>
                                                <div>
                                                    <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                                                        What you can do
                                                    </div>
                                                    <div style={{ color: theme.textMuted, fontSize: '0.78rem', lineHeight: 1.6 }}>
                                                        Visit the <strong style={{ color: theme.textPrimary }}>nearest LTO office</strong> and
                                                        present your <strong style={{ color: theme.textPrimary }}>Official Receipt (OR) and Certificate of Registration (CR)</strong> to
                                                        inquire about your plate status.
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : result && statusCfg && (
                            <div style={{
                                background: theme.bgCard,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '16px', overflow: 'hidden',
                                boxShadow: theme.dark ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.06)',
                            }}>
                                {/* Claimed banner */}
                                {result.is_claimed ? (
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))',
                                        borderBottom: '1px solid rgba(16,185,129,0.3)',
                                        padding: '18px 24px',
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                    }}>
                                        <span style={{ color: '#10b981', flexShrink: 0 }}>
                                            <IconBadgeCheck size={32} />
                                        </span>
                                        <div>
                                            <div style={{
                                                color: '#10b981', fontWeight: 800,
                                                fontSize: '1rem', letterSpacing: '0.06em',
                                                marginBottom: '2px',
                                            }}>
                                                CLAIMED
                                            </div>
                                            <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
                                                This plate is already in your custody.
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Status banner */
                                    <div style={{
                                        background: statusCfg.bg,
                                        border: `1px solid ${statusCfg.border}`,
                                        padding: '20px 24px',
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                    }}>
                                        <span style={{ color: statusCfg.color, flexShrink: 0 }}>{statusCfg.icon}</span>
                                        <div>
                                            <div style={{ color: statusCfg.color, fontWeight: 700, fontSize: '1.1rem', marginBottom: '2px' }}>
                                                {result.status}
                                            </div>
                                            <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
                                                {result.status === 'At LTO' && result.site_name
                                                    ? `Your plate is available at ${result.site_name}.`
                                                    : statusCfg.message}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Plate number + Claim location */}
                                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

                                    {/* Plate number — styled like a real plate */}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                                            Plate Number
                                        </div>
                                        {result.plate_number ? (
                                            <div style={{
                                                display: 'inline-block',
                                                background: '#ffffff',
                                                border: '3px solid #1a1a1a',
                                                borderRadius: '8px',
                                                padding: '10px 32px',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.8)',
                                                fontFamily: 'JetBrains Mono, monospace',
                                                fontWeight: 800,
                                                fontSize: '2rem',
                                                color: '#111111',
                                                letterSpacing: '0.18em',
                                                lineHeight: 1,
                                            }}>
                                                {result.plate_number}
                                            </div>
                                        ) : (
                                            <div style={{ color: theme.textMuted, fontStyle: 'italic', fontSize: '0.9rem' }}>
                                                Not yet assigned
                                            </div>
                                        )}
                                    </div>

                                    {/* Claim location */}
                                    {!result.is_claimed && result.claim_location && (
                                        <div style={{
                                            width: '100%',
                                            background: theme.dark ? 'rgba(59,130,246,0.08)' : 'rgba(29,78,216,0.06)',
                                            border: `1px solid ${theme.dark ? 'rgba(59,130,246,0.2)' : 'rgba(29,78,216,0.15)'}`,
                                            borderRadius: '10px', padding: '14px 16px',
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                        }}>
                                            <span style={{ color: theme.dark ? '#60a5fa' : '#1d4ed8', flexShrink: 0 }}>
                                                <IconPin size={20} />
                                            </span>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                                                    Claim Location
                                                </div>
                                                <div style={{ color: theme.textPrimary, fontWeight: 600 }}>
                                                    {[result.site_name, result.claim_location].filter(Boolean).join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* How it works */}
                {!searched && (
                    <div className="fade-in" style={{
                        display: 'flex', gap: '16px', marginTop: '40px',
                        flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px',
                    }}>
                        {steps.map((step, i) => (
                            <div key={i} style={{
                                background: theme.bgCard, border: `1px solid ${theme.border}`,
                                borderRadius: '12px', padding: '16px 20px',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                flex: '1 1 160px', minWidth: '160px',
                                boxShadow: theme.dark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                            }}>
                                <span style={{ color: theme.textMuted, flexShrink: 0 }}>{step.icon}</span>
                                <span style={{ fontSize: '0.8rem', color: theme.textMuted, lineHeight: 1.4 }}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                borderTop: `1px solid ${theme.border}`,
                padding: '20px 32px',
                background: theme.dark ? 'rgba(15,23,41,0.8)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '16px',
                position: 'relative', zIndex: 10,
            }}>
                {/* Logos row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <img src="https://toppng.com/uploads/preview/republic-of-the-philippines-logo-11550723060fhrvzcnrfc.png"
                             alt="Republic of the Philippines"
                             style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '0.6rem', color: theme.textMuted, textAlign: 'center', maxWidth: '80px', lineHeight: 1.3 }}>
                            Republic of the Philippines
                        </span>
                    </div>

                    <div style={{ width: '1px', height: '60px', background: theme.border }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/Department_of_Transportation_%28Philippines%29.svg"
                             alt="Department of Transportation"
                             style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '0.6rem', color: theme.textMuted, textAlign: 'center', maxWidth: '80px', lineHeight: 1.3 }}>
                            Department of Transportation
                        </span>
                    </div>

                    <div style={{ width: '1px', height: '60px', background: theme.border }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Land_Transportation_Office.svg"
                             alt="Land Transportation Office"
                             style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '0.6rem', color: theme.textMuted, textAlign: 'center', maxWidth: '80px', lineHeight: 1.3 }}>
                            Land Transportation Office
                        </span>
                    </div>

                    <div style={{ width: '1px', height: '60px', background: theme.border }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <img src={LTOLogo}
                             alt="LTO Central Visayas"
                             style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '0.6rem', color: theme.textMuted, textAlign: 'center', maxWidth: '80px', lineHeight: 1.3 }}>
                            LTO Central Visayas
                        </span>
                    </div>

                </div>

                {/* Copyright */}
                <div style={{ color: theme.textMuted, fontSize: '0.72rem', textAlign: 'center' }}>
                    &copy; {new Date().getFullYear()} LTO-VII Plate Spotter System. All rights reserved.
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes gradientMove {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes bokeh1 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }
                @keyframes bokeh2 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(-25px, 25px) scale(1.05); }
                    66% { transform: translate(20px, -15px) scale(0.9); }
                }
                @keyframes bokeh3 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(20px, 20px) scale(1.08); }
                    66% { transform: translate(-30px, -10px) scale(0.95); }
                }
            `}</style>

        </div>
    );
}
