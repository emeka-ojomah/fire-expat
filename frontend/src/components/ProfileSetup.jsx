import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'AED', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

const STEPS = [
  { id: 1, label: 'Identity', title: 'Who are you?', sub: 'Tell us your name and preferred currency' },
  { id: 2, label: 'Finances', title: 'Your finances', sub: 'Current savings and monthly expenses' },
  { id: 3, label: 'FIRE Goal', title: 'Retirement goal', sub: 'Set your FIRE targets and return expectations' },
];

export default function ProfileSetup({ onProfileComplete }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    full_name: '',
    base_currency: 'USD',
    monthly_expenses: '',
    current_savings: '',
    expected_return: '7.0',
    target_retirement_age: '60',
  });
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const navigate = useNavigate();

  // Check if profile already exists
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data && res.data.full_name) {
          // Profile already complete — pre-fill and let them edit
          setProfile({
            full_name: res.data.full_name || '',
            base_currency: res.data.base_currency || 'USD',
            monthly_expenses: res.data.monthly_expenses?.toString() || '',
            current_savings: res.data.current_savings?.toString() || '',
            expected_return: res.data.expected_return?.toString() || '7.0',
            target_retirement_age: res.data.target_retirement_age?.toString() || '60',
          });
        }
      } catch (err) {
        console.log('No existing profile, starting fresh');
      } finally {
        setCheckingProfile(false);
      }
    };
    checkProfile();
  }, []);

  const update = (key, value) => setProfile(prev => ({ ...prev, [key]: value }));

  const validateStep = () => {
    if (step === 1) {
      if (!profile.full_name.trim()) { toast.error('Please enter your full name'); return false; }
      if (!profile.base_currency) { toast.error('Please select a currency'); return false; }
    }
    if (step === 2) {
      if (!profile.monthly_expenses || isNaN(profile.monthly_expenses)) { toast.error('Enter valid monthly expenses'); return false; }
      if (!profile.current_savings || isNaN(profile.current_savings)) { toast.error('Enter valid current savings'); return false; }
    }
    if (step === 3) {
      if (!profile.expected_return || isNaN(profile.expected_return)) { toast.error('Enter valid expected return'); return false; }
      if (!profile.target_retirement_age || isNaN(profile.target_retirement_age)) { toast.error('Enter valid retirement age'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await api.put('/profile', {
        full_name: profile.full_name,
        base_currency: profile.base_currency,
        monthly_expenses: parseFloat(profile.monthly_expenses),
        current_savings: parseFloat(profile.current_savings),
        expected_return: parseFloat(profile.expected_return),
        target_retirement_age: parseInt(profile.target_retirement_age),
      });
      toast.success('Profile saved! Welcome to fire-expat.');
      if (onProfileComplete) onProfileComplete();
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FIRE quick calc preview
  const fireTarget = profile.monthly_expenses
    ? (parseFloat(profile.monthly_expenses) * 12 * 25).toLocaleString(undefined, { maximumFractionDigits: 0 })
    : null;

  if (checkingProfile) {
    return (
      <div style={styles.page}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading your profile...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />
      <div style={styles.glowOrb} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.brand}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="#F5C542" strokeWidth="1.5" fill="none"/>
              <circle cx="14" cy="14" r="3" fill="#F5C542"/>
            </svg>
            <span style={styles.logoText}>fire<span style={styles.logoAccent}>-expat</span></span>
          </div>
          <p style={styles.headerSub}>Profile Setup — Step {step} of 3</p>
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${(step / 3) * 100}%` }} />
        </div>

        {/* Step pills */}
        <div style={styles.stepPills}>
          {STEPS.map(s => (
            <div key={s.id} style={styles.pill}>
              <div style={{
                ...styles.pillDot,
                ...(step > s.id ? styles.pillDotDone : {}),
                ...(step === s.id ? styles.pillDotActive : {}),
              }}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span style={{
                ...styles.pillLabel,
                ...(step === s.id ? styles.pillLabelActive : {}),
              }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={styles.card}>
          <div style={styles.stepHeader}>
            <h2 style={styles.stepTitle}>{STEPS[step - 1].title}</h2>
            <p style={styles.stepSub}>{STEPS[step - 1].sub}</p>
          </div>

          <div style={styles.divider} />

          {/* Step 1 */}
          {step === 1 && (
            <div style={styles.fields}>
              <Field label="Full Name" hint="As you'd like to be addressed">
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Kuro Adeleke"
                  value={profile.full_name}
                  onChange={e => update('full_name', e.target.value)}
                />
              </Field>

              <Field label="Base Currency" hint="All values will be converted to this currency">
                <select
                  style={styles.input}
                  value={profile.base_currency}
                  onChange={e => update('base_currency', e.target.value)}
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c} style={{ background: '#0f1420' }}>{c}</option>
                  ))}
                </select>
              </Field>

              <div style={styles.infoBox}>
                <span style={styles.infoIcon}>💡</span>
                <span style={styles.infoText}>
                  Your base currency is used to unify all multi-currency transactions into one consistent view.
                </span>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={styles.fields}>
              <Field label={`Current Savings (${profile.base_currency})`} hint="Total savings you have right now">
                <input
                  style={styles.input}
                  type="number"
                  step="any"
                  placeholder="e.g. 5000"
                  value={profile.current_savings}
                  onChange={e => update('current_savings', e.target.value)}
                />
              </Field>

              <Field label={`Monthly Expenses (${profile.base_currency})`} hint="Average total monthly spending">
                <input
                  style={styles.input}
                  type="number"
                  step="any"
                  placeholder="e.g. 1500"
                  value={profile.monthly_expenses}
                  onChange={e => update('monthly_expenses', e.target.value)}
                />
              </Field>

              {fireTarget && (
                <div style={styles.firePreview}>
                  <div style={styles.firePreviewLabel}>Your FIRE Target (25x Rule)</div>
                  <div style={styles.firePreviewValue}>{profile.base_currency} {fireTarget}</div>
                  <div style={styles.firePreviewSub}>Based on your monthly expenses × 12 × 25</div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div style={styles.fields}>
              <Field label="Expected Annual Return (%)" hint="Typical market average is 7% (inflation-adjusted)">
                <div style={styles.sliderWrapper}>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    placeholder="7.0"
                    value={profile.expected_return}
                    onChange={e => update('expected_return', e.target.value)}
                  />
                  <div style={styles.returnBadge}>{profile.expected_return}% p.a.</div>
                </div>
              </Field>

              <Field label="Target Retirement Age" hint="The age at which you want to reach financial independence">
                <div style={styles.sliderWrapper}>
                  <input
                    style={styles.input}
                    type="number"
                    min="30"
                    max="80"
                    placeholder="60"
                    value={profile.target_retirement_age}
                    onChange={e => update('target_retirement_age', e.target.value)}
                  />
                  <div style={styles.ageBadge}>Age {profile.target_retirement_age}</div>
                </div>
              </Field>

              {/* Summary */}
              <div style={styles.summaryBox}>
                <div style={styles.summaryTitle}>Profile Summary</div>
                <div style={styles.summaryGrid}>
                  {[
                    ['Name', profile.full_name || '—'],
                    ['Currency', profile.base_currency],
                    ['Savings', `${profile.base_currency} ${parseFloat(profile.current_savings || 0).toLocaleString()}`],
                    ['Monthly Expenses', `${profile.base_currency} ${parseFloat(profile.monthly_expenses || 0).toLocaleString()}`],
                    ['FIRE Target', `${profile.base_currency} ${fireTarget || '—'}`],
                    ['Retire at', `Age ${profile.target_retirement_age}`],
                  ].map(([k, v]) => (
                    <div key={k} style={styles.summaryRow}>
                      <span style={styles.summaryKey}>{k}</span>
                      <span style={styles.summaryVal}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={styles.nav}>
            {step > 1 && (
              <button onClick={prevStep} style={styles.backBtn}>← Back</button>
            )}
            {step < 3 ? (
              <button onClick={nextStep} style={styles.nextBtn}>
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ ...styles.submitBtn, ...(loading ? styles.btnDisabled : {}) }}
              >
                {loading ? 'Saving...' : '🚀 Launch My Dashboard'}
              </button>
            )}
          </div>
        </div>

        <p style={styles.footerNote}>
          You can update these settings anytime from your profile page.
        </p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={fieldStyles.label}>{label}</label>
      {children}
      {hint && <span style={fieldStyles.hint}>{hint}</span>}
    </div>
  );
}

const fieldStyles = {
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
  },
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0d14',
    padding: '32px 16px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(245,197,66,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,197,66,0.025) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  glowOrb: {
    position: 'absolute',
    top: '-15%', right: '-10%',
    width: 600, height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,197,66,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 560,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 800,
    color: '#f0f0f0',
    letterSpacing: '-0.5px',
  },
  logoAccent: { color: '#F5C542' },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
  progressTrack: {
    height: 3,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #F5C542, #e6a817)',
    borderRadius: 2,
    transition: 'width 0.4s ease',
  },
  stepPills: {
    display: 'flex',
    gap: 0,
    justifyContent: 'space-between',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  pillDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.3)',
    transition: 'all 0.3s',
  },
  pillDotActive: {
    background: 'rgba(245,197,66,0.15)',
    border: '1px solid rgba(245,197,66,0.5)',
    color: '#F5C542',
  },
  pillDotDone: {
    background: '#F5C542',
    border: '1px solid #F5C542',
    color: '#0a0d14',
  },
  pillLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: 500,
  },
  pillLabelActive: {
    color: '#F5C542',
    fontWeight: 600,
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: '32px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  },
  stepHeader: { marginBottom: 20 },
  stepTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f0f0f0',
    margin: '0 0 4px 0',
    letterSpacing: '-0.3px',
  },
  stepSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    margin: 0,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    marginBottom: 24,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '13px 14px',
    color: '#f0f0f0',
    fontSize: 14,
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  infoBox: {
    display: 'flex',
    gap: 10,
    background: 'rgba(245,197,66,0.06)',
    border: '1px solid rgba(245,197,66,0.15)',
    borderRadius: 10,
    padding: '12px 14px',
    alignItems: 'flex-start',
  },
  infoIcon: { fontSize: 14, flexShrink: 0 },
  infoText: { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 },
  firePreview: {
    background: 'linear-gradient(135deg, rgba(245,197,66,0.08) 0%, rgba(230,168,23,0.04) 100%)',
    border: '1px solid rgba(245,197,66,0.2)',
    borderRadius: 12,
    padding: '16px 18px',
    textAlign: 'center',
  },
  firePreviewLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: 8,
  },
  firePreviewValue: {
    fontSize: 28,
    fontWeight: 800,
    color: '#F5C542',
    letterSpacing: '-0.5px',
  },
  firePreviewSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 6,
  },
  sliderWrapper: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  returnBadge: {
    flexShrink: 0,
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.25)',
    color: '#10b981',
    borderRadius: 8,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  ageBadge: {
    flexShrink: 0,
    background: 'rgba(245,197,66,0.1)',
    border: '1px solid rgba(245,197,66,0.25)',
    color: '#F5C542',
    borderRadius: 8,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  summaryBox: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '18px',
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: 14,
  },
  summaryGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryKey: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: 600,
    color: '#f0f0f0',
  },
  nav: {
    display: 'flex',
    gap: 12,
    marginTop: 28,
    justifyContent: 'flex-end',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '12px 20px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  nextBtn: {
    background: 'rgba(245,197,66,0.1)',
    border: '1px solid rgba(245,197,66,0.3)',
    borderRadius: 10,
    padding: '12px 24px',
    color: '#F5C542',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #F5C542 0%, #e6a817 100%)',
    border: 'none',
    borderRadius: 10,
    padding: '12px 28px',
    color: '#0a0d14',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(245,197,66,0.3)',
    fontFamily: "'DM Sans', sans-serif",
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
  },
};
