import React from 'react';

const ClientPublicProfile = ({ user, onBack }) => {
    if (!user) return null;

    // Derived data
    // Derived data
    const locationStr = (user.location && (user.location.city || user.location.state))
        ? `${user.location.city || ''}${user.location.city && user.location.state ? ', ' : ''}${user.location.state || ''}`
        : 'India'; // Default to a cleaner country fallback or just 'India' if nothing specific

    const memberSince = new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    // Use passed consultationCount if available (from dashboard calculation), otherwise fallback to array length
    const consultationCount = typeof user.consultationCount === 'number' ? user.consultationCount : (user.consultations?.length || 0);

    const stats = {
        consultations: consultationCount,
        cases: user.cases?.length || 0,
    };

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="mb-8 flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors group px-4 py-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm"
            >
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Hero Card */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] relative overflow-hidden group border border-slate-200 shadow-xl shadow-slate-200/50">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>

                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="size-40 md:size-48 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl shadow-slate-200">
                                    {user?.profileUrl || user?.personalDetails?.profileUrl || user?.avatar?.url ? (
                                        <img
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            src={user?.profileUrl || user?.personalDetails?.profileUrl || user?.avatar?.url}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-6xl text-slate-400">person</span>
                                        </div>
                                    )}
                                </div>
                                {user.isPremium && (
                                    <div className="absolute -bottom-3 -right-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
                                        <div className="bg-amber-500 rounded-full p-1.5 shadow-lg shadow-amber-500/30">
                                            <span className="material-symbols-outlined text-white text-sm font-bold block">workspace_premium</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                            <span className="material-symbols-outlined text-sm">person</span> Client Profile
                                        </span>
                                        {user.aadhaar && user.aadhaar.trim() && (
                                            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                                <span className="material-symbols-outlined text-sm">verified_user</span> Verified User
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight font-serif">{user.name || 'Client Name'}</h1>
                                    <p className="text-lg text-slate-500 font-medium">
                                        Member since {memberSince}
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm flex items-center gap-2 shadow-sm font-medium">
                                        <span className="material-symbols-outlined text-amber-500 text-lg">location_on</span>
                                        {locationStr}
                                    </span>
                                    {user.email && (
                                        <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm flex items-center gap-2 shadow-sm font-medium">
                                            <span className="material-symbols-outlined text-amber-500 text-lg">mail</span>
                                            {user.email}
                                        </span>
                                    )}
                                    {user.phone && (
                                        <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm flex items-center gap-2 shadow-sm font-medium">
                                            <span className="material-symbols-outlined text-amber-500 text-lg">call</span>
                                            {user.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                        <div className="bg-white p-6 rounded-3xl flex flex-col items-center justify-center text-center group hover:bg-slate-50 hover:shadow-xl transition-all duration-300 border border-slate-200 shadow-lg shadow-slate-200/40">
                            <span className="text-3xl md:text-4xl font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
                                {stats.consultations}
                            </span>
                            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">forum</span>
                                Consultations
                            </span>
                        </div>
                        <div className="bg-white p-6 rounded-3xl flex flex-col items-center justify-center text-center group hover:bg-slate-50 hover:shadow-xl transition-all duration-300 border border-slate-200 shadow-lg shadow-slate-200/40">
                            <span className="text-3xl md:text-4xl font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
                                {stats.cases}
                            </span>
                            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">folder_open</span>
                                Active Cases
                            </span>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50">
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-3">
                            About
                        </h2>
                        <div className="space-y-6 text-slate-600 leading-relaxed text-base md:text-lg">
                            <p>
                                {user.bio ? user.bio : `${user.name} is a valued client on Advocate Connect. They have been a member since ${memberSince} and are actively engaging with legal professionals to resolve their queries.`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Right Column */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-28 space-y-6">
                        {/* Quick Actions Card */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Actions</h3>
                            <p className="text-slate-500 text-sm mb-6">Manage your engagement with this client.</p>

                            <button
                                className="w-full py-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-base transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-not-allowed opacity-60"
                                disabled
                            >
                                <span className="material-symbols-outlined text-lg">history</span>
                                <span>View History</span>
                                <span className="text-[10px] ml-auto bg-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold">COMING SOON</span>
                            </button>

                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <p className="text-xs text-slate-400 text-center">
                                    Need to report an issue? <span className="text-amber-600 cursor-pointer hover:underline font-semibold">Contact Support</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientPublicProfile;
