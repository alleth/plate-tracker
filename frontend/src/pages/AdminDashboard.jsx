import React, { useState, useEffect, useContext } from 'react';
import { adminService } from '../services/api';
import { ThemeContext } from '../App';

const IconList = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><line x1="4" y1="6" x2="4.01" y2="6" /><line x1="4" y1="12" x2="4.01" y2="12" /><line x1="4" y1="18" x2="4.01" y2="18" />
    </svg>
);
const IconBadgeCheck = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
);
const IconClock = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const IconStore = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);
const IconBuilding = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M9 22v-9h6v9" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01" />
    </svg>
);
const IconChevronLeft = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IconChevronRight = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const PAGE_SIZE = 5;

const STATUS_COLORS = {
    'Available': { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
    'At LTO': { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
    'At Dealer': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    'In Process': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
};

export default function AdminDashboard() {
    const { theme } = useContext(ThemeContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentLoading, setRecentLoading] = useState(false);
    const [recentPage, setRecentPage] = useState(1);
    const [recentTotalPages, setRecentTotalPages] = useState(1);
    const user = localStorage.getItem('platex_user');
    const role = localStorage.getItem('platex_role') || 'administrator';
    const mySiteCode = localStorage.getItem('platex_site_code') || '';
    const myDealerName = localStorage.getItem('platex_dealer_name') || '';

    // Full load on mount
    useEffect(() => {
        fetchStats(1, true);
    }, []);

    // Page-only reload (no full spinner)
    useEffect(() => {
        if (recentPage !== 1 || stats !== null) {
            fetchStats(recentPage, false);
        }
    }, [recentPage]);

    const fetchStats = async (page = 1, fullLoad = false) => {
        if (fullLoad) setLoading(true);
        else setRecentLoading(true);
        try {
            const res = await adminService.getStats(page, PAGE_SIZE);
            setStats(res.data.data);
            setRecentTotalPages(res.data.data.recentTotalPages ?? 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRecentLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Records', value: stats?.total ?? 0, icon: <IconList size={22} />, color: '#3b82f6' },
        { label: 'Claimed', value: stats?.claimed ?? 0, icon: <IconBadgeCheck size={22} />, color: '#10b981' },
        { label: 'In Process', value: stats?.in_process ?? 0, icon: <IconClock size={22} />, color: '#8b5cf6' },
        { label: 'At Dealer', value: stats?.at_dealer ?? 0, icon: <IconStore size={22} />, color: '#f59e0b' },
        { label: 'At LTO', value: stats?.at_lto ?? 0, icon: <IconBuilding size={22} />, color: '#06b6d4' },
    ];

    const total = stats?.total ?? 0;
    const firstItem = total === 0 ? 0 : (recentPage - 1) * PAGE_SIZE + 1;
    const lastItem = Math.min(recentPage * PAGE_SIZE, total);

    return (
        <div>
            {/* Header */}
            <div style={{
                background: theme.bgHeader,
                borderBottom: `1px solid ${theme.border}`,
                padding: '24px 28px',
            }}>
                <h1 style={{
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                    fontSize: '1.6rem', margin: 0, color: theme.textPrimary,
                }}>Dashboard</h1>
                <p style={{ color: theme.textMuted, margin: '4px 0 0', fontSize: '0.875rem' }}>
                    Welcome back, <strong style={{ color: theme.textPrimary }}>{user}</strong>
                    {role === 'lto' && mySiteCode && (
                        <> — showing records for site code <strong style={{ color: theme.textPrimary }}>{mySiteCode}</strong></>
                    )}
                    {role === 'dealer' && (
                        <> — showing records assigned to <strong style={{ color: theme.textPrimary }}>{myDealerName || user}</strong></>
                    )}
                    {role === 'administrator' && <> — here's your plate spotter overview.</>}
                </p>
            </div>

            <div style={{ padding: '28px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            border: '3px solid rgba(59,130,246,0.15)',
                            borderTopColor: '#3b82f6', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                    </div>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: '16px', marginBottom: '32px',
                        }}>
                            {statCards.map((card) => (
                                <div key={card.label} style={{
                                    background: theme.bgCard,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: '12px', padding: '20px',
                                    position: 'relative', overflow: 'hidden',
                                    boxShadow: theme.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                                }}>
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                        background: `linear-gradient(90deg, ${card.color}, transparent)`,
                                    }} />
                                    <div style={{ marginBottom: '8px', color: card.color }}>{card.icon}</div>
                                    <div style={{
                                        fontSize: '2rem', fontWeight: 700, color: card.color,
                                        fontFamily: 'Rajdhani, sans-serif',
                                    }}>{card.value}</div>
                                    <div style={{ color: theme.textMuted, fontSize: '0.8rem', marginTop: '2px' }}>
                                        {card.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Records */}
                        <div style={{
                            background: theme.bgCard,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '12px', overflow: 'hidden',
                            boxShadow: theme.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                        }}>
                            {/* Card header */}
                            <div style={{
                                padding: '16px 20px',
                                borderBottom: `1px solid ${theme.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: theme.textPrimary }}>
                                    Recently Updated Records
                                </h2>
                                <a href="/admin/plates" style={{
                                    fontSize: '0.8rem', color: '#3b82f6',
                                    textDecoration: 'none', fontWeight: 600,
                                }}>View All →</a>
                            </div>

                            {/* Table or empty state */}
                            {!stats?.recent?.length ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: theme.textMuted }}>
                                    <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                                        <IconList size={36} />
                                    </div>
                                    No records yet. Add your first plate record!
                                </div>
                            ) : (
                                <>
                                    <div style={{ position: 'relative' }}>
                                        {/* Mini spinner overlay while paginating */}
                                        {recentLoading && (
                                            <div style={{
                                                position: 'absolute', inset: 0, zIndex: 2,
                                                background: theme.dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <div style={{
                                                    width: '24px', height: '24px',
                                                    border: '2px solid rgba(59,130,246,0.15)',
                                                    borderTopColor: '#3b82f6', borderRadius: '50%',
                                                    animation: 'spin 0.8s linear infinite',
                                                }} />
                                            </div>
                                        )}
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                            <thead>
                                            <tr>
                                                {['MV File No.', 'Owner', 'Plate No.', 'Status', 'Claim Location', 'Updated'].map(h => (
                                                    <th key={h} style={{
                                                        padding: '12px 16px', textAlign: 'left',
                                                        color: theme.textMuted, fontSize: '0.72rem',
                                                        fontWeight: 600, letterSpacing: '0.08em',
                                                        textTransform: 'uppercase',
                                                        borderBottom: `1px solid ${theme.border}`,
                                                        background: theme.bgCard,
                                                    }}>{h}</th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {stats.recent.map((p) => {
                                                const sc = STATUS_COLORS[p.status] || STATUS_COLORS['In Process'];
                                                return (
                                                    <tr key={p.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <span style={{
                                                                fontFamily: 'JetBrains Mono, monospace',
                                                                fontWeight: 600, fontSize: '0.82rem',
                                                                color: theme.dark ? '#22d3ee' : '#1d4ed8',
                                                            }}>{p.mv_file_number}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: theme.textPrimary }}>
                                                            {p.owner_name}
                                                        </td>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            {p.plate_number ? (
                                                                <span style={{
                                                                    background: theme.plateBg,
                                                                    border: `1.5px solid ${theme.plateBorder}`,
                                                                    borderRadius: '6px', padding: '2px 8px',
                                                                    fontFamily: 'JetBrains Mono, monospace',
                                                                    fontWeight: 600, fontSize: '0.82rem',
                                                                    color: theme.plateText,
                                                                }}>{p.plate_number}</span>
                                                            ) : <span style={{ color: theme.textMuted }}>—</span>}
                                                        </td>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <span style={{
                                                                background: sc.bg, color: sc.color,
                                                                border: `1px solid ${sc.border}`,
                                                                borderRadius: '20px', padding: '3px 10px',
                                                                fontSize: '0.72rem', fontWeight: 600,
                                                            }}>{p.status}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: theme.textMuted }}>
                                                            {p.claim_location || '—'}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: theme.textMuted, fontSize: '0.8rem' }}>
                                                            {new Date(p.updated_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination footer */}
                                    {recentTotalPages > 1 && (
                                        <div style={{
                                            padding: '12px 20px',
                                            borderTop: `1px solid ${theme.border}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        }}>
                                            <span style={{ fontSize: '0.78rem', color: theme.textMuted }}>
                                                Showing <strong style={{ color: theme.textPrimary }}>{firstItem}–{lastItem}</strong> of{' '}
                                                <strong style={{ color: theme.textPrimary }}>{total}</strong> records
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <button
                                                    onClick={() => setRecentPage(p => Math.max(1, p - 1))}
                                                    disabled={recentPage === 1}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                        padding: '5px 10px', borderRadius: '6px',
                                                        border: `1px solid ${theme.border}`,
                                                        background: 'transparent',
                                                        color: recentPage === 1 ? theme.textMuted : theme.textPrimary,
                                                        cursor: recentPage === 1 ? 'not-allowed' : 'pointer',
                                                        opacity: recentPage === 1 ? 0.4 : 1,
                                                        fontSize: '0.78rem', fontWeight: 500,
                                                    }}
                                                >
                                                    <IconChevronLeft size={13} /> Prev
                                                </button>
                                                <span style={{ fontSize: '0.78rem', color: theme.textMuted, padding: '0 4px' }}>
                                                    Page <strong style={{ color: theme.textPrimary }}>{recentPage}</strong> of {recentTotalPages}
                                                </span>
                                                <button
                                                    onClick={() => setRecentPage(p => Math.min(recentTotalPages, p + 1))}
                                                    disabled={recentPage === recentTotalPages}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                        padding: '5px 10px', borderRadius: '6px',
                                                        border: `1px solid ${theme.border}`,
                                                        background: 'transparent',
                                                        color: recentPage === recentTotalPages ? theme.textMuted : theme.textPrimary,
                                                        cursor: recentPage === recentTotalPages ? 'not-allowed' : 'pointer',
                                                        opacity: recentPage === recentTotalPages ? 0.4 : 1,
                                                        fontSize: '0.78rem', fontWeight: 500,
                                                    }}
                                                >
                                                    Next <IconChevronRight size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
