import React, { useState } from 'react';
import api from '../services/api';
import { getUser } from '../utils/auth';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet, Clipboard, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getAssetUrl } from '../utils/urlHelper';

const AdminECertificates = () => {
    const user = getUser();
    const [formData, setFormData] = useState({
        event_name: '',
        event_date: '',
        position: 'participant',
        pastedData: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [activeTab, setActiveTab] = useState('excel'); // 'excel' or 'paste'

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.event_name || !formData.event_date) {
            return toast.error("Please fill event details");
        }

        if (activeTab === 'excel' && !file) {
            return toast.error("Please upload an Excel file");
        }

        if (activeTab === 'paste' && !formData.pastedData) {
            return toast.error("Please paste student data");
        }

        const data = new FormData();
        data.append('event_name', formData.event_name);
        data.append('event_date', formData.event_date); // Input type="date" returns YYYY-MM-DD
        data.append('position', formData.position.toLowerCase());

        if (activeTab === 'excel') {
            data.append('file', file);
        } else {
            data.append('pastedData', formData.pastedData);
        }

        try {
            setLoading(true);
            setResults(null);
            const res = await api.post('/certificates/bulk-generate', data);
            setResults(res.data.results);
            toast.success("Bulk generation completed!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to generate certificates");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">E-Certificate System</h1>
                <p className="text-gray-400">Bulk generate and issue digital certificates with automated points.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-indigo-400 mb-6 flex items-center">
                            <Send className="mr-2" size={20} /> Event Settings
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Event Name</label>
                                <input 
                                    type="text" 
                                    name="event_name"
                                    value={formData.event_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Free Fire Tournament"
                                    className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Event Date</label>
                                <input 
                                    type="date" 
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Certificate Type (Batch)</label>
                                <select 
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                >
                                    <option value="winner">Winner (50 Pts)</option>
                                    <option value="runnerup1">1st Runner Up (35 Pts)</option>
                                    <option value="runnerup2">2nd Runner Up (20 Pts)</option>
                                    <option value="participant">Participant (10 Pts)</option>
                                </select>
                                <p className="text-[10px] text-gray-500 mt-2 italic px-1">Note: Only one type can be sent per batch.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Input Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
                        <div className="flex border-b border-white/5 bg-white/[0.02]">
                            <button 
                                onClick={() => setActiveTab('excel')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'excel' ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <FileSpreadsheet className="mr-2" size={18} /> Excel Upload
                            </button>
                            <button 
                                onClick={() => setActiveTab('paste')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'paste' ? 'text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Clipboard className="mr-2" size={18} /> Paste Data
                            </button>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            {activeTab === 'excel' ? (
                                <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-white/10 rounded-2xl p-10 bg-[#0B0F19]/50">
                                    <Upload className="text-indigo-500 mb-4" size={48} />
                                    <h3 className="text-white font-bold text-lg mb-2">Upload Spreadsheet</h3>
                                    <p className="text-gray-500 text-center text-sm mb-6 max-w-sm">
                                        Expected columns: <span className="text-indigo-400 font-mono">Name, ERP, Branch, Course, Semester, College</span>
                                    </p>
                                    <input 
                                        type="file" 
                                        accept=".xlsx, .xls"
                                        onChange={handleFileChange}
                                        id="excel-upload"
                                        className="hidden"
                                    />
                                    <label 
                                        htmlFor="excel-upload"
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest cursor-pointer transition-all shadow-lg"
                                    >
                                        {file ? file.name : 'Select File'}
                                    </label>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col">
                                    <p className="text-gray-500 text-[11px] mb-3 uppercase font-black tracking-widest">Paste CSV-like data (One per line)</p>
                                    <textarea 
                                        name="pastedData"
                                        value={formData.pastedData}
                                        onChange={handleInputChange}
                                        placeholder="Sumit Kumar, 6605568, CSE, B.Tech, 4th, RCET&#10;Sweta Raj, 6605569, CSE, B.Tech, 4th, RCET"
                                        className="flex-1 bg-[#0B0F19] border border-white/10 rounded-2xl p-6 text-white text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all font-mono resize-none"
                                    ></textarea>
                                </div>
                            )}

                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} /> Processing Batch...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2" size={18} /> Generate & Issue Certificates
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Display */}
            {results && (
                <div className="mt-12 bg-[#111827] border border-white/5 rounded-3xl p-8 shadow-2xl animate-slide-up">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white">Batch Results</h2>
                        <div className="flex space-x-4">
                            <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-green-500/20">
                                {results.success.length} Issued
                            </div>
                            <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-red-500/20">
                                {results.failed.length} Failed
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Success List */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Successfully Generated</h3>
                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {results.success.map((s, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-white">{s.name}</div>
                                            <div className="text-[10px] text-gray-400 font-mono">{s.erp}</div>
                                        </div>
                                        <a href={getAssetUrl(s.url)} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">
                                            <FileSpreadsheet size={16} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Failed List */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Failed / Skipped</h3>
                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {results.failed.map((f, i) => (
                                    <div key={i} className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-red-200">{f.student?.Name || 'Unknown'}</div>
                                            <div className="text-[10px] text-red-400/70 font-mono">{f.student?.ERP || 'No ERP'}</div>
                                        </div>
                                        <div className="text-[9px] font-bold text-red-500 uppercase tracking-tighter bg-red-500/10 px-2 py-1 rounded">
                                            {f.error}
                                        </div>
                                    </div>
                                ))}
                                {results.failed.length === 0 && (
                                    <div className="text-center py-8 text-gray-600 text-sm italic font-medium">None</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminECertificates;
