import {
  ArrowLeft,
  BarChart3,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Filter,
  LayoutDashboard,
  LogOut,
  Mail,
  NotebookPen,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { authApi, leadApi } from './api.js';

const emptyLead = {
  leadName: '',
  companyName: '',
  email: '',
  phone: '',
  source: 'Website',
  assignedSalesperson: '',
  status: 'New',
  dealValue: ''
};

const statusTone = {
  New: 'tone-blue',
  Contacted: 'tone-cyan',
  Qualified: 'tone-green',
  'Proposal Sent': 'tone-amber',
  Won: 'tone-emerald',
  Lost: 'tone-red'
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}

export function App() {
  const [token, setToken] = useState(() => localStorage.getItem('crm_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('crm_user') || 'null'));
  const [view, setView] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [options, setOptions] = useState({ statuses: [], sources: [] });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    assignedSalesperson: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

  const salespeople = useMemo(
    () => [...new Set(leads.map((lead) => lead.assignedSalesperson).filter(Boolean))].sort(),
    [leads]
  );

  useEffect(() => {
    if (!token) return;
    refreshData();
  }, [token, filters.status, filters.source, filters.assignedSalesperson]);

  useEffect(() => {
    if (!token) return;
    const timeout = setTimeout(() => refreshLeads(), 250);
    return () => clearTimeout(timeout);
  }, [filters.search]);

  async function refreshData() {
    setLoading(true);
    setError('');
    try {
      const [leadRows, dashboard, meta] = await Promise.all([
        leadApi.list(filters),
        leadApi.dashboard(),
        leadApi.options()
      ]);
      setLeads(leadRows);
      setSummary(dashboard);
      setOptions(meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshLeads() {
    try {
      setLeads(await leadApi.list(filters));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogin({ token: authToken, user: authUser }) {
    localStorage.setItem('crm_token', authToken);
    localStorage.setItem('crm_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  }

  function handleLogout() {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setToken(null);
    setUser(null);
    setLeads([]);
    setView('dashboard');
  }

  async function saveLead(payload) {
    const cleanPayload = {
      leadName: payload.leadName,
      companyName: payload.companyName,
      email: payload.email,
      phone: payload.phone,
      source: payload.source,
      assignedSalesperson: payload.assignedSalesperson,
      status: payload.status,
      dealValue: payload.dealValue
    };

    if (editingLead) {
      await leadApi.update(editingLead._id, cleanPayload);
      setDetailRefreshKey((key) => key + 1);
    } else {
      await leadApi.create(cleanPayload);
    }
    closeModal();
    await refreshData();
  }

  async function removeLead(id) {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return;
    await leadApi.remove(id);
    if (selectedLeadId === id) {
      setSelectedLeadId(null);
      setView('leads');
    }
    await refreshData();
  }

  async function updateStatus(id, status) {
    await leadApi.updateStatus(id, status);
    await refreshData();
  }

  function openCreateModal() {
    setEditingLead(null);
    setModalMode('lead');
  }

  function openEditModal(lead) {
    setEditingLead(lead);
    setModalMode('lead');
  }

  function closeModal() {
    setModalMode(null);
    setEditingLead(null);
  }

  if (!token) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">TL</div>
          <div>
            <strong>CRM System</strong>
            <span>Lead Command Center</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button className={view === 'leads' || view === 'detail' ? 'active' : ''} onClick={() => setView('leads')}>
            <BarChart3 size={18} />
            Leads
          </button>
        </nav>

        <div className="user-card">
          <div className="avatar">{user?.name?.[0] || 'A'}</div>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Sales Pipeline</span>
            <h1>{view === 'dashboard' ? 'Dashboard' : view === 'detail' ? 'Lead Details' : 'Lead Management'}</h1>
          </div>
          <button className="primary-button" onClick={openCreateModal}>
            <Plus size={18} />
            New Lead
          </button>
        </header>

        {error && (
          <div className="notice">
            <span>{error}</span>
            <button onClick={() => setError('')} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}

        {view === 'dashboard' && (
          <Dashboard summary={summary} leads={leads} loading={loading} onLeadOpen={(id) => {
            setSelectedLeadId(id);
            setView('detail');
          }} />
        )}

        {view === 'leads' && (
          <LeadList
            leads={leads}
            options={options}
            filters={filters}
            salespeople={salespeople}
            loading={loading}
            onFilterChange={setFilters}
            onOpen={(id) => {
              setSelectedLeadId(id);
              setView('detail');
            }}
            onEdit={openEditModal}
            onDelete={removeLead}
            onStatusChange={updateStatus}
          />
        )}

        {view === 'detail' && (
          <LeadDetails
            leadId={selectedLeadId}
            refreshKey={detailRefreshKey}
            options={options}
            onBack={() => setView('leads')}
            onEdit={openEditModal}
            onDelete={removeLead}
            onLeadChanged={refreshData}
          />
        )}
      </main>

      {modalMode === 'lead' && (
        <LeadModal
          lead={editingLead}
          options={options}
          onClose={closeModal}
          onSave={saveLead}
        />
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      onLogin(await authApi.login(form));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-visual">
        <div className="pipeline-preview">
          <div>
            <span>Pipeline value</span>
            <strong>$54,500</strong>
          </div>
          <div className="mini-bars">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="login-copy">
          <div className="brand-mark large">TL</div>
          <h1>CRM System</h1>
          <p>Track every lead from first touch to closed deal with a clean, focused workspace for your sales team.</p>
        </div>
      </section>

      <section className="login-panel">
        <form onSubmit={submit} className="auth-card">
          <span className="eyebrow">Secure Access</span>
          <h2>Welcome back</h2>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button wide" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
          <p className="credential-hint">Test user: admin@example.com / password123</p>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ summary, leads, loading, onLeadOpen }) {
  const metrics = [
    ['Total Leads', summary?.totalLeads || 0, UserRound],
    ['New Leads', summary?.newLeads || 0, Plus],
    ['Qualified Leads', summary?.qualifiedLeads || 0, CheckCircle2],
    ['Won Leads', summary?.wonLeads || 0, CircleDollarSign],
    ['Lost Leads', summary?.lostLeads || 0, X],
    ['Total Pipeline', formatCurrency(summary?.totalDealValue), BarChart3],
    ['Won Revenue', formatCurrency(summary?.wonDealValue), CircleDollarSign]
  ];

  const hotLeads = [...leads]
    .filter((lead) => !['Won', 'Lost'].includes(lead.status))
    .sort((a, b) => b.dealValue - a.dealValue)
    .slice(0, 4);

  return (
    <section className="dashboard-view">
      <div className="metrics-grid">
        {metrics.map(([label, value, Icon]) => (
          <article className="metric-card" key={label}>
            <div className="metric-icon">
              <Icon size={20} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Pipeline</span>
              <h2>Status Overview</h2>
            </div>
          </div>
          <div className="pipeline-bars">
            {Object.entries(summary?.statusCounts || {}).map(([status, count]) => (
              <div className="pipeline-row" key={status}>
                <span>{status}</span>
                <div>
                  <i style={{ width: `${Math.max(8, (count / Math.max(summary.totalLeads, 1)) * 100)}%` }} />
                </div>
                <strong>{count}</strong>
              </div>
            ))}
            {!loading && Object.keys(summary?.statusCounts || {}).length === 0 && <p>No pipeline data yet.</p>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Focus</span>
              <h2>Highest Value Open Leads</h2>
            </div>
          </div>
          <div className="focus-list">
            {hotLeads.map((lead) => (
              <button key={lead._id} onClick={() => onLeadOpen(lead._id)}>
                <span>
                  <strong>{lead.companyName}</strong>
                  <small>{lead.leadName} · {lead.status}</small>
                </span>
                <b>{formatCurrency(lead.dealValue)}</b>
              </button>
            ))}
            {!loading && hotLeads.length === 0 && <p>No open leads to prioritize.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

function LeadList({
  leads,
  options,
  filters,
  salespeople,
  loading,
  onFilterChange,
  onOpen,
  onEdit,
  onDelete,
  onStatusChange
}) {
  return (
    <section className="leads-view">
      <div className="filters-bar">
        <div className="searchbox">
          <Search size={18} />
          <input
            placeholder="Search leads, companies, emails"
            value={filters.search}
            onChange={(event) => onFilterChange({ ...filters, search: event.target.value })}
          />
        </div>
        <SelectFilter icon={Filter} value={filters.status} onChange={(status) => onFilterChange({ ...filters, status })}>
          <option value="">All statuses</option>
          {options.statuses.map((status) => <option key={status}>{status}</option>)}
        </SelectFilter>
        <SelectFilter value={filters.source} onChange={(source) => onFilterChange({ ...filters, source })}>
          <option value="">All sources</option>
          {options.sources.map((source) => <option key={source}>{source}</option>)}
        </SelectFilter>
        <SelectFilter value={filters.assignedSalesperson} onChange={(assignedSalesperson) => onFilterChange({ ...filters, assignedSalesperson })}>
          <option value="">All owners</option>
          {salespeople.map((person) => <option key={person}>{person}</option>)}
        </SelectFilter>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Value</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id}>
                <td>
                  <button className="link-button" onClick={() => onOpen(lead._id)}>
                    <strong>{lead.leadName}</strong>
                    <span>{lead.companyName}</span>
                  </button>
                </td>
                <td>
                  <span className="contact-line"><Mail size={14} /> {lead.email}</span>
                  <span className="contact-line"><Phone size={14} /> {lead.phone}</span>
                </td>
                <td>{lead.source}</td>
                <td>{lead.assignedSalesperson}</td>
                <td>
                  <select
                    className={`status-pill ${statusTone[lead.status] || ''}`}
                    value={lead.status}
                    onChange={(event) => onStatusChange(lead._id, event.target.value)}
                  >
                    {options.statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td>{formatCurrency(lead.dealValue)}</td>
                <td>{formatDate(lead.updatedAt)}</td>
                <td>
                  <div className="row-actions">
                    <button title="Edit lead" onClick={() => onEdit(lead)}><Pencil size={16} /></button>
                    <button title="Delete lead" onClick={() => onDelete(lead._id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && leads.length === 0 && <div className="empty-state">No leads match the current filters.</div>}
      </div>
    </section>
  );
}

function SelectFilter({ children, value, onChange, icon: Icon }) {
  return (
    <label className="select-filter">
      {Icon && <Icon size={16} />}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function LeadDetails({ leadId, refreshKey, options, onBack, onEdit, onDelete, onLeadChanged }) {
  const [lead, setLead] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!leadId) return;
    loadLead();
  }, [leadId, refreshKey]);

  async function loadLead() {
    setLoading(true);
    try {
      setLead(await leadApi.get(leadId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addNote(event) {
    event.preventDefault();
    if (!note.trim()) return;
    const updated = await leadApi.addNote(leadId, note);
    setLead(updated);
    setNote('');
    onLeadChanged();
  }

  async function changeStatus(status) {
    const updated = await leadApi.updateStatus(leadId, status);
    setLead(updated);
    onLeadChanged();
  }

  if (loading) return <div className="empty-state">Loading lead...</div>;
  if (error) return <div className="empty-state">{error}</div>;
  if (!lead) return <div className="empty-state">Lead not found.</div>;

  return (
    <section className="detail-view">
      <button className="ghost-button" onClick={onBack}>
        <ArrowLeft size={18} />
        Back to leads
      </button>

      <div className="detail-grid">
        <article className="detail-main">
          <div className="detail-header">
            <div>
              <span className={`status-label ${statusTone[lead.status] || ''}`}>{lead.status}</span>
              <h2>{lead.leadName}</h2>
              <p>{lead.companyName}</p>
            </div>
            <div className="detail-actions">
              <button className="ghost-button" onClick={() => onEdit(lead)}><Pencil size={16} /> Edit</button>
              <button className="danger-button" onClick={() => onDelete(lead._id)}><Trash2 size={16} /> Delete</button>
            </div>
          </div>

          <div className="info-grid">
            <Info icon={Mail} label="Email" value={lead.email} />
            <Info icon={Phone} label="Phone" value={lead.phone} />
            <Info icon={Building2} label="Source" value={lead.source} />
            <Info icon={UserRound} label="Assigned" value={lead.assignedSalesperson} />
            <Info icon={CircleDollarSign} label="Deal Value" value={formatCurrency(lead.dealValue)} />
            <Info icon={NotebookPen} label="Created" value={formatDate(lead.createdAt)} />
          </div>

          <label className="status-control">
            Update status
            <select value={lead.status} onChange={(event) => changeStatus(event.target.value)}>
              {options.statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </article>

        <aside className="notes-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Timeline</span>
              <h2>Lead Notes</h2>
            </div>
          </div>

          <form className="note-form" onSubmit={addNote}>
            <textarea
              placeholder="Add call notes, email updates, objections, or next steps"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <button className="primary-button">
              <Plus size={18} />
              Add Note
            </button>
          </form>

          <div className="notes-list">
            {[...(lead.notes || [])].reverse().map((item) => (
              <article key={item._id}>
                <p>{item.content}</p>
                <span>{item.createdBy} · {formatDate(item.createdAt)}</span>
              </article>
            ))}
            {lead.notes?.length === 0 && <p>No notes yet.</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="info-item">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LeadModal({ lead, options, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...emptyLead,
    ...lead,
    dealValue: lead?.dealValue ?? ''
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        dealValue: Number(form.dealValue)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="lead-modal" onSubmit={submit}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{lead ? 'Edit' : 'Create'}</span>
            <h2>{lead ? 'Update Lead' : 'New Lead'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
        </div>

        <div className="form-grid">
          <Field label="Lead name" value={form.leadName} onChange={(value) => update('leadName', value)} />
          <Field label="Company name" value={form.companyName} onChange={(value) => update('companyName', value)} />
          <Field label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} />
          <Field label="Phone number" value={form.phone} onChange={(value) => update('phone', value)} />
          <label>
            Lead source
            <select value={form.source} onChange={(event) => update('source', event.target.value)}>
              {options.sources.map((source) => <option key={source}>{source}</option>)}
            </select>
          </label>
          <Field label="Assigned salesperson" value={form.assignedSalesperson} onChange={(value) => update('assignedSalesperson', value)} />
          <label>
            Status
            <select value={form.status} onChange={(event) => update('status', event.target.value)}>
              {options.statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <Field label="Estimated deal value" type="number" min="0" value={form.dealValue} onChange={(value) => update('dealValue', value)} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', min }) {
  return (
    <label>
      {label}
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </label>
  );
}
