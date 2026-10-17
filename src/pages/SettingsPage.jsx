import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead, Section } from '../components/common/PageHead.jsx';
import { FormField, Switch } from '../components/common/FormField.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { useToast } from '../components/common/States.jsx';

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { user, updateProfile } = useAuth();
  const { resetData } = useData();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [acct, setAcct] = useState({ name: user.name, email: user.email, phone: user.phone });
  const [biz, setBiz] = useState({ businessName: user.businessName, industry: user.industry || '', location: user.location || '' });
  const [errs, setErrs] = useState({});
  const [prefs, setPrefs] = useLocalStorage('sct.prefs', { emailAlerts: true, verificationAlerts: true, compactTables: false });
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const saveAcct = (e) => {
    e.preventDefault();
    const er = {};
    if (acct.name.trim().length < 2) er.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(acct.email)) er.email = 'Enter a valid email address.';
    if (acct.phone.replace(/\D/g, '').length < 8) er.phone = 'Enter a phone number with at least 8 digits.';
    setErrs(er);
    if (Object.keys(er).length) return;
    updateProfile(acct); toast('Account saved');
  };
  const saveBiz = (e) => { e.preventDefault(); if (biz.businessName.trim().length < 2) { setErrs({ businessName: 'Enter your business name.' }); return; } setErrs({}); updateProfile(biz); toast('Business details saved'); };
  const reset = async () => { setBusy(true); await resetData(); setBusy(false); setConfirm(false); toast('Demo data reset'); };

  return (
    <>
      <PageHead title="Settings">Account, business and display options. Items marked &ldquo;Coming soon&rdquo; are placeholders for later versions.</PageHead>
      <div className="settings">
        <Section id="set-acct" title="Account">
          <form onSubmit={saveAcct} noValidate className="settings__form">
            <FormField label="Full name" value={acct.name} onChange={(e) => setAcct({ ...acct, name: e.target.value })} error={errs.name} />
            <FormField label="Email" type="email" value={acct.email} onChange={(e) => setAcct({ ...acct, email: e.target.value })} error={errs.email} />
            <FormField label="Phone" type="tel" value={acct.phone} onChange={(e) => setAcct({ ...acct, phone: e.target.value })} error={errs.phone} />
            <button className="btn btn-primary">Save account</button>
          </form>
        </Section>
        <Section id="set-biz" title="Business">
          <form onSubmit={saveBiz} noValidate className="settings__form">
            <FormField label="Business name" value={biz.businessName} onChange={(e) => setBiz({ ...biz, businessName: e.target.value })} error={errs.businessName} />
            <FormField label="Industry" value={biz.industry} onChange={(e) => setBiz({ ...biz, industry: e.target.value })} />
            <FormField label="Location" value={biz.location} onChange={(e) => setBiz({ ...biz, location: e.target.value })} />
            <button className="btn btn-primary">Save business</button>
          </form>
        </Section>
        <Section id="set-pref" title="Preferences">
          <div className="settings__form">
            <FormField as="select" label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)}><option value="light">Light</option><option value="dark">Dark</option></FormField>
            <Switch label="Email alerts" hint="Placeholder. No emails are sent in this demo." checked={prefs.emailAlerts} onChange={(v) => setPrefs({ ...prefs, emailAlerts: v })} soon />
            <Switch label="Supplier verification alerts" hint="Placeholder. Would notify you when a supplier status changes." checked={prefs.verificationAlerts} onChange={(v) => setPrefs({ ...prefs, verificationAlerts: v })} soon />
            <Switch label="Compact tables" hint="Placeholder. Saved, but not yet applied." checked={prefs.compactTables} onChange={(v) => setPrefs({ ...prefs, compactTables: v })} soon />
          </div>
        </Section>
        <Section id="set-sec" title="Security">
          <div className="settings__form">
            <div className="alert-t alert-t--warning" role="note"><strong>Demo authentication.</strong> Signing in here is simulated in the browser. A real version would use a server, hashed passwords and secure cookies.</div>
            <button className="btn btn-outline-primary" disabled>Change password <span className="soon">Coming soon</span></button>
            <Switch label="Two-factor authentication" hint="Needs a real authentication server." checked={false} onChange={() => {}} disabled soon />
          </div>
        </Section>
        <Section id="set-app" title="Application">
          <div className="settings__form">
            <p className="muted m-0">Products you add or edit are saved in this browser only. Resetting removes them and restores the sample data.</p>
            <button className="btn btn-danger-quiet" onClick={() => setConfirm(true)}>Reset demo data</button>
            <Switch label="Connect an accounting or ERP system" hint="Future integration." checked={false} onChange={() => {}} disabled soon />
            <Switch label="Use live emission factors" hint="Future integration. Today all emissions use mock factors." checked={false} onChange={() => {}} disabled soon />
          </div>
        </Section>
      </div>
      <Modal open={confirm} onClose={() => !busy && setConfirm(false)} title="Reset demo data?" footer={<><button className="btn btn-quiet" onClick={() => setConfirm(false)} disabled={busy}>Cancel</button><button className="btn btn-danger-quiet" onClick={reset} disabled={busy}>{busy ? 'Resetting' : 'Reset data'}</button></>}>
        <p className="m-0">Products you created or edited will be removed and the sample products restored.</p>
      </Modal>
    </>
  );
}
