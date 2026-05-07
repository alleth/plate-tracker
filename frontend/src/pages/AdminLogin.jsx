import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import { ThemeContext } from '../App';
import { toast } from 'react-toastify';

const IconMoon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);
const IconSun = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);
const IconPlate = ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <path d="M6 11h.01M18 11h.01M9 11h6" />
    </svg>
);

export default function AdminLogin() {
    const { theme, setDark } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await adminService.login(form);
            localStorage.setItem('platex_token', res.data.token);
            localStorage.setItem('platex_user', res.data.username);
            localStorage.setItem('platex_role', res.data.role || 'administrator');
            localStorage.setItem('platex_site_code', res.data.site_code || '');
            localStorage.setItem('platex_dealer_name', res.data.dealer_name || '');
            toast.success(`Welcome back, ${res.data.username}!`);
            navigate('/admin');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: theme.dark
                ? 'linear-gradient(135deg, #0a0f1e 0%, #0f1729 100%)'
                : 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '20px',
        }}>
            {/* Dark mode toggle */}
            <div style={{ position: 'absolute', top: '20px', right: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: theme.textMuted, display: 'flex', alignItems: 'center' }}>
                    {theme.dark ? <IconMoon /> : <IconSun />}
                </span>
                <div
                    onClick={() => setDark(d => !d)}
                    style={{
                        width: '38px', height: '22px',
                        background: theme.dark ? '#3b82f6' : '#cbd5e1',
                        borderRadius: '999px', cursor: 'pointer',
                        position: 'relative',
                    }}
                >
                    <div style={{
                        position: 'absolute', top: '3px',
                        left: theme.dark ? '19px' : '3px',
                        width: '16px', height: '16px',
                        background: '#ffffff', borderRadius: '50%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                </div>
            </div>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px', color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(29,78,216,0.35)',
                }}>
                    <IconPlate size={26} />
                </div>
                <div style={{
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
                    fontSize: '1.5rem', color: theme.textPrimary, letterSpacing: '0.06em',
                }}>LTO-VII <span style={{ color: theme.textMuted, fontWeight: 400 }}>|</span> Plate Spotter</div>
                <div style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: '4px' }}>
                    Admin Panel Login
                </div>
            </div>

            {/* Login card */}
            <div style={{
                width: '100%', maxWidth: '400px',
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                borderRadius: '16px', padding: '32px',
                boxShadow: theme.dark
                    ? '0 20px 60px rgba(0,0,0,0.4)'
                    : '0 20px 60px rgba(0,0,0,0.08)',
            }}>
                <form onSubmit={submit}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.75rem', fontWeight: 700,
                            color: theme.textMuted, letterSpacing: '0.08em',
                            textTransform: 'uppercase', marginBottom: '8px',
                        }}>Username</label>
                        <input
                            name="username" value={form.username}
                            onChange={handle} required
                            placeholder="Enter username"
                            style={{
                                width: '100%', background: theme.bgInput,
                                border: `1px solid ${theme.borderInput}`,
                                borderRadius: '10px', color: theme.textPrimary,
                                fontSize: '0.95rem', padding: '12px 14px',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.75rem', fontWeight: 700,
                            color: theme.textMuted, letterSpacing: '0.08em',
                            textTransform: 'uppercase', marginBottom: '8px',
                        }}>Password</label>
                        <input
                            name="password" value={form.password}
                            onChange={handle} required
                            type="password" placeholder="Enter password"
                            style={{
                                width: '100%', background: theme.bgInput,
                                border: `1px solid ${theme.borderInput}`,
                                borderRadius: '10px', color: theme.textPrimary,
                                fontSize: '0.95rem', padding: '12px 14px',
                            }}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        border: 'none', borderRadius: '10px', color: 'white',
                        padding: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 700, fontSize: '0.95rem',
                        opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? 'Logging in...' : 'Login to Admin Panel'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <a href="/" style={{
                        color: theme.textMuted, fontSize: '0.8rem',
                        textDecoration: 'none', fontWeight: 500,
                    }}>← Back to Plate Search</a>
                </div>
            </div>
        </div>
    );
}
