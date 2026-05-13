import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Clock, 
  ShieldCheck,
  Monitor,
  Smartphone,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

const SettingsPage = () => {
  const [retention, setRetention] = useState('7');
  const [customRetention, setCustomRetention] = useState('');
  const [askEachTime, setAskEachTime] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const settings = await api.user.getSettings();
      if (settings) {
        if (['1', '7', '30'].includes(String(settings.retention_days))) {
          setRetention(String(settings.retention_days));
        } else {
          setRetention('custom');
          setCustomRetention(String(settings.retention_days));
        }
        setAskEachTime(settings.ask_each_time || false);
      }
      const fetchedDevices = await api.user.getDevices();
      setDevices(fetchedDevices || []);
    } catch (error) {
      console.error('Failed to fetch settings data');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      let days = parseInt(retention);
      if (retention === 'custom') {
        days = parseInt(customRetention);
        if (isNaN(days) || days < 1) {
           setMessage({ type: 'error', text: 'Please enter a valid number of days.' });
           setIsSaving(false);
           return;
        }
      }
      
      await api.user.updateSettings({
        retention_days: days,
        ask_each_time: askEachTime
      });
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDevice = async (id: number) => {
    try {
      await api.user.deleteDevice(id);
      setDevices(devices.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete device');
    }
  };

  const handleDeleteAllItems = async () => {
    if (window.confirm('Are you absolutely sure? This will delete all items in your inbox permanently.')) {
      try {
        await api.user.deleteAllItems();
        setMessage({ type: 'success', text: 'All items deleted.' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete items.' });
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inbox" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-rose-600 transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </header>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-10">
        {/* Retention Settings */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-slate-800">
            <Clock className="w-5 h-5 text-teal-600" />
            <h2 className="font-semibold text-lg">Retention & Privacy</h2>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Default item lifespan</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  value={retention}
                  onChange={(e) => setRetention(e.target.value)}
                >
                  <option value="1">1 Day</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="custom">Custom</option>
                </select>
                {retention === 'custom' && (
                  <input 
                    type="number"
                    min="1"
                    placeholder="Days"
                    value={customRetention}
                    onChange={(e) => setCustomRetention(e.target.value)}
                    className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                )}
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="text-xs text-slate-500">How long items stay in your inbox before being permanently deleted.</p>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-slate-700">Ask me each time</p>
                <p className="text-xs text-slate-500">Show expiration options when saving a new item.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={askEachTime}
                  onChange={(e) => setAskEachTime(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Active Sessions */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-slate-800">
            <Monitor className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-lg">Active Sessions</h2>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm">
            {devices.map((device, index) => (
              <div key={device.id} className={`flex items-center justify-between p-4 ${index !== devices.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    {device.device_name.toLowerCase().includes('mobile') || device.device_name.toLowerCase().includes('ios') || device.device_name.toLowerCase().includes('android') ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{device.device_name}</p>
                    <p className="text-xs text-slate-500">Last seen: {formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteDevice(device.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ))}
            {devices.length === 0 && (
              <p className="p-4 text-sm text-slate-500 text-center">No active sessions found.</p>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4 pt-6">
          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-800">
              <Trash2 className="w-5 h-5" />
              <h2 className="font-semibold text-lg">Danger Zone</h2>
            </div>
            <p className="text-sm text-rose-700/70">Once you delete your data, there is no going back. Please be certain.</p>
            <button 
              onClick={handleDeleteAllItems}
              className="bg-white border border-rose-200 text-rose-600 px-6 py-2 rounded-lg font-semibold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm"
            >
              Delete all items now
            </button>
          </div>
        </section>

        <footer className="text-center pt-8">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-3 h-3" />
            End-to-end encrypted storage
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SettingsPage;