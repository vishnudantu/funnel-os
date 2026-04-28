import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PipelinePage from './pages/PipelinePage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import OrganizationSettingsPage from './pages/OrganizationSettings';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
function App() {
    return (_jsx(AnimatePresence, { mode: "wait", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(Layout, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/pipeline", replace: true }) }), _jsx(Route, { path: "pipeline", element: _jsx(PipelinePage, {}) }), _jsx(Route, { path: "leads", element: _jsx(LeadsPage, {}) }), _jsx(Route, { path: "leads/:id", element: _jsx(LeadDetailPage, {}) }), _jsx(Route, { path: "analytics", element: _jsx(AnalyticsPage, {}) }), _jsx(Route, { path: "integrations", element: _jsx(IntegrationsPage, {}) }), _jsx(Route, { path: "org-settings", element: _jsx(OrganizationSettingsPage, {}) }), _jsx(Route, { path: "admin", element: _jsx(SuperAdminDashboard, {}) })] })] }) }));
}
export default App;
