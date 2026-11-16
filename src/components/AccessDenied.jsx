import React from 'react';
import { ShieldAlert, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AccessDenied({ attemptedDept, onBack }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const depts = user?.departments || [];

  const handleReturn = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (user?.role === 'superadmin') {
      navigate('/admin');
    } else if (depts.length === 1) {
      navigate(`/${depts[0]}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <div className="denied-icon-wrap">
          <ShieldAlert size={56} className="denied-icon" />
        </div>
        
        <h2>Access Denied</h2>
        <p className="denied-sub">
          You do not have permission to access the <strong>EPI {attemptedDept ? attemptedDept.toUpperCase() : 'DEPARTMENT'}</strong> system.
        </p>

        <div className="denied-explanation-box">
          <div className="denied-box-title">
            <Lock size={15} /> Department-Based Access Control Policy
          </div>
          <p>
            Your employee account (<strong>{user?.userId}</strong>) is restricted to your assigned departmental roles. Direct navigation and API calls to unauthorized departments are strictly blocked.
          </p>
          
          <div className="authorized-depts-list">
            <span>Your Authorized Departments:</span>
            <div className="dept-pill-group">
              {depts.length > 0 ? (
                depts.map((d) => (
                  <span key={d} className={`dept-pill dept-${d}`}>
                    <CheckCircle2 size={13} /> {d.toUpperCase()}
                  </span>
                ))
              ) : (
                <span className="no-depts-text">No departments currently assigned. Please contact Super Admin.</span>
              )}
            </div>
          </div>
        </div>

        <button className="btn-action-primary" onClick={handleReturn}>
          <ArrowLeft size={16} /> Return to Authorized Workspaces
        </button>
      </div>
    </div>
  );
}
