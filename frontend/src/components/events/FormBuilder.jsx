import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save, Loader2,
  Type, Hash, Mail, List, Upload, ChevronDown
} from 'lucide-react';

const FIELD_TYPE_ICONS = {
  text: Type, number: Hash, email: Mail, select: List, file: Upload
};

const DEFAULT_FIELDS = [
  { field_name: 'Name', field_type: 'text', required: true, apply_to: 'all', is_default: true },
  { field_name: 'ERP', field_type: 'text', required: true, apply_to: 'all', is_default: true },
  { field_name: 'Email', field_type: 'email', required: true, apply_to: 'all', is_default: true },
  { field_name: 'Mobile Number', field_type: 'number', required: true, apply_to: 'all', is_default: true },
  { field_name: 'Section', field_type: 'text', required: true, apply_to: 'all', is_default: true },
  { field_name: 'Semester', field_type: 'number', required: true, apply_to: 'all', is_default: true },
  { field_name: 'College', field_type: 'text', required: true, apply_to: 'all', is_default: true },
];

const emptyField = () => ({
  _id: Math.random().toString(36).slice(2),
  field_name: '',
  field_type: 'text',
  options: '',
  required: false,
  apply_to: 'all',
  is_default: false,
});

const FormBuilder = ({ form: editForm, onBack }) => {
  const isEdit = !!editForm;

  const [title, setTitle] = useState(editForm?.title || '');
  const [description, setDescription] = useState(editForm?.description || '');
  const [event_date, setEventDate] = useState(editForm?.event_date?.split('T')[0] || '');
  const [venue, setVenue] = useState(editForm?.venue || '');
  const [type, setType] = useState(editForm?.type || 'solo');
  const [team_size, setTeamSize] = useState(editForm?.team_size || 2);
  const [start_date, setStartDate] = useState(editForm?.start_date ? editForm.start_date.slice(0, 16) : '');
  const [end_date, setEndDate] = useState(editForm?.end_date ? editForm.end_date.slice(0, 16) : '');
  const [fields, setFields] = useState(isEdit ? [] : DEFAULT_FIELDS.map(df => ({ ...df, _id: Math.random().toString(36).slice(2) })));
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    fetchTemplates();
    if (isEdit) {
      // Fetch full form with fields
      api.get(`/forms/${editForm.id}`).then(res => {
        const f = res.data.data;
        setFields((f.fields || []).map(ff => ({ ...ff, _id: ff.id.toString() })));
      }).catch(() => toast.error('Failed to load form fields'));
    }
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates');
      setTemplates(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch templates');
    }
  };

  const loadTemplate = async (templateId) => {
    if (!templateId) return;
    try {
      const res = await api.get(`/templates/${templateId}`);
      const t = res.data.data;
      
      // Merge template fields with current fields (prevent duplicates of default fields)
      const templateFields = (t.fields || []).map(ff => ({
        ...ff,
        _id: Math.random().toString(36).slice(2),
        is_default: ff.is_default || false
      }));

      // Filter out fields that are already default fields to avoid duplicates
      const newCustomFields = templateFields.filter(tf => !DEFAULT_FIELDS.some(df => df.field_name === tf.field_name));
      
      setFields(prev => {
        const existingCustom = prev.filter(f => !f.is_default);
        return [...prev.filter(f => f.is_default), ...existingCustom, ...newCustomFields];
      });
      
      setType(t.type || 'solo');
      setTeamSize(t.team_size || 2);
      toast.success(`Template "${t.name}" loaded!`);
    } catch (err) {
      toast.error('Failed to load template');
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!title.trim()) return toast.error('Enter a title first to use as template name');
    
    try {
      setSavingTemplate(true);
      const payload = {
        name: title.trim(),
        description: description.trim(),
        type,
        team_size: type === 'team' ? Number(team_size) : 1,
        fields: fields.map((f, i) => ({
          field_name: f.field_name,
          field_type: f.field_type,
          options: f.options,
          required: !!f.required,
          apply_to: f.apply_to,
          field_order: i,
          is_default: !!f.is_default
        })),
      };

      await api.post('/templates', payload);
      toast.success('Structure saved as Template!');
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const addField = () => setFields(prev => [...prev, emptyField()]);

  const removeField = (id) => setFields(prev => prev.filter(f => f._id !== id));

  const updateField = (id, key, val) => {
    setFields(prev => prev.map(f => f._id === id ? { ...f, [key]: val } : f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Form title is required');

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        event_date: event_date || null,
        venue: venue.trim(),
        type,
        team_size: type === 'team' ? Number(team_size) : 1,
        start_date: start_date || null,
        end_date: end_date || null,
        fields: fields.map((f, i) => ({
          field_name: f.field_name,
          field_type: f.field_type,
          options: f.options,
          required: !!f.required,
          apply_to: f.apply_to,
          field_order: i,
          is_default: !!f.is_default,
        })),
      };

      if (isEdit) {
        await api.put(`/forms/${editForm.id}`, payload);
        toast.success('Form updated!');
      } else {
        await api.post('/forms', payload);
        toast.success('Form created!');
      }
      onBack();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200
    placeholder-gray-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all`;

  return (
    <div className="py-4 animate-fade-in space-y-6 max-w-3xl mx-auto px-4 sm:px-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={14} /> Back to Forms
      </button>

      <div>
        <h2 className="text-2xl font-black text-white">{isEdit ? 'Edit Form' : 'Create New Form'}</h2>
        <p className="text-sm text-gray-500 mt-1">Build a registration form for your event.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-xs font-black text-violet-300 uppercase tracking-widest">Event Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label-field">Event Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Code War 2025" className={inputClass} required />
            </div>
            <div className="md:col-span-2">
              <label className="label-field">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the event..." className={inputClass + ' resize-none'} />
            </div>
            <div>
              <label className="label-field">Event Date</label>
              <input type="date" value={event_date} onChange={e => setEventDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="label-field">Venue</label>
              <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Seminar Hall A" className={inputClass} />
            </div>
            <div>
              <label className="label-field">Registration Opens</label>
              <input type="datetime-local" value={start_date} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="label-field">Registration Closes</label>
              <input type="datetime-local" value={end_date} onChange={e => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Templates Picker */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-xs font-black text-violet-300 uppercase tracking-widest">Templates</h3>
            {templates.length > 0 && (
              <select 
                value={selectedTemplate} 
                onChange={e => { setSelectedTemplate(e.target.value); loadTemplate(e.target.value); }}
                className="bg-transparent border-none text-[10px] text-violet-400 font-black uppercase tracking-widest focus:ring-0 cursor-pointer"
              >
                <option value="">Use a Template</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="p-6">
            <p className="text-[11px] text-gray-500 mb-4">Templates help you reuse form structures like field lists and team settings.</p>
            <button
               type="button"
               disabled={savingTemplate}
               onClick={handleSaveAsTemplate}
               className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {savingTemplate ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save Current as Template
            </button>
          </div>
        </div>

        {/* Type */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-xs font-black text-violet-300 uppercase tracking-widest">Participation Type</h3>
          </div>
          <div className="p-6 flex items-center gap-4 flex-wrap">
            <div className="flex gap-3">
              {['solo', 'team'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                    type === t
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/20'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:border-violet-500/30'
                  }`}
                >
                  {t === 'solo' ? '👤 Solo' : '👥 Team'}
                </button>
              ))}
            </div>
            {type === 'team' && (
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Team Size</label>
                <select value={team_size} onChange={e => setTeamSize(e.target.value)} className={inputClass + ' w-28'}>
                  {[2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Members</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Fields Builder */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-xs font-black text-violet-300 uppercase tracking-widest">Custom Fields</h3>
            <span className="text-[10px] text-gray-500 font-bold">{fields.length} field{fields.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-6 space-y-4">
            {/* Render ALL fields (Default and Custom) */}
            {fields.map((field, idx) => {
              const Icon = FIELD_TYPE_ICONS[field.field_type] || Type;
              const displayIdx = idx + 1;
              return (
                <div key={field._id} className={`bg-[#0B0F19] border rounded-xl p-4 space-y-3 transition-all ${
                  field.is_default ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/10 hover:border-violet-500/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-gray-600" />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${field.is_default ? 'text-violet-400' : 'text-gray-600'}`}>
                        {field.is_default ? 'Default Field' : `Custom Field ${displayIdx}`}
                      </span>
                    </div>
                    {!field.is_default && (
                      <button type="button" onClick={() => removeField(field._id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label-field">Field Name *</label>
                      <input
                        value={field.field_name}
                        onChange={e => updateField(field._id, 'field_name', e.target.value)}
                        placeholder="e.g. Free Fire UID, GitHub URL..."
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="label-field">Field Type</label>
                      <select value={field.field_type} onChange={e => updateField(field._id, 'field_type', e.target.value)} className={inputClass + ' cursor-pointer'}>
                        {Object.keys(FIELD_TYPE_ICONS).map(t => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    {field.field_type === 'select' && (
                      <div className="md:col-span-2">
                        <label className="label-field">Options (comma-separated)</label>
                        <input
                          value={field.options || ''}
                          onChange={e => updateField(field._id, 'options', e.target.value)}
                          placeholder="e.g. Option A, Option B, Option C"
                          className={inputClass}
                        />
                      </div>
                    )}

                    <div>
                      <label className="label-field">Apply To</label>
                      <select value={field.apply_to} onChange={e => updateField(field._id, 'apply_to', e.target.value)} className={inputClass + ' cursor-pointer'}>
                        <option value="all">All Members</option>
                        <option value="leader">Leader Only</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => updateField(field._id, 'required', !field.required)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.required ? 'bg-violet-600' : 'bg-gray-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${field.required ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-xs text-gray-400 font-bold">{field.required ? 'Required' : 'Optional'}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addField}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-violet-500/40 hover:border-violet-500/70 bg-violet-500/5 hover:bg-violet-500/10 text-violet-400 hover:text-violet-300 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              <Plus size={14} /> Add Field
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : isEdit ? 'Update Form' : 'Create Form'}
        </button>
      </form>

      <style>{`.label-field { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 5px; }`}</style>
    </div>
  );
};

export default FormBuilder;
