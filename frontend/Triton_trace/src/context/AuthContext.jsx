import React, { createContext, useContext, useState, useMemo } from 'react';

export const ROLES = {
  PUBLIC: 'public',
  NORMAL: 'normal',
  ADMIN: 'admin',
  COMMERCIAL: 'commercial'
};

export const ROLE_DEFINITIONS = {
  normal: {
    id: 'normal',
    role: 'normal',
    title: 'Normal User',
    subtitle: 'Field Observer & Local Response',
    description: 'Submit field observation alerts, inspect historical incident archive, and utilize lightweight SAR classification.',
    badge: 'FIELD OBSERVER',
    accentColor: 'emerald'
  },
  admin: {
    id: 'admin',
    role: 'admin',
    title: 'Lead Investigator',
    subtitle: 'Maritime Police / Coast Guard / Port State Control',
    description: 'Full forensic intelligence: SAR segmentation, 12h Lagrangian hindcast, DBSCAN clustering, and AIS vessel attribution.',
    badge: 'LEAD INVESTIGATOR',
    accentColor: 'cyan'
  },
  commercial: {
    id: 'commercial',
    role: 'commercial',
    title: 'Commercial Operator',
    subtitle: 'Shipowner / Fleet / P&I Club',
    description: 'Trajectory consistency verification, P&I liability exposure calculation, and exoneration analytics.',
    badge: 'COMMERCIAL OPERATOR',
    accentColor: 'violet'
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(ROLES.PUBLIC);
  const [user, setUser] = useState(null);

  const login = (selectedRole, credentials = {}) => {
    if (!['normal', 'admin', 'commercial'].includes(selectedRole)) {
      console.error(`Invalid role: ${selectedRole}`);
      return false;
    }
    setRole(selectedRole);
    setUser({
      email: credentials.email || `${selectedRole}@tritontrace.io`,
      agency: credentials.agency || (selectedRole === 'admin' ? 'IT-COASTGUARD-PSC' : selectedRole === 'commercial' ? 'IMO-948271' : 'LOCAL-PATROL-04'),
      role: selectedRole,
      loginTimestamp: new Date().toISOString()
    });
    return true;
  };

  const logout = () => {
    setRole(ROLES.PUBLIC);
    setUser(null);
  };

  const value = useMemo(() => ({
    role,
    user,
    isAuthenticated: role !== ROLES.PUBLIC,
    login,
    logout,
    roleDefinition: ROLE_DEFINITIONS[role] || null
  }), [role, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
