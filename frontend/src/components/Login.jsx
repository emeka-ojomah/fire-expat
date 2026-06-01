import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import api from '../api';

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.session?.access_token;

      if (!token) {
        toast.error('Login failed: no session returned.');
        return;
      }

      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.logoRing}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="#F5C542" strokeWidth="1.5" fill="none"/>
              <path d="M14 7L20 10.5V17.5L14 21L8 17.5V10.5L14 7Z" fill="#F5C542" fillOpacity="0.15" stroke="#F5C542" strokeWidth="1"/>
              <circle cx="14" cy="14" r="3" fill="#F5C542"/>
            </svg>
          </div>
          <div>
            <h1 style={styles.logoText}>fire<span style={styles.logoAccent}>-expat</span></h1>
            <p style={styles.logoSub}>Financial Independence · Retire Early</p>
          </div>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.heading}>Sign In</h2>
        <p style={styles.subheading}>Access your financial command center</p>

        <form onSubmit={handleLogin} style={styles.form}>
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
          >
            {loading ? (
              <span style={styles.btnContent}>
                <span style={styles.spinner} /> Authenticating...
              </span>
            ) : (
              <span style={styles.btnContent}>
                Sign In <FaArrowRight style={{ fontSize: 13 }} />
              </span>
            )}
          </button>
        </form>

        <p style={styles.switchText}>
          No account?{' '}
          <Link to="/register" style={styles.link}>Create one free</Link>
        </p>

        <div style={styles.badges}>
          {['Multi-currency', 'FIRE Calculator', 'Expat-focused'].map(b => (
            <span key={b} style={styles.badge}>{b}</span>
          ))}
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
    top: '-10%',
    right: '-5%',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,197,66,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-5%',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 420,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '36px 32px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  logoRing: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'rgba(245,197,66,0.08)',
    border: '1px solid rgba(245,197,66,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 800,
    color: '#f0f0f0',
    margin: 0,
    letterSpacing: '-0.5px',
    fontFamily: "'DM Sans', sans-serif",
  },
  logoAccent: { color: '#F5C542' },
  logoSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    margin: '2px 0 0 0',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
    marginBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: 700,
    color: '#f0f0f0',
    margin: '0 0 4px 0',
    letterSpacing: '-0.3px',
  },
  subheading: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    margin: '0 0 28px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '0 14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(245,197,66,0.5)',
    boxShadow: '0 0 0 3px rgba(245,197,66,0.08)',
  },
  inputIcon: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 13,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f0f0f0',
    fontSize: 14,
    padding: '13px 0',
    fontFamily: "'DM Sans', sans-serif",
  },
  btn: {
    marginTop: 6,
    background: 'linear-gradient(135deg, #F5C542 0%, #e6a817 100%)',
    color: '#0a0d14',
    border: 'none',
    borderRadius: 10,
    padding: '14px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
    boxShadow: '0 4px 24px rgba(245,197,66,0.3)',
    fontFamily: "'DM Sans', sans-serif",
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    display: 'inline-block',
    width: 14,
    height: 14,
    border: '2px solid rgba(10,13,20,0.3)',
    borderTopColor: '#0a0d14',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  switchText: {
    marginTop: 22,
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
  link: {
    color: '#F5C542',
    fontWeight: 600,
    textDecoration: 'none',
  },
  badges: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '3px 10px',
    letterSpacing: '0.3px',
  },
};