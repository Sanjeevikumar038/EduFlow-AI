import React, { useState, useEffect } from 'react';

const CodingDashboard = () => {
    const [progress, setProgress] = useState({ easySolved: 0, mediumSolved: 0, hardSolved: 0, totalSolved: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ easySolved: 0, mediumSolved: 0, hardSolved: 0 });

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/coding/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setProgress(data);
            setEditData({
                easySolved: data.easySolved || 0,
                mediumSolved: data.mediumSolved || 0,
                hardSolved: data.hardSolved || 0
            });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const total = parseInt(editData.easySolved) + parseInt(editData.mediumSolved) + parseInt(editData.hardSolved);
        
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/coding/update', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...editData, totalSolved: total })
        });
        
        if (res.ok) {
            setIsEditing(false);
            fetchProgress();
        }
    };

    const maxProblems = 500;
    const progressPercent = Math.min((progress.totalSolved / maxProblems) * 100, 100);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Coding Progress</h2>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                    {isEditing ? 'Cancel' : 'Update Stats'}
                </button>
            </div>

            {isEditing && (
                <form onSubmit={handleUpdate} className="glass-card p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-emerald-400 mb-1">Easy</label>
                        <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" 
                            value={editData.easySolved} onChange={e => setEditData({...editData, easySolved: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                        <label className="block text-amber-400 mb-1">Medium</label>
                        <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" 
                            value={editData.mediumSolved} onChange={e => setEditData({...editData, mediumSolved: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                        <label className="block text-red-400 mb-1">Hard</label>
                        <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" 
                            value={editData.hardSolved} onChange={e => setEditData({...editData, hardSolved: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">Save</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-emerald-400 mb-2">{progress.easySolved}</div>
                    <div className="text-slate-300">Easy Solved</div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-amber-400 mb-2">{progress.mediumSolved}</div>
                    <div className="text-slate-300">Medium Solved</div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-red-400 mb-2">{progress.hardSolved}</div>
                    <div className="text-slate-300">Hard Solved</div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                    <svg className="absolute w-full h-full opacity-10" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray={`${progressPercent * 2.82} 282`} strokeLinecap="round" className="text-blue-500 transform -rotate-90 origin-center transition-all duration-1000"/>
                    </svg>
                    <div className="text-5xl font-bold text-blue-400 mb-2 relative z-10">{progress.totalSolved}</div>
                    <div className="text-slate-300 relative z-10">Total Solved</div>
                </div>
            </div>
        </div>
    );
};

export default CodingDashboard;
