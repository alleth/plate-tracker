import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Search from './pages/Search';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPlates from './pages/AdminPlates';
import AdminUsers from './pages/AdminUsers';
import Sidebar from './components/Sidebar';

export const ThemeContext = React.createContext();

const SIDEBAR_W = 240;
const SIDEBAR_COLLAPSED_W = 64;

function AdminLayout({ children, dark, setDark }) {
    const { collapsed } = React.useContext(ThemeContext);
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar dark={dark} setDark={setDark} />
            <main style={{
                marginLeft: collapsed ? `${SIDEBAR_COLLAPSED_W}px` : `${SIDEBAR_W}px`,
                flex: 1, minWidth: 0, minHeight: '100vh', overflow: 'hidden',
            }}>
                {children}
            </main>
        </div>
    );
}

function ProtectedRoute({ children, dark, setDark, allowedRoles }) {
    const token = localStorage.getItem('platex_token');
    const role = localStorage.getItem('platex_role') || 'administrator';
    if (!token) return <Navigate to="/admin/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/admin/plates" replace />;
    }
    return <AdminLayout dark={dark} setDark={setDark}>{children}</AdminLayout>;
}

export default function App() {
    const [dark, setDark] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const theme = {
        dark,
        bg: dark ? '#0a0f1e' : '#f1f5f9',
        bgCard: dark ? '#0f1729' : '#ffffff',
        border: dark ? 'rgba(99,143,255,0.12)' : '#e2e8f0',
        textPrimary: dark ? '#e2e8f0' : '#0f172a',
        textMuted: dark ? '#64748b' : '#64748b',
        bgInput: dark ? 'rgba(15,23,41,0.8)' : '#ffffff',
        borderInput: dark ? 'rgba(99,143,255,0.2)' : '#cbd5e1',
        bgHeader: dark ? 'linear-gradient(180deg, #0c1427 0%, transparent 100%)' : 'linear-gradient(180deg, #ffffff 0%, transparent 100%)',
        bgSidebar: dark ? 'linear-gradient(180deg, #0c1427 0%, #0a0f1e 100%)' : 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 100%)',
        plateText: dark ? '#22d3ee' : '#1d4ed8',
        plateBg: dark ? '#1a2540' : '#eff6ff',
        plateBorder: dark ? 'rgba(99,143,255,0.3)' : '#bfdbfe',
    };

    return (
        <ThemeContext.Provider value={{ theme, setDark, collapsed, setCollapsed }}>
            <div style={{ background: theme.bg, minHeight: '100vh', transition: 'all 0.3s' }}>
                <BrowserRouter>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<Search />} />

                        {/* Admin */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={
                            <ProtectedRoute dark={dark} setDark={setDark}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/plates" element={
                            <ProtectedRoute dark={dark} setDark={setDark}>
                                <AdminPlates />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute dark={dark} setDark={setDark} allowedRoles={['administrator']}>
                                <AdminUsers />
                            </ProtectedRoute>
                        } />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
                <ToastContainer position="bottom-right" autoClose={3000} theme={dark ? 'dark' : 'light'} />
            </div>
        </ThemeContext.Provider>
    );
}
