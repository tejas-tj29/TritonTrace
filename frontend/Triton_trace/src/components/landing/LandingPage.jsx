import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { MapCanvas } from '../map/MapCanvas';

/**
 * LandingPage / Gateway Component
 * Renders the full-screen MapCanvas in the blurred gateway state,
 * with the 2-step AuthModal asking which role to select and routing to:
 * - /portal/normal
 * - /portal/admin
 * - /portal/commercial
 */
export const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();

  // If already authenticated with a specific role, redirect to that role's portal
  if (isAuthenticated && user?.role && user.role !== 'public') {
    return <Navigate to={`/portal/${user.role}`} replace />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Fullscreen MapCanvas behind blurred gateway */}
      <div className="absolute inset-0 z-0 filter blur-md brightness-60 scale-102 pointer-events-none">
        <MapCanvas interactive={false} />
      </div>

      {/* Centered 2-Step Auth Modal asking where to go (Role Select -> Credentials -> Route) */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <AuthModal isOpen={true} />
      </div>
    </div>
  );
};

export default LandingPage;
