import React, { useState, useEffect } from 'react';
import { Users, Music, ArrowLeft, Database, RefreshCw } from 'lucide-react';
import { BackendService } from '../services/backendService';

const AdminDashboard = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const usersData = await BackendService.getAllUsers();
        const playlistsData = await BackendService.getAllPlaylists();
        setUsers(usersData || []);
        setPlaylists(playlistsData || []);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6 text-white">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-xl">
                            <Database className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Admin Database View</h1>
                            <p className="text-slate-400">Manage Users & Playlists (SQLite)</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchData} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors" title="Refresh Data">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={onBack} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium flex items-center gap-2 transition-colors">
                            <ArrowLeft className="w-5 h-5" /> Back to App
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Users className="w-5 h-5" /> Registered Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('playlists')}
                        className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'playlists' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Music className="w-5 h-5" /> Saved Playlists ({playlists.length})
                    </button>
                </div>

                {/* Content */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden min-h-[500px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50">
                            <tr>
                                {activeTab === 'users' ? (
                                    <>
                                        <th className="p-4 text-slate-400 font-medium">ID</th>
                                        <th className="p-4 text-slate-400 font-medium">Name</th>
                                        <th className="p-4 text-slate-400 font-medium">Email</th>
                                        <th className="p-4 text-slate-400 font-medium">Country</th>
                                        <th className="p-4 text-slate-400 font-medium">Registered At</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="p-4 text-slate-400 font-medium">ID</th>
                                        <th className="p-4 text-slate-400 font-medium">User Email</th>
                                        <th className="p-4 text-slate-400 font-medium">Playlist Name</th>
                                        <th className="p-4 text-slate-400 font-medium">Type</th>
                                        <th className="p-4 text-slate-400 font-medium">Tracks Count</th>
                                        <th className="p-4 text-slate-400 font-medium">Created At</th>
                                    </>
                                )}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {activeTab === 'users' ? (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 font-mono text-slate-500">#{user.id}</td>
                                        <td className="p-4 font-medium">{user.firstName} {user.lastName}</td>
                                        <td className="p-4 text-blue-400">{user.email}</td>
                                        <td className="p-4 flex items-center gap-2">
                                            <img src={`https://flagcdn.com/w20/${user.country?.toLowerCase()}.png`} className="rounded-sm" alt="" onError={(e) => e.target.style.display = 'none'} />
                                            {user.country}
                                        </td>
                                        <td className="p-4 text-slate-400">{new Date(user.created_at).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                playlists.map(pl => {
                                    const tracks = JSON.parse(pl.tracks || '[]');
                                    return (
                                        <tr key={pl.id} className="hover:bg-slate-700/50 transition-colors">
                                            <td className="p-4 font-mono text-slate-500">#{pl.id}</td>
                                            <td className="p-4 text-blue-400">{pl.user_email}</td>
                                            <td className="p-4 font-medium">{pl.name || 'Untitled'}</td>
                                            <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${pl.type === 'custom' ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'}`}>
                                                        {pl.type?.toUpperCase()}
                                                    </span>
                                            </td>
                                            <td className="p-4">{tracks.length} tracks</td>
                                            <td className="p-4 text-slate-400">{new Date(pl.created_at).toLocaleString()}</td>
                                        </tr>
                                    )
                                })
                            )}
                            </tbody>
                        </table>
                        {((activeTab === 'users' && users.length === 0) || (activeTab === 'playlists' && playlists.length === 0)) && (
                            <div className="p-12 text-center text-slate-500">
                                No data found in the database yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;