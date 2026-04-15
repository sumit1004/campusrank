import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import {
  ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle2, Send, Loader2, Info
} from 'lucide-react';

const FormFillView = ({ form: initialForm, mySubmission, onBack }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});   // { `field_${fieldId}_member_${idx}`: value }

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchFullForm();
  }, [initialForm.id]);

  const fetchFullForm = async () => {
    try {
      const res = await api.get(`/forms/${initialForm.id}`);
      const formDetails = res.data.data;
      setForm(formDetails);

      // Pre-fill leader data from user profile
      if (user && formDetails.fields) {
        const prefill = {};
        formDetails.fields.forEach(field => {
          if (field.apply_to === 'all' || field.apply_to === 'leader') {
            const name = field.field_name.toLowerCase();
            if (name === 'name') prefill[`f${field.id}_m1`] = user.name || '';
            if (name === 'erp') prefill[`f${field.id}_m1`] = user.erp || '';
            if (name === 'email') prefill[`f${field.id}_m1`] = user.email || '';
          }
        });
        setFormData(prev => ({ ...prev, ...prefill }));
      }
    } catch (err) {
      toast.error('Failed to load form details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldId, memberIdx, value) => {
    setFormData(prev => ({ ...prev, [`f${fieldId}_m${memberIdx}`]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    // Validate required fields
    const members = [];
    const teamSize = form.type === 'team' ? (form.team_size || 1) : 1;

    for (let m = 1; m <= teamSize; m++) {
      for (const field of form.fields) {
        if (field.apply_to === 'leader' && m > 1) continue;
        const val = formData[`f${field.id}_m${m}`] || '';
        if (field.required && !val.trim()) {
          const memberLabel = teamSize > 1 ? (m === 1 ? 'Leader' : `Member ${m}`) : '';
          toast.error(`"${field.field_name}"${memberLabel ? ` for ${memberLabel}` : ''} is required.`);
          return;
        }
        members.push({ field_id: field.id, value: val, member_index: m });
      }
    }

    try {
      setSubmitting(true);
      await api.post(`/forms/${form.id}/submit`, { members });
      toast.success('🎉 Registered successfully!');
      onBack();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field, memberIdx) => {
    const key = `f${field.id}_m${memberIdx}`;
    const val = formData[key] || '';
    const inputClass = `w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600
      focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all`;

    if (field.field_type === 'select') {
      const options = field.options ? field.options.split(',').map(o => o.trim()) : [];
      return (
        <select
          value={val}
          onChange={e => handleChange(field.id, memberIdx, e.target.value)}
          className={inputClass + ' cursor-pointer'}
          required={field.required}
        >
          <option value="">— Select —</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }

    return (
      <input
        type={field.field_type || 'text'}
        value={val}
        placeholder={`Enter ${field.field_name}`}
        onChange={e => handleChange(field.id, memberIdx, e.target.value)}
        className={inputClass}
        required={field.required}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-violet-400" size={32} />
      </div>
    );
  }

  if (!form) return null;

  const teamSize = form.type === 'team' ? (form.team_size || 1) : 1;
  const isOpen = form.status_label === 'Open';
  const alreadyRegistered = !!mySubmission;

  return (
    <div className="py-4 animate-fade-in space-y-6 max-w-3xl mx-auto px-4 sm:px-0">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={14} /> Back to Events
      </button>

      {/* Form Header */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-white leading-tight">{form.title}</h1>
            <span className={`text-[11px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${
              form.status_label === 'Open' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
              form.status_label === 'Coming Soon' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
              'bg-red-500/15 text-red-400 border-red-500/30'
            }`}>
              {form.status_label}
            </span>
          </div>

          {form.description && <p className="text-sm text-gray-400 leading-relaxed">{form.description}</p>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            {form.venue && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin size={11} className="text-violet-400" /> {form.venue}
              </div>
            )}
            {form.event_date && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar size={11} className="text-violet-400" />
                {new Date(form.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users size={11} className="text-violet-400" />
              {form.type === 'team' ? `Team (${form.team_size})` : 'Solo'}
            </div>
            {form.end_date && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock size={11} className="text-violet-400" />
                Closes {new Date(form.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Already registered banner */}
      {alreadyRegistered && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
          <div>
            <p className="text-emerald-300 font-black text-sm">You're already registered! ✅</p>
            <p className="text-emerald-500 text-xs mt-0.5">
              Registered on {new Date(mySubmission.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Form not open notice */}
      {!isOpen && !alreadyRegistered && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <Info className="text-amber-400 shrink-0" size={20} />
          <p className="text-amber-300 font-bold text-sm">
            {form.status_label === 'Coming Soon' ? 'Registration is not open yet.' : 'Registration is closed for this event.'}
          </p>
        </div>
      )}

      {/* Registration Form */}
      {isOpen && !alreadyRegistered && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {Array.from({ length: teamSize }, (_, i) => i + 1).map((memberIdx) => {
            const memberLabel = teamSize > 1 ? (memberIdx === 1 ? '👑 Leader Details' : `Member ${memberIdx} Details`) : null;
            const memberFields = form.fields.filter(f => !(f.apply_to === 'leader' && memberIdx > 1));

            if (memberFields.length === 0) return null;

            return (
              <div key={memberIdx} className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                {memberLabel && (
                  <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-sm font-black text-violet-300 uppercase tracking-widest">{memberLabel}</h3>
                  </div>
                )}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {memberFields.map(field => (
                    <div key={field.id} className={field.field_type === 'file' ? 'md:col-span-2' : ''}>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">
                        {field.field_name}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {renderField(field, memberIdx)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? 'Registering...' : 'Submit Registration'}
          </button>
        </form>
      )}
    </div>
  );
};

export default FormFillView;
