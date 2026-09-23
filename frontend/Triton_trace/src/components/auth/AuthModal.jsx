import { useState } from 'react';
import { useAuth, ROLE_DEFINITIONS } from '../../context/AuthContext';
import { 
  ShieldAlert,  
  Eye, 
  Ship, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  Lock, 
  Building2, 
  Mail, 
  CheckCircle2, 
  Satellite, 
  AlertCircle 
} from 'lucide-react';

const ROLE_ICONS = {
  normal: Eye,
  admin: ShieldAlert,
  commercial: Ship
};

const DEFAULT_CREDENTIALS = {
  normal: {
    email: 'observer.malta@marine-patrol.org',
    password: '••••••••••••',
    agency: 'MED-PATROL-UNIT-07'
  },
  admin: {
    email: 'investigator.vassallo@coastguard.gov.mt',
    password: '••••••••••••',
    agency: 'IT-CG-FORENSIC-DIV-04'
  },
  commercial: {
    email: 'legal.claims@pacificmaritime.com',
    password: '••••••••••••',
    agency: 'IMO-9482914 / P&I-CLUB-UK'
  }
};

export const AuthModal = ({ isOpen = true, onClose }) => {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: Role Select, 2: Credentials
  const [selectedRole, setSelectedRole] = useState('admin');
  const [credentials, setCredentials] = useState({
    email: DEFAULT_CREDENTIALS.admin.email,
    password: 'password123',
    agency: DEFAULT_CREDENTIALS.admin.agency
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setCredentials({
      email: DEFAULT_CREDENTIALS[roleKey].email,
      password: 'password123',
      agency: DEFAULT_CREDENTIALS[roleKey].agency
    });
    setError('');
  };

  const handleNextStep = () => {
    if (!selectedRole) {
      setError('Please select an operational role.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.agency) {
      setError('Please provide all mandatory credential identifiers.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate realistic authorization handshake
    setTimeout(() => {
      const success = login(selectedRole, credentials);
      setIsSubmitting(false);
      if (success && onClose) {
        onClose();
      }
    }, 450);
  };

  const activeRoleDef = ROLE_DEFINITIONS[selectedRole];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Darkened overlay backdrop */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />

      {/* Glassmorphic Modal Box */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/85 p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all">
        {/* Top tactical telemetry strip */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
              <Satellite className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold tracking-widest text-cyan-400">TRITONTRACE</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">SECURE GATEWAY</span>
              </div>
              <h2 className="text-sm font-medium text-slate-200">Forensic Access Control & RBAC</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
              step === 1 ? 'border-amber-500/40 bg-amber-950/30 text-amber-300' : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
            }`}>
              STEP {step} / 2
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center space-x-2 rounded-md border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-100">Select Operational Role</h3>
              <p className="mt-1 text-xs text-slate-400">
                Choose domain authorization level. Permissions and available forensic tools will adapt accordingly.
              </p>
            </div>

            <div className="grid gap-3 pt-2">
              {Object.values(ROLE_DEFINITIONS).map((r) => {
                const IconComponent = ROLE_ICONS[r.id] || ShieldAlert;
                const isSelected = selectedRole === r.id;

                let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-900/50';
                if (isSelected) {
                  if (r.accentColor === 'cyan') borderStyle = 'border-cyan-400/80 bg-cyan-950/20 ring-1 ring-cyan-500/30';
                  else if (r.accentColor === 'emerald') borderStyle = 'border-emerald-400/80 bg-emerald-950/20 ring-1 ring-emerald-500/30';
                  else borderStyle = 'border-violet-400/80 bg-violet-950/20 ring-1 ring-violet-500/30';
                }

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`flex items-start space-x-4 rounded-lg border p-3.5 text-left transition-all duration-150 ${borderStyle}`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                      isSelected
                        ? r.accentColor === 'cyan'
                          ? 'border-cyan-500/60 bg-cyan-900/40 text-cyan-300'
                          : r.accentColor === 'emerald'
                          ? 'border-emerald-500/60 bg-emerald-900/40 text-emerald-300'
                          : 'border-violet-500/60 bg-violet-900/40 text-violet-300'
                        : 'border-slate-700 bg-slate-800/80 text-slate-400'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-100">{r.title}</span>
                        <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border ${
                          isSelected
                            ? r.accentColor === 'cyan'
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : r.accentColor === 'emerald'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {r.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium">{r.subtitle}</div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-400/90">{r.description}</p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className={`h-5 w-5 shrink-0 ${
                        r.accentColor === 'cyan' ? 'text-cyan-400' : r.accentColor === 'emerald' ? 'text-emerald-400' : 'text-violet-400'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center space-x-2 rounded-md bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 active:bg-cyan-600 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              >
                <span>Proceed to Credentials</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CREDENTIAL VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-100">Authenticate Credentials</h3>
                {/* Active Role Chip */}
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-medium border ${
                    activeRoleDef.accentColor === 'cyan'
                      ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                      : activeRoleDef.accentColor === 'emerald'
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      : 'border-violet-500/40 bg-violet-950/30 text-violet-300'
                  }`}>
                    <span>{activeRoleDef.title}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="text-[11px] text-cyan-400 underline hover:text-cyan-300"
                  >
                    Change
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Input organization authorization details. Client-side sandbox mock authentication is active.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Operator Identity / Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                    placeholder="operator@organization.gov"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Security Token / Passphrase
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                    placeholder="Enter security token"
                  />
                </div>
              </div>

              {/* Agency / IMO Identifier */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Agency Code / IMO Fleet Identifier
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={credentials.agency}
                    onChange={(e) => setCredentials({ ...credentials, agency: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                    placeholder="e.g. IT-CG-FORENSIC-04 or IMO-918234"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center space-x-1.5 rounded-md px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 rounded-md bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              >
                <KeyRound className="h-4 w-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Authenticate & Enter Portal'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
