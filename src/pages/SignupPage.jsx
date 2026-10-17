import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { FormField } from '../components/common/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function SignupPage() {
  useDocumentTitle('Create account');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', businessName: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your full name.';
    if (form.businessName.trim().length < 2) e.businessName = 'Enter your business name.';
    if (!isEmail(form.email.trim())) e.email = 'Enter a valid email address, like name@example.com.';
    if (form.phone.replace(/\D/g, '').length < 8) e.phone = 'Enter a phone number with at least 8 digits.';
    if (form.password.length < 8) e.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) e.confirm = 'The passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setFormError('');
    if (!validate()) return;
    setBusy(true);
    try { await signup(form); navigate('/dashboard', { replace: true }); } catch (err) { setFormError(err.message); } finally { setBusy(false); }
  };

  return (
    <AuthLayout title="Create your account" intro="Set up your business and add your first product in a few minutes." footer={<>Already have an account? <Link to="/login">Log in</Link></>}>
      {formError && <div className="alert-t alert-t--danger" role="alert">{formError}</div>}
      <form onSubmit={submit} noValidate>
        <div className="row g-x-3">
          <div className="col-md-6"><FormField label="Full name" name="name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} required /></div>
          <div className="col-md-6"><FormField label="Business name" name="business" autoComplete="organization" value={form.businessName} onChange={set('businessName')} error={errors.businessName} required /></div>
          <div className="col-md-6"><FormField label="Email" type="email" name="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} required /></div>
          <div className="col-md-6"><FormField label="Phone" type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} required /></div>
          <div className="col-md-6"><FormField label="Password" type="password" name="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="At least 8 characters. Not stored." required /></div>
          <div className="col-md-6"><FormField label="Confirm password" type="password" name="confirm" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} required /></div>
        </div>
        <button className="btn btn-primary w-100 mt-2" disabled={busy}>{busy ? 'Creating account' : 'Create account'}</button>
      </form>
    </AuthLayout>
  );
}
