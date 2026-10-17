import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { DEMO_USER, DEMO_PASSWORD } from '../data/users.js';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => v.replace(/\D/g, '').length >= 8;

export default function LoginPage() {
  useDocumentTitle('Log in');
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from || '/dashboard';
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.identifier.trim()) e.identifier = 'Enter your email or phone number.';
    else if (!isEmail(form.identifier.trim()) && !isPhone(form.identifier)) e.identifier = 'Enter a valid email address or a phone number with at least 8 digits.';
    if (!form.password) e.password = 'Enter your password.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFormError('');
    if (!validate()) return;
    setBusy(true);
    try { await login(form); navigate(dest, { replace: true }); } catch (err) { setFormError(err.message); } finally { setBusy(false); }
  };
  const demo = async () => { setBusy(true); setFormError(''); try { await loginDemo(); navigate(dest, { replace: true }); } catch (err) { setFormError(err.message); } finally { setBusy(false); } };

  return (
    <AuthLayout title="Log in" intro="Welcome back. Pick up where your supply chain left off." footer={<>New to EcoTrace? <Link to="/signup">Create an account</Link></>}>
      {location.state?.from && <p className="meta" role="status">Log in to continue to {location.state.from}.</p>}
      {formError && <div className="alert-t alert-t--danger" role="alert">{formError}</div>}
      <form onSubmit={submit} noValidate>
        <FormField label="Email or phone" name="identifier" autoComplete="username" value={form.identifier} onChange={set('identifier')} error={errors.identifier} required />
        <FormField label="Password" type="password" name="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} required />
        <button className="btn btn-primary w-100 mt-2" disabled={busy}>{busy ? 'Logging in' : 'Log in'}</button>
      </form>
      <div className="or"><span>or</span></div>
      <button className="btn btn-outline-primary w-100" onClick={demo} disabled={busy}>Use demo account</button>
      <div className="cred" aria-label="Demo credentials">
        <p className="cred__title">Demo credentials</p>
        <dl className="cred__list">
          <div><dt>Email</dt><dd className="mono">{DEMO_USER.email}</dd></div>
          <div><dt>Password</dt><dd className="mono">{DEMO_PASSWORD}</dd></div>
        </dl>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setForm({ identifier: DEMO_USER.email, password: DEMO_PASSWORD }); setErrors({}); }}>Fill in the form</button>
        <p className="meta mb-0 mt-2">Or <Link to="/signup">register your own account</Link>. It is kept only in this browser.</p>
      </div>
    </AuthLayout>
  );
}
