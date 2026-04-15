import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Edit3, Download, Eye, ToggleLeft, ToggleRight,
  Users, Calendar, ClipboardList, Loader2, Search, X, ChevronRight
} from 'lucide-react';
import FormBuilder from '../components/events/FormBuilder';
import SubmissionsView from '../components/events/SubmissionsView';

const AdminForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit' | 'submissions'
  const [selectedForm, setSelectedForm] = useState(null);
  const [reopeningForm, setReopeningForm] = useState(null);
  const [newEndDate, setNewEndDate] = useState('');

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/forms');
      setForms(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this form and ALL its submissions?')) return;
    try {
      await api.delete(`/forms/${id}`);
      toast.success('Form deleted');
      fetchForms();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleToggleStatus = async (form) => {
    if (form.status === 'closed') {
      setReopeningForm(form);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      // Format to local ISO string (YYYY-MM-DDTHH:mm)
      const offset = tomorrow.getTimezoneOffset() * 60000;
      const localISOTime = new Date(tomorrow.getTime() - offset).toISOString().slice(0, 16);
      setNewEndDate(localISOTime);
      return;
    }

    try {
      await api.put(`/forms/${form.id}/status`, { status: 'closed' });
      toast.success(`Form Closed`);
      fetchForms();
    } catch (err) {
      toast.error('Status change failed');
    }
  };

  const confirmReopen = async () => {
    if (!newEndDate) return toast.error('Please select a new end date');
    try {
      await api.put(`/forms/${reopeningForm.id}/status`, { 
        status: 'active',
        end_date: newEndDate
      });
      toast.success('Form Reopened!');
      setReopeningForm(null);
      fetchForms();
    } catch (err) {
      toast.error('Reopen failed');
    }
  };

  const handleExport = async (formId, title) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = api.defaults.baseURL || '';
      const res = await fetch(`${baseURL}/forms/${formId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_registrations.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Excel downloaded!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const getStatusBadge = (label) => {
    const map = {
      'Open':        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      'Closed':      'bg-red-500/15 text-red-400 border-red-500/30',
      'Coming Soon': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    };
    return map[label] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  };

  // ─── Sub-views ─────────────────────────────────────────────────────────
  if (view === 'create') {
    return <FormBuilder onBack={() => { setView('list'); fetchForms(); }} />;
  }
  if (view === 'edit' && selectedForm) {
    return <FormBuilder form={selectedForm} onBack={() => { setView('list'); setSelectedForm(null); fetchForms(); }} />;
  }
  if (view === 'submissions' && selectedForm) {
    return (
      <SubmissionsView
        form={selectedForm}
        onBack={() => { setView('list'); setSelectedForm(null); }}
        onExport={() => handleExport(selectedForm.id, selectedForm.title)}
      />
    );
  }

  // ─── Main List ─────────────────────────────────────────────────────────
  return (
    <div className="py-4 animate-fade-in space-y-6 max-w-7xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ClipboardList size={22} className="text-violet-400" /> Event Forms
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage event registration forms.</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20"
        >
          <Plus size={15} /> Create Form
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Forms', value: forms.length, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Active', value: forms.filter(f => f.status === 'active').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Closed', value: forms.filter(f => f.status === 'closed').length, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-white/5 p-4 rounded-2xl shadow`}>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className={`text-3xl font-black ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Forms list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-violet-400" size={30} />
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-20 bg-[#111827] border border-white/5 border-dashed rounded-2xl">
          <ClipboardList className="mx-auto text-gray-700 mb-3" size={36} />
          <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">No forms yet. Create your first event form!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map(form => (
            <div key={form.id} className="bg-[#111827] border border-white/5 hover:border-violet-500/20 rounded-2xl p-5 transition-all shadow-lg">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-white">{form.title}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(form.status_label)}`}>
                      {form.status_label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-gray-500 flex-wrap">
                    {form.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} className="text-violet-400" />
                        {new Date(form.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={10} className="text-violet-400" />
                      {form.type === 'team' ? `Team (${form.team_size})` : 'Solo'}
                    </span>
                    <span className="flex items-center gap-1 text-violet-400 font-bold">
                      {form.submission_count || 0} registrations
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => { setSelectedForm(form); setView('submissions'); }}
                    title="View Submissions"
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-violet-500/20 text-gray-400 hover:text-violet-300 border border-white/10 hover:border-violet-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  >
                    <Eye size={13} /> Submissions
                  </button>
                  <button
                    onClick={() => handleExport(form.id, form.title)}
                    title="Export Excel"
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  >
                    <Download size={13} /> Excel
                  </button>
                  <button
                    onClick={() => { setSelectedForm(form); setView('edit'); }}
                    title="Edit Form"
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(form)}
                    title={form.status === 'active' ? 'Close Form' : 'Reopen Form'}
                    className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      form.status === 'active'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {form.status === 'active' ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                    {form.status === 'active' ? 'Close' : 'Reopen'}
                  </button>
                  <button
                    onClick={() => handleDelete(form.id)}
                    title="Delete Form"
                    className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Reopen Prompt Inline */}
                {reopeningForm?.id === form.id && (
                  <div className="mt-4 p-4 bg-violet-600/10 border border-violet-500/30 rounded-xl animate-fade-in">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-violet-300 uppercase tracking-widest">Reopen Event</p>
                        <p className="text-[10px] text-gray-400">Set a new deadline for registrations.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={newEndDate}
                          onChange={e => setNewEndDate(e.target.value)}
                          className="bg-[#0B0F19] border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-violet-500"
                        />
                        <button
                          onClick={confirmReopen}
                          className="bg-violet-600 hover:bg-violet-500 text-white font-black px-4 py-1.5 rounded-lg text-[11px] transition-all"
                        >
                          Confirm Reopen
                        </button>
                        <button
                          onClick={() => setReopeningForm(null)}
                          className="bg-white/5 hover:bg-white/10 text-gray-400 px-4 py-1.5 rounded-lg text-[11px] transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminForms;
