import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaCheck } from 'react-icons/fa';
import api from '../api';

export default function Register({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email, password, full_name: fullName });
      const token = res.data.session?.access_token;

      if (!token) {
        toast.success('Check your email to confirm your account, then log in.');
        navigate('/login');
        return;
      }

      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      toast.success('Account created! Complete your profile to get started.');
      navigate('/profile-setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Try another email.');
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    'Multi-currency savings tracking',
    'FIRE retirement projections',
    'Expat-optimized financial tools',
  ];

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      <div style={styles.wrapper}>
        <div style={styles.leftPanel}>
          <div style={styles.brand}>
            <div style={styles.logoRing}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="#F5C542" strokeWidth="1.5" fill="none"/>
                <path d="M14 7L20 10.5V17.5L14 21L8 17.5V10.5L14 7Z" fill="#F5C542" fillOpacity="0.15" stroke="#F5C542" strokeWidth="1"/>
                <circle cx="14" cy="14" r="3" fill="#F5C542"/>
              </svg>
            </div>
            <h1 style={styles.logoText}>fire<span style={styles.logoAccent}>-expat</span></h1>
          </div>

          <div style={styles.leftContent}>
            <h2 style={styles.leftHeading}>Your path to financial independence starts here.</h2>
            <p style={styles.leftSub}>Built for expatriates navigating multi-currency wealth building and early retirement.</p>

            <div style={styles.perkList}>
              {perks.map((p) => (
                <div key={p} style={styles.perkItem}>
                  <div style={styles.perkIcon}><FaCheck style={{ fontSize: 10, color: '#0a0d14' }} /></div>
                  <span style={styles.perkText}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.statRow}>
            {[['FIRE', 'Calculator'], ['Multi', 'Currency'], ['Real-time', 'Rates']].map(([v, l]) => (
              <div key={l} style={styles.stat}>
                <span style={styles.statVal}>{v}</span>
                <span style={styles.statLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.heading}>Create Account</h2>
          <p style={styles.subheading}>Join thousands of expats tracking their FIRE journey</p>

          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={{ ...styles.inputWrapper, ...(focused === 'name' ? styles.inputWrapperFocused : {}) }}>
                <FaUser style={styles.inputIcon} />
                <input
                  type="text"
                  style={styles.input}
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={{ ...styles.inputWrapper, ...(focused === 'email' ? styles.inputWrapperFocused : {}) }}>
                <FaEnvelope style={styles.inputIcon} />
                <input
                  type="email"
                  style={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={{ ...styles.inputWrapper, ...(focused === 'password' ? styles.inputWrapperFocused : {}) }}>
                <FaLock style={styles.inputIcon} />
                <input
                  type="password"
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
              {password.length > 0 && password.length < 6 && (
                <p style={styles.hint}>Password must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
            >
              <span style={styles.btnContent}>
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <FaArrowRight style={{ fontSize: 13 }} />}
              </span>
            </button>
          </form>

          <p style={styles.terms}>
            By registering, you agree to our{' '}
            <span style={styles.link}>Terms of Service</span> and{' '}
            <span style={styles.link}>Privacy Policy</span>
          </p>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>already a member?</span>
            <span style={styles.dividerLine} />
          </div>

          <Link to="/login" style={styles.secondaryBtn}>
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0d14',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(245,197,66,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,197,66,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  glowOrb1: {
    position: 'absolute',
    top: '-10%', right: '-5%',
    width: 500, height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,197,66,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-10%', left: '-5%',
    width: 400, height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  wrapper: {
    position: 'relative',
    display: 'flex',
    gap: 0,
    width: '100%',
    maxWidth: 860,
    borderRadius: 20,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(160deg, #0f1420 0%, #0a0d14 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    padding: '36px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minWidth: 280,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  logoRing: {
    width: 46, height: 46,
    borderRadius: 12,
    background: 'rgba(245,197,66,0.08)',
    border: '1px solid rgba(245,197,66,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 20, fontWeight: 800,
    color: '#f0f0f0', margin: 0, letterSpacing: '-0.5px',
  },
  logoAccent: { color: '#F5C542' },
  leftContent: { flex: 1 },
  leftHeading: {
    fontSize: 22, fontWeight: 700, color: '#f0f0f0',
    lineHeight: 1.35, margin: '0 0 12px 0', letterSpacing: '-0.3px',
  },
  leftSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.4)',
    lineHeight: 1.6, margin: '0 0 32px 0',
  },
  perkList: { display: 'flex', flexDirection: 'column', gap: 14 },
  perkItem: { display: 'flex', alignItems: 'center', gap: 12 },
  perkIcon: {
    width: 22, height: 22, borderRadius: '50%',
    background: '#F5C542', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  perkText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  statRow: {
    display: 'flex', gap: 0, marginTop: 40,
    borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24,
  },
  stat: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 4,
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  statVal: { fontSize: 14, fontWeight: 700, color: '#F5C542' },
  statLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  card: {
    flex: 1,
    background: 'rgba(255,255,255,0.025)',
    padding: '36px 32px',
    backdropFilter: 'blur(20px)',
  },
  heading: {
    fontSize: 24, fontWeight: 700, color: '#f0f0f0',
    margin: '0 0 4px 0', letterSpacing: '-0.3px',
  },
  subheading: {
    fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 28px 0',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: {
    fontSize: 11, fontWeight: 600,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.6px', textTransform: 'uppercase',
  },
  inputWrapper: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '0 14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(245,197,66,0.5)',
    boxShadow: '0 0 0 3px rgba(245,197,66,0.08)',
  },
  inputIcon: { color: 'rgba(255,255,255,0.2)', fontSize: 13, flexShrink: 0 },
  input: {
    flex: 1, background: 'transparent', border: 'none',
    outline: 'none', color: '#f0f0f0', fontSize: 14,
    padding: '13px 0', fontFamily: "'DM Sans', sans-serif",
  },
  hint: { fontSize: 11, color: '#ef4444', margin: '2px 0 0 0' },
  btn: {
    marginTop: 4,
    background: 'linear-gradient(135deg, #F5C542 0%, #e6a817 100%)',
    color: '#0a0d14', border: 'none', borderRadius: 10,
    padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(245,197,66,0.3)',
    fontFamily: "'DM Sans', sans-serif",
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  btnContent: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  terms: {
    marginTop: 14, fontSize: 11,
    color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.6,
  },
  link: { color: '#F5C542', cursor: 'pointer' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' },
  dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' },
  dividerText: {
    fontSize: 11, color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
  },
  secondaryBtn: {
    display: 'block', textAlign: 'center',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '13px', fontSize: 14,
    fontWeight: 600, color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
  },
};