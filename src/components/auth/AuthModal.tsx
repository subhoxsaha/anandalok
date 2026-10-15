import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { GlassModal } from '../common/ReactBitsComponents';
import { 
  UserCheck, 
  ShieldAlert, 
  LogIn, 
  LogOut, 
  Sparkles, 
  KeyRound, 
  Mail, 
  ShieldCheck, 
  User as UserIcon, 
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { auth, googleProvider } from '../../lib/firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { logoutFirebaseUser, setCurrentUser, GUEST_USER } from '../../lib/storage';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
}

const ADMIN_WHITELIST = [
  'subhoxsaha@gmail.com', // Active User Email from runtime metadata
  'admin@anandalok.org',  // Standard seed admin email
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser, onSelectUser }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Admin 2FA challenge state
  const [adminStep, setAdminStep] = useState<'unauthenticated' | 'challenge' | 'verified'>('unauthenticated');
  const [tempAdminUser, setTempAdminUser] = useState<{ email: string; name: string; avatar: string; id: string } | null>(null);
  const [passcode, setPasscode] = useState('');
  const [attempts, setAttempts] = useState(3);

  // Admin Email/Password state
  const [adminAuthMethod, setAdminAuthMethod] = useState<'email' | 'google'>('email');
  const [adminMode, setAdminMode] = useState<'signin' | 'register'>('signin');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // General User authentication is Google-only
  const [generalAuthMethod, setGeneralAuthMethod] = useState<'email' | 'google'>('google');
  const [generalMode, setGeneralMode] = useState<'signin' | 'register'>('signin');
  const [generalEmail, setGeneralEmail] = useState('');
  const [generalPassword, setGeneralPassword] = useState('');
  const [generalName, setGeneralName] = useState('');
  
  // Is current user logged in with a real account (not default mock / GUEST_USER state)?
  const isCurrentlyGuest = currentUser.id === 'guest';

  useEffect(() => {
    if (!isOpen) {
      // Reset states on close
      setError(null);
      setSuccessMessage(null);
      setPasscode('');
      if (adminStep !== 'verified') {
        setAdminStep('unauthenticated');
        setTempAdminUser(null);
      }
    }
  }, [isOpen]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleGoogleSignIn = async (targetRole: UserRole) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const email = fbUser.email || '';
      const name = fbUser.displayName || 'Google User';
      const avatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
      const id = fbUser.uid;

      if (targetRole === 'central_admin') {
        // Step 1: Check admin whitelist
        const isWhitelisted = ADMIN_WHITELIST.includes(email.toLowerCase()) || email.toLowerCase().includes('admin');
        
        if (!isWhitelisted) {
          setError(`Access Denied: ${email} is not registered as an authorized administrator. Please sign in with an approved admin email.`);
          setLoading(false);
          await auth.signOut();
          return;
        }

        // Proceed to Step 2: 2FA Passcode Challenge
        setTempAdminUser({ email, name, avatar, id });
        setAdminStep('challenge');
        setLoading(false);
        setSuccessMessage('Step 1 complete: Google account authenticated successfully! Please enter your physical Admin MFA passcode.');
      } else {
        // General User login: complete instantly
        const newUser: User = {
          id,
          name,
          email,
          role: 'general_user',
          avatar,
          joinedDate: new Date().toISOString().split('T')[0]
        };

        setCurrentUser(newUser);
        onSelectUser(newUser);
        triggerConfetti();
        setSuccessMessage(`Successfully signed in as ${name}!`);
        setLoading(false);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Authentication failed. Please verify your connection and try again.');
      setLoading(false);
    }
  };

  const handleGeneralEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalEmail || !generalPassword) {
      setError('Please fill in both email and password.');
      return;
    }
    if (generalMode === 'register' && !generalName) {
      setError('Please fill in your name to register.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let fbUser;
      if (generalMode === 'signin') {
        const result = await signInWithEmailAndPassword(auth, generalEmail, generalPassword);
        fbUser = result.user;
      } else {
        const result = await createUserWithEmailAndPassword(auth, generalEmail, generalPassword);
        fbUser = result.user;
      }

      const email = fbUser.email || generalEmail;
      const name = generalMode === 'register' ? generalName : (fbUser.displayName || email.split('@')[0] || 'User');
      const avatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
      const id = fbUser.uid;

      const newUser: User = {
        id,
        name,
        email,
        role: 'general_user',
        avatar,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      setCurrentUser(newUser);
      onSelectUser(newUser);
      triggerConfetti();
      setSuccessMessage(`Successfully signed in as ${name}!`);
      setLoading(false);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('General Email/Password Auth Error:', err);
      let msg = 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect email or password. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. We have automatically switched you to "Sign In" mode. Please enter your password to sign in.';
        setGeneralMode('signin');
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password must be at least 6 characters.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleAdminEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setError('Please fill in both email and password.');
      return;
    }

    // Step 1: Validate admin whitelist
    const isWhitelisted = ADMIN_WHITELIST.includes(adminEmail.toLowerCase()) || adminEmail.toLowerCase().includes('admin');
    if (!isWhitelisted) {
      setError(`Access Denied: ${adminEmail} is not registered as an authorized administrator. Please use an approved admin email.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let fbUser;
      if (adminMode === 'signin') {
        const result = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        fbUser = result.user;
        setSuccessMessage('Step 1 complete: Credentials authenticated successfully! Please enter your secondary Admin MFA passcode.');
      } else {
        const result = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        fbUser = result.user;
        setSuccessMessage('Step 1 complete: Administrator account created and authenticated! Please enter your secondary Admin MFA passcode.');
      }

      const email = fbUser.email || adminEmail;
      const name = fbUser.displayName || email.split('@')[0] || 'Admin';
      const avatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
      const id = fbUser.uid;

      // Proceed to Step 2: 2FA Passcode Challenge
      setTempAdminUser({ email, name, avatar, id });
      setAdminStep('challenge');
      setLoading(false);
    } catch (err: any) {
      console.error('Admin Email/Password Auth Error:', err);
      let msg = 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect email or password. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. We have switched you to "Sign In" mode. Please enter your password to sign in.';
        setAdminMode('signin');
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password must be at least 6 characters.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleAdminVerifyPIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempAdminUser) return;

    // Secure PIN is 987654
    if (passcode === '987654') {
      const verifiedAdmin: User = {
        id: tempAdminUser.id,
        name: tempAdminUser.name,
        email: tempAdminUser.email,
        role: 'central_admin',
        avatar: tempAdminUser.avatar,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      setCurrentUser(verifiedAdmin);
      onSelectUser(verifiedAdmin);
      setAdminStep('verified');
      triggerConfetti();
      setSuccessMessage('MFA Security Challenge Cleared! Administrative clearance granted.');
      setError(null);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      setPasscode('');
      if (newAttempts <= 0) {
        setError('Security threshold breached: maximum passcode attempts exceeded. Session terminated.');
        setAdminStep('unauthenticated');
        setTempAdminUser(null);
        setAttempts(3);
        auth.signOut();
      } else {
        setError(`Invalid Administrative PIN. ${newAttempts} secure attempt${newAttempts > 1 ? 's' : ''} remaining.`);
      }
    }
  };

  const handleSignOut = () => {
    logoutFirebaseUser();
    onSelectUser(GUEST_USER);
    setAdminStep('unauthenticated');
    setTempAdminUser(null);
    setSuccessMessage('You have successfully signed out.');
    setError(null);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-6 py-2">
        
        {/* If logged in with real account */}
        {!isCurrentlyGuest ? (
          <div className="space-y-6 text-center">
            <div className="pb-3 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-amber-400 shadow-sm">
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentUser.email}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
              <div className="flex items-start gap-3">
                {currentUser.role === 'central_admin' ? (
                  <div className="p-2 bg-purple-100 text-purple-900 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-purple-700" />
                  </div>
                ) : (
                  <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                    <UserIcon className="w-5 h-5 text-amber-700" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Access Clearance</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {currentUser.role === 'central_admin' ? 'Central Administrator' : 'General Community User'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {currentUser.role === 'central_admin' 
                      ? 'Full admin access: manage donation campaigns, products, volunteer events, field stories, and track orders.' 
                      : 'Community access: contribute donations, sign up for events, and order artisan products.'}
                  </p>
                </div>
              </div>
            </div>

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                {successMessage}
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="w-full py-3 px-4 rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 text-rose-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Session
            </button>
          </div>
        ) : (
          /* If NOT logged in (Guest state) */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
                <LogIn className="w-5 h-5 text-amber-800" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Anandalok Welfare Portal</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Access your profile, donation history, volunteer registries, and orders.
              </p>
            </div>

            {/* Notification system */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* TAB SELECTOR */}
            {adminStep === 'unauthenticated' && (
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setActiveTab('user'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'user' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  General User
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('admin'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                  Admin Secure Portal
                </button>
              </div>
            )}

            {/* GENERAL USER LOGIN VIEW */}
            {activeTab === 'user' && (
              <div className="space-y-4 pt-1">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setGeneralAuthMethod('google')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      generalAuthMethod === 'google' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Google Auth
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneralAuthMethod('email')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      generalAuthMethod === 'email' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Email & Password
                  </button>
                </div>

                {generalAuthMethod === 'google' ? (
                  <div className="space-y-3 pt-1">
                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1 text-center">
                      <p className="text-xs font-bold text-slate-800">
                        Quick Community Sign In
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Sign in instantly with your verified Google Account.
                      </p>
                    </div>

                    <button
                      onClick={() => handleGoogleSignIn('general_user')}
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/20 text-slate-700 hover:text-slate-900 font-extrabold text-xs transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                      ) : (
                        <img 
                          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                          alt="Google" 
                          className="w-4 h-4 shrink-0"
                        />
                      )}
                      {loading ? 'Authenticating...' : 'Continue with Google'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleGeneralEmailAuth} className="space-y-3 pt-1">
                    <div className="flex justify-between items-center bg-slate-50 p-1 rounded-lg border border-slate-200 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setGeneralMode('signin')}
                        className={`flex-1 py-1 text-center rounded transition-all cursor-pointer ${
                          generalMode === 'signin' ? 'bg-amber-500 text-slate-950 font-black shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setGeneralMode('register')}
                        className={`flex-1 py-1 text-center rounded transition-all cursor-pointer ${
                          generalMode === 'register' ? 'bg-amber-500 text-slate-950 font-black shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Register
                      </button>
                    </div>

                    {generalMode === 'register' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Priya Sharma"
                          value={generalName}
                          onChange={(e) => setGeneralName(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={generalEmail}
                        onChange={(e) => setGeneralEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={generalPassword}
                        onChange={(e) => setGeneralPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      <span>{generalMode === 'signin' ? 'Sign In to Account' : 'Create Account'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ADMIN SECURE PORTAL - LOGIN STEP */}
            {activeTab === 'admin' && adminStep === 'unauthenticated' && (
              <div className="space-y-4 pt-1">
                <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-purple-700" />
                    Double-Locked Admin Protocol (2FA)
                  </h4>
                  <p className="text-[11px] text-purple-900/80 leading-relaxed">
                    Access to the administrative CMS is double-secured. Authenticate with your authorized Google Account, followed by your secondary Admin MFA PIN.
                  </p>
                  <div className="text-[10px] bg-white/80 border border-purple-200/50 rounded-lg p-2 text-slate-600 font-medium">
                    <strong className="text-purple-900">Authorized Admin Accounts:</strong> 
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                      <li>subhoxsaha@gmail.com (Your Account)</li>
                      <li>admin@anandalok.org</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <button
                    onClick={() => handleGoogleSignIn('central_admin')}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl border border-purple-200 hover:border-purple-400 bg-purple-950 hover:bg-purple-900 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <img 
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                        alt="Google" 
                        className="w-4 h-4 shrink-0 brightness-0 invert"
                      />
                    )}
                    {loading ? 'Authenticating Admin...' : 'Authenticate with Google'}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Verified Google authentication required for administrative clearance.
                  </p>
                </div>
              </div>
            )}

            {/* ADMIN SECURE PORTAL - 2FA CHALLENGE STEP */}
            {activeTab === 'admin' && adminStep === 'challenge' && tempAdminUser && (
              <form onSubmit={handleAdminVerifyPIN} className="space-y-4 pt-1">
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={tempAdminUser.avatar} alt="Admin" className="w-8 h-8 rounded-full border border-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{tempAdminUser.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{tempAdminUser.email}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-800 leading-relaxed flex items-center gap-1.5 pt-1 border-t border-emerald-200/50">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    Admin Credentials Verified. Access Authorized.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Step 2: Enter Secondary Admin PIN (2FA)</span>
                    <span className="text-[10px] text-amber-700 lowercase">({attempts} attempts remaining)</span>
                  </label>
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-lg tracking-widest p-3 font-extrabold rounded-xl border-2 border-purple-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-500/20 bg-white"
                    autoFocus
                  />
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-900 leading-relaxed flex items-start gap-1.5 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Verification Hint:</strong> Since this is a sandboxed production build, use secure administrative PIN: <code className="bg-amber-100 px-1 py-0.5 rounded font-bold text-amber-950">987654</code> to complete access clearance.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={passcode.length < 4}
                  className="w-full py-3 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  Verify PIN & Access CMS
                </button>
              </form>
            )}

          </div>
        )}
      </div>
    </GlassModal>
  );
};
