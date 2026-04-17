import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { UploadCloud, FileType2 } from 'lucide-react';

const UploadCertificate = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileValidationErr, setFileValidationErr] = useState('');

  const [formData, setFormData] = useState({
    club_id: '',
    position: '',
    event_date: '',
    file: null
  });

  useEffect(() => {
    // Fetch clubs for dropdown
    api.get('/clubs').then(res => setClubs(res.data.data)).catch(() => toast.error('Failed to load clubs'));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5000000) {
      setFileValidationErr('File is too large (max 5MB)');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFileValidationErr('Only JPG, PNG and PDF files allowed');
      return;
    }

    setFileValidationErr('');
    setFormData({ ...formData, file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.club_id || !formData.position || !formData.event_date || !formData.file) {
      return toast.error('Please fill in all fields and select a file.');
    }

    // Build FormData since we are transporting binary file
    const uploadData = new FormData();
    uploadData.append('club_id', formData.club_id);
    uploadData.append('event_name', formData.event_name);
    uploadData.append('position', formData.position);
    uploadData.append('event_date', formData.event_date);
    uploadData.append('file', formData.file);

    try {
      setLoading(true);
      const loadingToast = toast.loading('Uploading certificate securely to server...', { style: { background: '#111827', color: '#fff' } });
      
      await api.post('/certificates/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.dismiss(loadingToast);
      toast.success('Certificate submitted for review!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 animate-fade-in">
      <div className="bg-[#111827] border border-white/5 p-6 md:p-8 rounded-3xl shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20 transform rotate-3">
            <UploadCloud size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Upload Certificate</h1>
          <p className="text-gray-400 mt-2">Submit your proof of achievement for verification</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-gray-400">Club Selection</label>
            <select 
              className="w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 transition-colors"
              value={formData.club_id}
              onChange={(e)=>setFormData({...formData, club_id: e.target.value})}
            >
              <option value="" disabled>Select the organizing club...</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-gray-400">Event Name</label>
            <input 
              type="text" 
              placeholder="e.g. CodeRush 2024, Web Design Workshop..."
              className="w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 transition-colors"
              value={formData.event_name}
              onChange={(e)=>setFormData({...formData, event_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase text-gray-400">Your Position</label>
              <select 
                className="w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 transition-colors uppercase tracking-wider text-sm"
                value={formData.position}
                onChange={(e)=>setFormData({...formData, position: e.target.value})}
              >
                <option value="" disabled className="normal-case">Select Rank...</option>
                <option value="winner">Winner (1st)</option>
                <option value="runnerup1">Runner Up (2nd)</option>
                <option value="runnerup2">Runner Up (3rd)</option>
                <option value="participant">Participant</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase text-gray-400">Event Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 transition-colors"
                value={formData.event_date}
                onChange={(e)=>setFormData({...formData, event_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-gray-400">Proof Document</label>
            <div className="relative group cursor-pointer">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className={`w-full border-2 border-dashed ${formData.file ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 bg-[#0B0F19] group-hover:border-indigo-500/50'} rounded-2xl p-8 flex flex-col items-center justify-center transition-all px-4 text-center`}>
                <FileType2 size={36} className={`mb-3 ${formData.file ? 'text-indigo-400' : 'text-gray-500 group-hover:text-indigo-400'}`} />
                {formData.file ? (
                  <p className="text-white font-bold text-sm tracking-wide">{formData.file.name}</p>
                ) : (
                  <p className="text-gray-400 font-medium text-sm">Drag and drop file, or <span className="text-indigo-400">click to browse</span></p>
                )}
                <p className="text-xs text-gray-600 mt-2 font-mono uppercase tracking-widest">PDF, JPG, PNG up to 5MB</p>
              </div>
            </div>
            {fileValidationErr && <p className="text-red-400 text-xs font-bold mt-2 flex items-center">{fileValidationErr}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading || fileValidationErr}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'Uploading File...' : 'Submit Achievement'}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default UploadCertificate;
