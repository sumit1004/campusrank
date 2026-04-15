import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Calendar, MapPin, Users, Clock, ChevronRight,
  CheckCircle2, XCircle, ClipboardList, Loader2, ArrowLeft
} from 'lucide-react';
import FormFillView from '../components/events/FormFillView';

const EventRegistration = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('all');
  const [forms, setForms] = useState([]);
  const [mySubmissions, setMySubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/forms/active');
      const formList = res.data.data || [];
      setForms(formList);

      // Fetch my submission status for each form
      const statusMap = {};
      await Promise.all(
        formList.map(async (f) => {
          try {
            const sRes = await api.get(`/forms/${f.id}/my-submission`);
            statusMap[f.id] = sRes.data.data;
          } catch (_) { statusMap[f.id] = null; }
        })
      );
      setMySubmissions(statusMap);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const myRegistered = forms.filter(f => mySubmissions[f.id]);

  const getStatusBadge = (label) => {
    const map = {
      'Open':        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      'Closed':      'bg-red-500/15 text-red-400 border-red-500/30',
      'Coming Soon': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    };
    return map[label] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  };

  if (selectedForm) {
    return (
      <FormFillView
        form={selectedForm}
        mySubmission={mySubmissions[selectedForm.id]}
        onBack={() => { setSelectedForm(null); fetchForms(); }}
      />
    );
  }

  return (
    <div className="py-4 animate-fade-in space-y-6 max-w-7xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-6 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-violet-500/20 blur-3xl rounded-full" />
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ClipboardList size={22} className="text-violet-400" /> Event Registrations
          </h1>
          <p className="text-sm text-gray-400 mt-1">Discover and register for events happening at your campus.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Events' },
          { key: 'mine', label: `My Registrations (${myRegistered.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
              activeTab === tab.key
                ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                : 'bg-white/5 text-gray-400 border-white/10 hover:border-violet-500/30 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-violet-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeTab === 'all' ? forms : myRegistered).map(form => {
            const isRegistered = !!mySubmissions[form.id];
            return (
              <div
                key={form.id}
                className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-violet-500/30 transition-all group cursor-pointer"
                onClick={() => setSelectedForm(form)}
              >
                {/* Card top accent */}
                <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-black text-white leading-tight group-hover:text-violet-300 transition-colors">{form.title}</h3>
                    <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(form.status_label)}`}>
                      {form.status_label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2">{form.description}</p>

                  <div className="space-y-1.5 text-[11px] text-gray-500">
                    {form.venue && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-violet-400 shrink-0" />
                        <span className="truncate">{form.venue}</span>
                      </div>
                    )}
                    {form.event_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-violet-400 shrink-0" />
                        <span>{new Date(form.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-violet-400 shrink-0" />
                      <span className="capitalize">{form.type === 'team' ? `Team (${form.team_size} members)` : 'Solo'}</span>
                    </div>
                    {form.end_date && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-violet-400 shrink-0" />
                        <span>Closes: {new Date(form.end_date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    {isRegistered ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400">
                        <CheckCircle2 size={13} /> Registered
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-600 font-bold">by {form.admin_name || 'Admin'}</span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-violet-400 font-black group-hover:gap-2 transition-all">
                      {isRegistered ? 'View Details' : 'Register'} <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {(activeTab === 'all' ? forms : myRegistered).length === 0 && (
            <div className="col-span-3 text-center py-16 bg-[#111827] border border-white/5 border-dashed rounded-2xl">
              <ClipboardList className="mx-auto text-gray-700 mb-3" size={32} />
              <p className="text-gray-600 font-bold text-sm uppercase tracking-widest">
                {activeTab === 'all' ? 'No active events found.' : 'No registrations yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventRegistration;
