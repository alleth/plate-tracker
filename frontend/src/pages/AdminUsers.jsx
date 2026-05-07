import React, { useState, useEffect, useContext } from 'react';
import { userService } from '../services/api';
import { ThemeContext } from '../App';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';

const IconUsers = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const ROLES = [
    { value: 'administrator', label: 'Administrator' },
    { value: 'lto', label: 'LTO' },
    { value: 'dealer', label: 'Dealer' },
];

const ROLE_COLORS = {
    administrator: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    lto: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
    dealer: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
};

const empty = { first_name: '', middle_name: '', last_name: '', username: '', password: '', role: 'lto', site_code: '', dealer_name: '' };

const generateUsername = (firstName, middleName, lastName) => {
    const first = firstName.trim().charAt(0).toLowerCase();
    const middle = middleName.trim().charAt(0).toLowerCase();
    const last = lastName.trim().replace(/\s+/g, '').toLowerCase();
    return first + middle + last;
};

const currentUserId = () => {
    try {
        const token = localStorage.getItem('platex_token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch { return null; }
};

export default function AdminUsers() {
    const { theme } = useContext(ThemeContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const myId = currentUserId();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userService.getAll();
            setUsers(res.data.data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setSelected(null);
        setForm(empty);
        setShowModal(true);
    };

    const openEdit = (user) => {
        setSelected(user);
        setForm({ ...empty, ...user, password: '' });
        setShowModal(true);
    };

    const handle = (e) => {
        const { name, value } = e.target;
        setForm(f => {
            const updated = {
                ...f,
                [name]: value,
                ...(name === 'role' && value !== 'lto' ? { site_code: '' } : {}),
                ...(name === 'role' && value !== 'dealer' ? { dealer_name: '' } : {}),
            };
            // Auto-generate username only when creating
            if (!selected && (name === 'first_name' || name === 'middle_name' || name === 'last_name')) {
                const fn = name === 'first_name' ? value : f.first_name;
                const mn = name === 'middle_name' ? value : f.middle_name;
                const ln = name === 'last_name' ? value : f.last_name;
                updated.username = generateUsername(fn, mn, ln);
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form };
            if (selected) {
                // Edit: only send password if filled
                if (!payload.password) delete payload.password;
                await userService.update(selected.id, payload);
                toast.success('User updated!');
            } else {
                // Create: no password sent — backend defaults to 'password'
                delete payload.password;
                await userService.create(payload);
                toast.success('User created! Default password: password');
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await userService.delete(id);
            toast.success('User deleted');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
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
                    }}>User Management</h1>
                    <p style={{ color: theme.textMuted, margin: '4px 0 0', fontSize: '0.875rem' }}>
                        Manage administrator, LTO, and dealer accounts
                    </p>
                </div>
                <button onClick={openAdd} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    border: 'none', borderRadius: '8px', color: 'white',
                    padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                }}>
                    <IconPlus size={14} /> Add User
                </button>
            </div>

            <div style={{ padding: '28px' }}>
                <div style={{
                    background: theme.bgCard, border: `1px solid ${theme.border}`,
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
                    ) : users.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: theme.textMuted }}>
                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                                <IconUsers size={40} />
                            </div>
                            <div>No users found.</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                <tr>
                                    {['Name', 'Username', 'Role', 'Site Code / Dealer Name', 'Created', 'Actions'].map(h => (
                                        <th key={h} style={{
                                            padding: '12px 16px', textAlign: 'left',
                                            color: theme.textMuted, fontSize: '0.72rem',
                                            fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                                            borderBottom: `1px solid ${theme.border}`, background: theme.bgCard,
                                        }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {users.map((u) => {
                                    const rc = ROLE_COLORS[u.role] || ROLE_COLORS.lto;
                                    const isMe = u.id === myId;
                                    const fullName = [u.first_name, u.middle_name, u.last_name].filter(Boolean).join(' ') || '—';
                                    return (
                                        <tr key={u.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                                            <td style={{ padding: '12px 16px', color: theme.textPrimary, fontWeight: 600 }}>
                                                {fullName}
                                                {isMe && (
                                                    <span style={{
                                                        marginLeft: '8px', fontSize: '0.65rem',
                                                        color: '#3b82f6', background: 'rgba(59,130,246,0.1)',
                                                        border: '1px solid rgba(59,130,246,0.2)',
                                                        borderRadius: '4px', padding: '1px 6px',
                                                    }}>You</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px', color: theme.textMuted, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>
                                                {u.username}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    background: rc.bg, color: rc.color,
                                                    border: `1px solid ${rc.border}`,
                                                    borderRadius: '20px', padding: '3px 10px',
                                                    fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize',
                                                }}>{u.role}</span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: theme.textMuted }}>
                                                {u.role === 'lto' && u.site_code ? (
                                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: theme.textPrimary }}>
                                                        {u.site_code}
                                                    </span>
                                                ) : u.role === 'dealer' && u.dealer_name ? (
                                                    u.dealer_name
                                                ) : '—'}
                                            </td>
                                            <td style={{ padding: '12px 16px', color: theme.textMuted, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => openEdit(u)} style={{
                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                                                        borderRadius: '6px', color: '#3b82f6',
                                                        padding: '5px 10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                                                    }}>
                                                        <IconEdit size={12} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        disabled={isMe}
                                                        style={{
                                                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                                            borderRadius: '6px', color: '#ef4444',
                                                            padding: '5px 10px', cursor: isMe ? 'not-allowed' : 'pointer',
                                                            fontSize: '0.78rem', fontWeight: 600, opacity: isMe ? 0.4 : 1,
                                                        }}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
                            {selected ? 'Edit User' : 'Add User'}
                        </h5>
                        <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <IconClose size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* First / Middle / Last name */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>First Name *</label>
                                    <input name="first_name" value={form.first_name} onChange={handle} required
                                           placeholder="e.g. Juan" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Middle Name</label>
                                    <input name="middle_name" value={form.middle_name} onChange={handle}
                                           placeholder="e.g. Reyes" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name *</label>
                                    <input name="last_name" value={form.last_name} onChange={handle} required
                                           placeholder="e.g. Dela Cruz" style={inputStyle} />
                                </div>
                            </div>

                            {/* Username — auto-generated on create, editable */}
                            <div>
                                <label style={labelStyle}>Username *</label>
                                <input name="username" value={form.username} onChange={handle} required
                                       placeholder="Auto-generated from name"
                                       style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} />
                                {!selected && (
                                    <div style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: '4px' }}>
                                        Auto-filled from first initial + last name. You can edit it manually.
                                    </div>
                                )}
                            </div>

                            {/* Password — only shown when editing */}
                            {selected && (
                                <div>
                                    <label style={labelStyle}>New Password</label>
                                    <input name="password" value={form.password} onChange={handle}
                                           type="password" placeholder="Leave blank to keep current password"
                                           style={inputStyle} />
                                </div>
                            )}

                            {!selected && (
                                <div style={{
                                    fontSize: '0.78rem', color: '#f59e0b',
                                    background: 'rgba(245,158,11,0.08)',
                                    border: '1px solid rgba(245,158,11,0.2)',
                                    borderRadius: '8px', padding: '8px 12px',
                                }}>
                                    Default password will be set to <strong>password</strong>. Ask the user to change it after first login.
                                </div>
                            )}

                            {/* Role */}
                            <div>
                                <label style={labelStyle}>Role *</label>
                                <select name="role" value={form.role} onChange={handle} required
                                        style={{ ...inputStyle, cursor: 'pointer' }}>
                                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>

                            {form.role === 'lto' && (
                                <div>
                                    <label style={labelStyle}>Site Code</label>
                                    <input name="site_code" value={form.site_code} onChange={handle}
                                           placeholder="e.g. 0701"
                                           style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }} />
                                    <div style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: '4px' }}>
                                        LTO users will only see plates with this site code.
                                    </div>
                                </div>
                            )}

                            {form.role === 'dealer' && (
                                <div>
                                    <label style={labelStyle}>Dealer Name</label>
                                    <input name="dealer_name" value={form.dealer_name} onChange={handle}
                                           placeholder="e.g. Honda Cars Cebu"
                                           style={inputStyle} />
                                    <div style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: '4px' }}>
                                        Name shown in the dealer dropdown when assigning plates.
                                    </div>
                                </div>
                            )}
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
                                {saving ? 'Saving...' : selected ? 'Update User' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
