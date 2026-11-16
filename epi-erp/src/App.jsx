import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import Layout from './components/Layout.jsx';
import { Loading } from './components/ui.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Accounts from './pages/Accounts.jsx';
import Journal from './pages/Journal.jsx';
import Banking from './pages/Banking.jsx';
import Expenses from './pages/Expenses.jsx';
import Parties from './pages/Parties.jsx';
import Invoices from './pages/Invoices.jsx';
import Payments from './pages/Payments.jsx';
import Ageing from './pages/Ageing.jsx';
import Inventory from './pages/Inventory.jsx';
import Vat from './pages/Vat.jsx';
import Payroll from './pages/Payroll.jsx';
import Assets from './pages/Assets.jsx';
import Reports from './pages/Reports.jsx';
import Users from './pages/Users.jsx';
import Audit from './pages/Audit.jsx';
import Settings from './pages/Settings.jsx';

const Guard = ({ module, children }) => {
  const { can } = useAuth();
  return can(module, 'read') ? children : <div className="alert">Your role does not have access to this section.</div>;
};

export default function App() {
  const { user, ready } = useAuth();
  if (!ready && !user) return <Loading />;
  if (!user) return <Login />;
  const g = (module, el) => <Guard module={module}>{el}</Guard>;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={g('dashboard', <Dashboard />)} />
        <Route path="accounts" element={g('accounts', <Accounts />)} />
        <Route path="journal" element={g('journal', <Journal />)} />
        <Route path="banking" element={g('banking', <Banking />)} />
        <Route path="expenses" element={g('expenses', <Expenses />)} />
        <Route path="customers" element={g('sales', <Parties type="customer" />)} />
        <Route path="suppliers" element={g('purchase', <Parties type="supplier" />)} />
        <Route path="sales" element={g('sales', <Invoices type="sale" />)} />
        <Route path="purchases" element={g('purchase', <Invoices type="purchase" />)} />
        <Route path="payments" element={g('payments', <Payments />)} />
        <Route path="receivables" element={g('reports', <Ageing type="receivable" />)} />
        <Route path="payables" element={g('reports', <Ageing type="payable" />)} />
        <Route path="inventory" element={g('inventory', <Inventory />)} />
        <Route path="vat" element={g('vat', <Vat />)} />
        <Route path="payroll" element={g('payroll', <Payroll />)} />
        <Route path="assets" element={g('assets', <Assets />)} />
        <Route path="reports" element={g('reports', <Reports />)} />
        <Route path="users" element={g('users', <Users />)} />
        <Route path="audit" element={g('audit', <Audit />)} />
        <Route path="settings" element={g('settings', <Settings />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
