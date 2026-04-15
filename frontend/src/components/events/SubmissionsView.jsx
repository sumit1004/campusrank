import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Search, Loader2, Users, ChevronDown, ChevronUp } from 'lucide-react';

const SubmissionsView = ({ form, onBack, onExport }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async (q = '') => {
    try {
      setLoading(true);
      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const res = await api.get(`/forms/${form.id}/submissions${params}`);
      setSubmissions(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    const timer = setTimeout(() => fetchSubmissions(q), 400);
    return () => clearTimeout(timer);
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // Group data by member_index
  const groupDataByMember = (data) => {
    const grouped = {};
    data.forEach(d => {
      const mi = d.member_index || 1;
      if (!grouped[mi]) grouped[mi] = [];
      grouped[mi].push(d);
    });
    return grouped;
  };

  return (
    <div className="py-4 animate-fade-in space-y-6 max-w-5xl mx-auto px-4 sm:px-0">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="h-4 w-px bg-white/10" />
          <h2 className="text-lg font-black text-white">{form.title}</h2>
          <span className="text-xs text-violet-400 font-bold">{submissions.length} registrations</span>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 bg-emerald-600/80 hover:bg-emerald-600 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20"
        >
          <Download size={14} /> Download Excel
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search by name or ERP..."
          className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all"
        />
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-violet-400" size={28} />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-[#111827] border border-white/5 border-dashed rounded-2xl">
          <Users className="mx-auto text-gray-700 mb-3" size={32} />
          <p className="text-gray-600 font-bold text-sm uppercase tracking-widest">No registrations found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, idx) => {
            const isOpen = !!expanded[sub.id];
            const grouped = groupDataByMember(sub.data || []);
            const memberCount = Object.keys(grouped).length;

            return (
              <div key={sub.id} className="bg-[#111827] border border-white/5 hover:border-violet-500/20 rounded-2xl overflow-hidden transition-all shadow">
                {/* Row header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => toggleExpand(sub.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-black text-white">{sub.student_name}</p>
                      <p className="text-[11px] text-gray-500">{sub.student_erp} · {sub.student_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-600 font-bold">
                      {new Date(sub.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isOpen ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                  </div>
                </div>

                {/* Expanded submission data */}
                {isOpen && (
                  <div className="border-t border-white/5 px-5 py-4 bg-[#0B0F19] space-y-4">
                    {Object.entries(grouped).map(([mi, dataArr]) => (
                      <div key={mi}>
                        {memberCount > 1 && (
                          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">
                            {mi === '1' ? '👑 Leader' : `Member ${mi}`}
                          </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {dataArr.map((d, i) => (
                            <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{d.field_name}</p>
                              <p className="text-xs text-gray-300 font-bold break-all">{d.value || '—'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubmissionsView;
