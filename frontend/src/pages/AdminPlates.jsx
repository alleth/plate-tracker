import React, { useState, useEffect, useContext } from 'react';
import { adminService } from '../services/api';
import { ThemeContext } from '../App';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';

const IconSearch = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconList = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
        <line x1="4" y1="6" x2="4.01" y2="6" /><line x1="4" y1="12" x2="4.01" y2="12" /><line x1="4" y1="18" x2="4.01" y2="18" />
    </svg>
);
const IconEdit = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const IconPlus = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const IconClose = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IconCircle = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
    </svg>
);
const IconCheckCircle = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const IconChevronLeft = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IconChevronRight = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
const IconCopy = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
);

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Pickup Truck', 'Motorcycle', 'Van', 'Bus', 'Truck', 'Other'];
const STATUSES = ['In Process', 'At Dealer', 'At LTO'];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const STATUS_COLORS = {
    'Available': { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
    'At LTO':    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
    'At Dealer': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    'In Process':{ color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
};

const emptyForm = {
    mv_file_number: '', site_code: '', site_name: '', plate_number: '', owner_name: '',
    vehicle_type: '', brand: '', model: '', color: '',
    status: 'At Dealer', claim_location: '', remarks: '', assigned_dealer_id: '',
};

function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
}

const normalizePlate = (p) => p ? p.toUpperCase().replace(/\s/g, '') : '';

export default function AdminPlates() {
    const { theme } = useContext(ThemeContext);
    const role = localStorage.getItem('platex_role') || 'administrator';
    const mySiteCode = localStorage.getItem('platex_site_code') || '';

    const canAdd    = role === 'administrator' || role === 'lto';
    const canEdit   = role === 'administrator' || role === 'lto';
    const canDelete = role === 'administrator';
    const canClaim  = role === 'administrator' || role === 'dealer';

    const [plates, setPlates]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [page, setPage]             = useState(1);
    const [pageSize, setPageSize]     = useState(10);
    const [total, setTotal]           = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal]   = useState(false);
    const [selected, setSelected]     = useState(null);
    const [form, setForm]             = useState(emptyForm);
    const [saving, setSaving]         = useState(false);
    const [dealers, setDealers]       = useState([]);
    const [dupFilter, setDupFilter]   = useState(false);
    const [claimingIds, setClaimingIds] = useState(new Set());

    useEffect(() => { fetchPlates(search, page, dupFilter, pageSize); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        adminService.getDealers().then(r => setDealers(r.data.data)).catch(() => {});
    }, []);

    const fetchPlates = async (q = '', p = 1, dup = false, size = 10) => {
        setLoading(true);
        try {
            const res = dup
                ? await adminService.getAll(q, p, size, 'plate')
                : await adminService.getAll(q, p, size, '');
            setPlates(res.data.data);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch {
            toast.error('Failed to load records');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const q = e.target.value;
        setSearch(q);
        setPage(1);
        fetchPlates(q, 1, dupFilter, pageSize);
    };

    const handleDupFilter = () => {
        const next = !dupFilter;
        setDupFilter(next);
        setPage(1);
        fetchPlates(search, 1, next, pageSize);
    };

    const handlePageSize = (size) => {
        setPageSize(size);
        setPage(1);
        fetchPlates(search, 1, dupFilter, size);
    };

    const goToPage = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    };

    const openAdd = () => {
        setSelected(null);
        setForm({ ...emptyForm, site_code: mySiteCode });
        setShowModal(true);
    };

    const openEdit = (plate) => {
        setSelected(plate);
        setForm({ ...emptyForm, ...plate, assigned_dealer_id: plate.assigned_dealer_id || '' });
        setShowModal(true);
    };

    const handle = (e) => {
        const { name, value } = e.target;
        setForm(f => ({
            ...f,
            [name]: value,
            ...(name === 'status' && value === 'In Process' ? { claim_location: '' } : {}),
            ...(name === 'status' && value !== 'At Dealer'  ? { assigned_dealer_id: '' } : {}),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (selected) {
                await adminService.update(selected.id, form);
                toast.success('Record updated!');
                fetchPlates(search, page, dupFilter, pageSize);
            } else {
                await adminService.create(form);
                toast.success('Record added!');
                setPage(1);
                fetchPlates(search, 1, dupFilter, pageSize);
            }
            setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleClaim = async (id, current) => {
        setClaimingIds(prev => new Set([...prev, id]));
        try {
            const res = await adminService.setClaimed(id, !current);
            setPlates(prev => prev.map(p => p.id === id ? { ...p, is_claimed: res.data.data.is_claimed } : p));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update claimed status');
        } finally {
            setClaimingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this plate record?')) return;
        try {
            await adminService.delete(id);
            toast.success('Record deleted');
            const newPage = plates.length === 1 && page > 1 ? page - 1 : page;
            setPage(newPage);
            fetchPlates(search, newPage, dupFilter, pageSize);
        } catch {
            toast.error('Failed to delete record');
        }
    };

    const inputStyle = {
        background: theme.bgInput, border: `1px solid ${theme.borderInput}`,
        borderRadius: '8px', color: theme.textPrimary,
        fontSize: '0.875rem', padding: '9px 12px', width: '100%', outline: 'none',
    };
    const labelStyle = {
        display: 'block', color: theme.textMuted, fontSize: '0.72rem',
        fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px',
    };

    const pageNumbers = getPageNumbers(page, totalPages);
    const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastItem  = Math.min(page * pageSize, total);

    const showSiteCode = role !== 'dealer';
    const showActions  = canEdit || canDelete;

    const displayPlates = dupFilter
        ? [...plates].sort((a, b) => {
            const ka = normalizePlate(a.plate_number);
            const kb = normalizePlate(b.plate_number);
            if (ka < kb) return -1;
            if (ka > kb) return 1;
            return a.id - b.id;
        })
        : plates;

    const mvGroupIndex = {};
    let _groupCounter = 0;
    if (dupFilter) {
        displayPlates.forEach(p => {
            const key = normalizePlate(p.plate_number);
            if (key && !(key in mvGroupIndex)) mvGroupIndex[key] = _groupCounter++;
        });
    }

    const tableHeaders = [
        'MV File No.',
        ...(showSiteCode ? ['Site Code', 'Site Name'] : []),
        'Owner', 'Plate No.', 'Vehicle', 'Status', 'Claim Location', 'Dealer',
        'Updated',
        ...(canClaim   ? ['Claimed']  : []),
        ...(showActions ? ['Actions'] : []),
    ];

    return (
        <div>
            {/* Header */}
            <div style={{
                background: theme.bgHeader, borderBottom: `1px solid ${theme.border}`,
                padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <h1 style={{
                        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                        fontSize: '1.6rem', margin: 0, color: theme.textPrimary,
                    }}>Plate Records</h1>
                    <p style={{ color: theme.textMuted, margin: '4px 0 0', fontSize: '0.875rem' }}>
                        {role === 'lto'
                            ? `Showing records for site code: ${mySiteCode || '—'}`
                            : 'Manage all vehicle plate records'}
                    </p>
                </div>
                {canAdd && (
                    <button onClick={openAdd} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        border: 'none', borderRadius: '8px', color: 'white',
                        padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                    }}>
                        <IconPlus size={14} /> Add Record
                    </button>
                )}
            </div>

            <div style={{ padding: '16px 20px' }}>

                {/* Search + duplicate filter toggle */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: '12px', top: '50%',
                            transform: 'translateY(-50%)', color: theme.textMuted,
                            display: 'flex', alignItems: 'center',
                        }}>
                            <IconSearch size={16} />
                        </span>
                        <input
                            value={search} onChange={handleSearch}
                            placeholder="Search by MV File No., plate, owner, brand, model, color, status, site..."
                            style={{ ...inputStyle, paddingLeft: '36px' }}
                        />
                    </div>
                    <button
                        onClick={handleDupFilter}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 14px', borderRadius: '8px',
                            border: `1px solid ${dupFilter ? '#f59e0b' : theme.border}`,
                            background: dupFilter ? 'rgba(245,158,11,0.12)' : 'transparent',
                            color: dupFilter ? '#f59e0b' : theme.textMuted,
                            fontSize: '0.82rem', fontWeight: dupFilter ? 600 : 400,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                    >
                        <IconCopy size={14} />
                        Duplicates
                        {dupFilter && (
                            <span style={{
                                background: '#f59e0b', color: '#fff',
                                borderRadius: '10px', fontSize: '0.62rem',
                                fontWeight: 700, padding: '1px 6px', letterSpacing: '0.05em',
                            }}>ON</span>
                        )}
                    </button>
                </div>

                {/* Duplicate mode hint */}
                {dupFilter && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px',
                        padding: '8px 12px', borderRadius: '8px',
                        background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)',
                        fontSize: '0.78rem', color: '#d97706',
                    }}>
                        <IconCopy size={13} />
                        Showing records with a duplicate Plate Number. Matching pairs are displayed as adjacent rows.
                    </div>
                )}

                {/* Table card */}
                <div style={{
                    background: theme.bgCard,
                    border: `1px solid ${dupFilter ? 'rgba(245,158,11,0.35)' : theme.border}`,
                    borderRadius: '12px', overflow: 'hidden',
                    boxShadow: theme.dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                border: '3px solid rgba(59,130,246,0.15)',
                                borderTopColor: '#3b82f6', borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                        </div>
                    ) : plates.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted }}>
                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                                <IconList size={40} />
                            </div>
                            <div>
                                {dupFilter
                                    ? 'No duplicate records found.'
                                    : canAdd ? 'No records found. Add your first plate record!' : 'No records assigned to you yet.'}
                            </div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                <thead>
                                <tr>
                                    {tableHeaders.map((h, i) => (
                                        <th key={i} style={{
                                            padding: '10px 12px', textAlign: 'left',
                                            color: theme.textMuted, fontSize: '0.68rem',
                                            fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                                            borderBottom: `1px solid ${theme.border}`,
                                            background: theme.bgCard, whiteSpace: 'nowrap',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {displayPlates.map((p) => {
                                    const sc       = STATUS_COLORS[p.status] || STATUS_COLORS['In Process'];
                                    const truncate = { maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
                                    const groupIdx = dupFilter ? (mvGroupIndex[normalizePlate(p.plate_number)] ?? 0) : 0;
                                    const groupBg  = dupFilter
                                        ? (groupIdx % 2 === 0
                                            ? (theme.dark ? 'rgba(245,158,11,0.07)' : 'rgba(254,252,232,0.6)')
                                            : (theme.dark ? 'rgba(59,130,246,0.06)' : 'rgba(239,246,255,0.6)'))
                                        : 'transparent';

                                    return (
                                        <React.Fragment key={p.id}>
                                            <tr style={{
                                                borderBottom: `1px solid ${theme.border}`,
                                                background: groupBg,
                                            }}>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span style={{
                                                        fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: '0.78rem',
                                                        color: theme.dark ? '#22d3ee' : '#1d4ed8',
                                                    }}>{p.mv_file_number}</span>
                                                </td>
                                                {showSiteCode && (
                                                    <>
                                                        <td style={{ padding: '10px 12px' }}>
                                                            {p.site_code
                                                                ? <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', fontWeight: 600, color: theme.textPrimary }}>{p.site_code}</span>
                                                                : <span style={{ color: theme.textMuted }}>—</span>}
                                                        </td>
                                                        <td style={{ padding: '10px 12px', color: theme.textMuted, ...truncate }}>{p.site_name || '—'}</td>
                                                    </>
                                                )}
                                                <td style={{ padding: '10px 12px', color: theme.textPrimary, ...truncate }}>{p.owner_name}</td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    {p.plate_number ? (
                                                        <span style={{
                                                            background: theme.plateBg, border: `1.5px solid ${theme.plateBorder}`,
                                                            borderRadius: '6px', padding: '2px 6px',
                                                            fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: '0.78rem',
                                                            color: theme.plateText, whiteSpace: 'nowrap',
                                                        }}>{p.plate_number}</span>
                                                    ) : <span style={{ color: theme.textMuted }}>—</span>}
                                                </td>
                                                <td style={{ padding: '10px 12px', color: theme.textMuted, ...truncate }}>
                                                    {[p.brand, p.model].filter(Boolean).join(' ') || '—'}
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span style={{
                                                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                                                        borderRadius: '20px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap',
                                                    }}>{p.status}</span>
                                                </td>
                                                <td style={{ padding: '10px 12px', color: theme.textMuted, ...truncate }}>{p.claim_location || '—'}</td>
                                                <td style={{ padding: '10px 12px', color: theme.textMuted, ...truncate }}>{p.assigned_dealer_name || '—'}</td>
                                                <td style={{ padding: '10px 12px', color: theme.textMuted, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                                    {new Date(p.updated_at).toLocaleDateString()}
                                                </td>
                                                {canClaim && (
                                                    <td style={{ padding: '10px 12px' }}>
                                                        {(() => {
                                                            const isClaiming = claimingIds.has(p.id);
                                                            return (
                                                                <button
                                                                    onClick={() => handleToggleClaim(p.id, p.is_claimed)}
                                                                    disabled={isClaiming}
                                                                    title={p.is_claimed ? 'Mark as unclaimed' : 'Mark as claimed'}
                                                                    style={{
                                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                                        background: p.is_claimed ? 'rgba(16,185,129,0.12)' : 'transparent',
                                                                        border: `1px solid ${p.is_claimed ? 'rgba(16,185,129,0.35)' : 'rgba(156,163,175,0.3)'}`,
                                                                        borderRadius: '6px', padding: '4px 8px',
                                                                        cursor: isClaiming ? 'not-allowed' : 'pointer',
                                                                        color: p.is_claimed ? '#10b981' : '#9ca3af',
                                                                        fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap',
                                                                        opacity: isClaiming ? 0.7 : 1,
                                                                        minWidth: '78px', justifyContent: 'center',
                                                                    }}
                                                                >
                                                                    {isClaiming ? (
                                                                        <div style={{
                                                                            width: '12px', height: '12px', borderRadius: '50%',
                                                                            border: '2px solid currentColor',
                                                                            borderTopColor: 'transparent',
                                                                            animation: 'spin 0.7s linear infinite',
                                                                        }} />
                                                                    ) : (
                                                                        <>
                                                                            {p.is_claimed ? <IconCheckCircle size={13} /> : <IconCircle size={13} />}
                                                                            {p.is_claimed ? 'Claimed' : 'Unclaimed'}
                                                                        </>
                                                                    )}
                                                                </button>
                                                            );
                                                        })()}
                                                    </td>
                                                )}
                                                {showActions && (
                                                    <td style={{ padding: '10px 12px' }}>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            {canEdit && (
                                                                <button onClick={() => openEdit(p)} style={{
                                                                    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                                                                    borderRadius: '6px', color: '#3b82f6',
                                                                    padding: '4px 8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                                                }}>Edit</button>
                                                            )}
                                                            {canDelete && (
                                                                <button onClick={() => handleDelete(p.id)} style={{
                                                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                                                    borderRadius: '6px', color: '#ef4444',
                                                                    padding: '4px 8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                                                }}>Delete</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>

                                        </React.Fragment>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination + rows-per-page */}
                {!loading && total > 0 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginTop: '14px', flexWrap: 'wrap', gap: '12px',
                    }}>
                        {/* Left: record count + rows-per-page */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', color: theme.textMuted }}>
                                Showing <strong style={{ color: theme.textPrimary }}>{firstItem}–{lastItem}</strong> of{' '}
                                <strong style={{ color: theme.textPrimary }}>{total}</strong> records
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.72rem', color: theme.textMuted, marginRight: '2px' }}>Rows:</span>
                                {PAGE_SIZE_OPTIONS.map(opt => (
                                    <button key={opt} onClick={() => handlePageSize(opt)} style={{
                                        minWidth: '34px', height: '26px', borderRadius: '5px', padding: '0 6px',
                                        border: `1px solid ${opt === pageSize ? '#2563eb' : theme.border}`,
                                        background: opt === pageSize ? '#2563eb' : 'transparent',
                                        color: opt === pageSize ? '#fff' : theme.textMuted,
                                        fontSize: '0.72rem', fontWeight: opt === pageSize ? 700 : 400,
                                        cursor: 'pointer',
                                    }}>{opt}</button>
                                ))}
                            </div>
                        </div>

                        {/* Right: page navigation */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <button onClick={() => goToPage(page - 1)} disabled={page === 1} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '32px', height: '32px', borderRadius: '6px', border: `1px solid ${theme.border}`,
                                    background: 'transparent', color: page === 1 ? theme.textMuted : theme.textPrimary,
                                    cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1,
                                }}><IconChevronLeft size={14} /></button>
                                {pageNumbers.map((pg, i) => (
                                    pg === '...' ? (
                                        <span key={`e-${i}`} style={{
                                            width: '32px', height: '32px', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            color: theme.textMuted, fontSize: '0.85rem',
                                        }}>…</span>
                                    ) : (
                                        <button key={pg} onClick={() => goToPage(pg)} style={{
                                            width: '32px', height: '32px', borderRadius: '6px',
                                            border: `1px solid ${pg === page ? '#2563eb' : theme.border}`,
                                            background: pg === page ? '#2563eb' : 'transparent',
                                            color: pg === page ? '#ffffff' : theme.textPrimary,
                                            cursor: 'pointer', fontSize: '0.82rem', fontWeight: pg === page ? 700 : 400,
                                        }}>{pg}</button>
                                    )
                                ))}
                                <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '32px', height: '32px', borderRadius: '6px', border: `1px solid ${theme.border}`,
                                    background: 'transparent', color: page === totalPages ? theme.textMuted : theme.textPrimary,
                                    cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1,
                                }}><IconChevronRight size={14} /></button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add / Edit modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <div style={{
                    background: theme.bgCard, border: `1px solid ${theme.border}`,
                    borderRadius: '14px', color: theme.textPrimary,
                }}>
                    <div style={{
                        padding: '18px 24px', borderBottom: `1px solid ${theme.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {selected ? <IconEdit size={16} /> : <IconPlus size={16} />}
                            {selected ? 'Edit Plate Record' : 'Add Plate Record'}
                        </h5>
                        <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <IconClose size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                                <div>
                                    <label style={labelStyle}>MV File Number *</label>
                                    <input name="mv_file_number" value={form.mv_file_number} onChange={handle}
                                           required disabled={!!selected} placeholder="e.g. 2312-00012345"
                                           style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }} />
                                </div>

                                <div>
                                    <label style={labelStyle}>Site Code</label>
                                    <input name="site_code" value={form.site_code} onChange={handle}
                                           placeholder="e.g. 0701" disabled={role === 'lto'}
                                           style={{
                                               ...inputStyle, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                                               opacity: role === 'lto' ? 0.6 : 1,
                                               cursor: role === 'lto' ? 'not-allowed' : 'text',
                                           }} />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Site Name</label>
                                    <input name="site_name" value={form.site_name} onChange={handle}
                                           placeholder="e.g. LTO Cebu South" style={inputStyle} />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Plate Number</label>
                                    <input name="plate_number" value={form.plate_number} onChange={handle}
                                           placeholder="e.g. ABC 1234"
                                           style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }} />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Owner Name *</label>
                                    <input name="owner_name" value={form.owner_name} onChange={handle}
                                           required placeholder="Full name of vehicle owner" style={inputStyle} />
                                </div>

                                <div>
                                    <label style={labelStyle}>Vehicle Type</label>
                                    <select name="vehicle_type" value={form.vehicle_type} onChange={handle}
                                            style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="">-- Select type --</option>
                                        {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label style={labelStyle}>Brand</label>
                                    <input name="brand" value={form.brand} onChange={handle} placeholder="e.g. Toyota" style={inputStyle} />
                                </div>

                                <div>
                                    <label style={labelStyle}>Model</label>
                                    <input name="model" value={form.model} onChange={handle} placeholder="e.g. Vios" style={inputStyle} />
                                </div>

                                <div>
                                    <label style={labelStyle}>Color</label>
                                    <input name="color" value={form.color} onChange={handle} placeholder="e.g. White" style={inputStyle} />
                                </div>

                                <div>
                                    <label style={labelStyle}>Status *</label>
                                    <select name="status" value={form.status} onChange={handle} required
                                            style={{ ...inputStyle, cursor: 'pointer' }}>
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label style={labelStyle}>Claim Location</label>
                                    <input name="claim_location" value={form.claim_location} onChange={handle}
                                           placeholder={form.status === 'In Process' ? 'Not applicable for In Process' : 'e.g. LTO Cebu South, Honda Dealership'}
                                           disabled={form.status === 'In Process'}
                                           style={{
                                               ...inputStyle,
                                               opacity: form.status === 'In Process' ? 0.45 : 1,
                                               cursor: form.status === 'In Process' ? 'not-allowed' : 'text',
                                           }} />
                                </div>

                                {form.status === 'At Dealer' && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Assign Dealer</label>
                                        <select name="assigned_dealer_id" value={form.assigned_dealer_id} onChange={handle}
                                                style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="">-- Select dealer --</option>
                                            {dealers.length === 0 ? (
                                                <option disabled>No dealers registered yet</option>
                                            ) : dealers.map(d => (
                                                <option key={d.id} value={d.id}>
                                                    {d.dealer_name || d.username} ({d.username})
                                                </option>
                                            ))}
                                        </select>
                                        <div style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: '4px' }}>
                                            The assigned dealer can mark this plate as claimed.
                                        </div>
                                    </div>
                                )}

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Remarks</label>
                                    <textarea name="remarks" value={form.remarks} onChange={handle} rows={3}
                                              placeholder="Optional notes for the owner..."
                                              style={{ ...inputStyle, resize: 'vertical' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '14px 24px', borderTop: `1px solid ${theme.border}`,
                            display: 'flex', justifyContent: 'flex-end', gap: '10px',
                        }}>
                            <button type="button" onClick={() => setShowModal(false)} style={{
                                background: 'transparent', border: `1px solid ${theme.borderInput}`,
                                borderRadius: '8px', color: theme.textMuted,
                                padding: '9px 16px', cursor: 'pointer', fontSize: '0.875rem',
                            }}>Cancel</button>
                            <button type="submit" disabled={saving} style={{
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                border: 'none', borderRadius: '8px', color: 'white',
                                padding: '9px 18px', cursor: saving ? 'not-allowed' : 'pointer',
                                fontWeight: 600, fontSize: '0.875rem', opacity: saving ? 0.7 : 1,
                            }}>
                                {saving ? 'Saving...' : selected ? 'Update Record' : 'Add Record'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
