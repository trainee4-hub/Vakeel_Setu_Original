import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdvocateSignup } from "../hooks/useAdvocateSignup";

import {
  API_BASE_URL,
} from "@shared/services/apiClient";
const AdvocateExperience = () => {
  const navigate = useNavigate()
  const { advocateData, setAdvocateData } = useAdvocateSignup()
  const defaultAreas = [
    'Criminal Defence',
    'Corporate (Business)',
    'Family',
    'Personal Injury',
    'Employment & Labor',
    'Estate Planning',
    'Intellectual Property',
    'Real Estate',
    'Tax Lawyer',
    'Immigration',
    'Bankruptcy',
    'Civil Litigation',
  ]

  const categoryEnumMap = {
    'Criminal Defence': 'criminal_defence',
    'Corporate (Business)': 'corporate_business',
    'Family': 'family',
    'Personal Injury': 'personal_injury',
    'Employment & Labor': 'employment_labor',
    'Estate Planning': 'estate_planning',
    'Intellectual Property': 'intellectual_property',
    'Real Estate': 'real_estate',
    'Tax Lawyer': 'tax_lawyer',
    'Immigration': 'immigration',
    'Bankruptcy': 'bankruptcy',
    'Civil Litigation': 'civil_litigation'
  }

  const [practiceAreas, setPracticeAreas] = useState(advocateData.practiceAreas || [])
  const [yearsExperience, setYearsExperience] = useState(advocateData.experienceYears || 1)
  const [casesSolved, setCasesSolved] = useState(advocateData.casesSolved || '')
  const [courts, setCourts] = useState(advocateData.courts || [])
  const [professionalSummary, setProfessionalSummary] = useState(advocateData.professionalSummary || '')
  const [attemptedContinue, setAttemptedContinue] = useState(false)

  const toggleArea = (area) => {
    setPracticeAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]
    )
  }

  const toggleCourt = (court) => {
    setCourts((prev) => (prev.includes(court) ? prev.filter((item) => item !== court) : [...prev, court]))
  }

  const experienceTrackStyle = useMemo(() => {
    const min = 1
    const max = 50
    const percent = ((yearsExperience - min) / (max - min)) * 100
    return {
      background: `linear-gradient(90deg, rgba(245, 158, 11, 0.95) ${percent}%, rgba(148, 163, 184, 0.45) ${percent}%)`,
    }
  }, [yearsExperience])
  return (
    <div className="font-sans text-slate-600 antialiased min-h-screen relative overflow-x-hidden flex items-center justify-center p-6 bg-slate-50">
      <div className="fixed inset-0 z-[-3] bg-slate-50"></div>

      <div className="max-w-7xl w-full grid lg:grid-cols-12 glass-gold-warm rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl min-h-[85vh] bg-white">
        <div className="lg:col-span-4 p-12 bg-slate-50 relative flex flex-col justify-between overflow-hidden border-r border-slate-200">
          <div className="absolute top-[-10%] right-[-10%] size-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] size-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="relative flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-amber-200">
                <span className="material-symbols-outlined text-amber-600" style={{ fontSize: 24 }}>
                  gavel
                </span>
              </div>
              <span className="text-slate-900 text-xl font-bold tracking-tight">
                Advocate <span className="text-amber-500/90">Connect</span>
              </span>
            </div>
            <div className="space-y-10">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
                  Professional <br />
                  <span className="text-amber-600 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-500">
                    Excellence
                  </span>
                </h1>
                <p className="text-slate-500 leading-relaxed">
                  Showcase your expertise to premium clients. Your professional history defines your visibility on our
                  platform.
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  </div>
                  <div>
                    <h4 className="text-emerald-700 text-sm font-semibold">Personal Identity</h4>
                    <p className="text-xs text-slate-500">Legal name and contact verification</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="size-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-amber-600">domain_verification</span>
                  </div>
                  <div>
                    <h4 className="text-slate-900 text-sm font-semibold">Professional Credentials</h4>
                    <p className="text-xs text-slate-500">Bar Council and practice history</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-slate-500">workspace_premium</span>
                  </div>
                  <div>
                    <h4 className="text-slate-500 text-sm font-semibold">Elite Membership</h4>
                    <p className="text-xs text-slate-500">Final background check &amp; access grant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img
                  alt="User"
                  className="size-8 rounded-full border-2 border-white object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCW1VK73Cvi72lfAYDrVluIsVNtbpxol2MASBiOwIvoeH_0x89uU86JQ5-vu1fdZgLOdWlb0irkgVF2pozWlni2ATes_RW_hGhHux8Gi23saC93UNfajq7DZqTen50YHvxN7M2ryO9X9piWk-sq6siG3SJNezLNfdlc-H5u07PViAON2ZeESglF-bmgq38boR--gIMu7zKSHR8icF2-oL9Q2mt3LFwmYDVqTjK0gNALbDdqx-2JtmH8PUcgP2phLDouziHDjB1NVY"
                />
                <img
                  alt="User"
                  className="size-8 rounded-full border-2 border-white object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCyruiKXRj5w27HrH0ppuOX6Pe_xDdcSSHq-XofHVLzxu0Fx4i0susaf5FlxTWcSnL1QxEJrGhcP-U3D2R3LCp-N3HELBqLSONQATmhxiIAEemacSCKWSCUx9ZhkQQHUm4zspf2uqzx3uMTPrAVKF356mO88dxM8JTxdxLpVCmU1SKdrB_Y5fFOepAtwnwXQyPjANigXN30tndTHxxPBZIiNeJTJxNRqb6gyGEKV6WJYtHI7FfgSFgal3Ko63zrtM3aZIx8rObtSw"
                />
                <img
                  alt="User"
                  className="size-8 rounded-full border-2 border-white object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdRP2mLBWwfxFh8BoHIggpgNm-JGynDeNkYFXVy-t9eoxjVVxBzQQ7T1Z6EwOEe7e-a_q0bPTEz4fne6FStyljgb4KOt86dAqCP290ySXlcwCVr4pda7exA9VMpqhg6RLX7TIJ3KHkOPSuSguX2btLUnkqk6HJEUaAsKZDKfqWMt1-6neg8E52F7Sbp_RLjXCi5iHdKhy8Wx_VcpR9HiMdTtrAP0cp2maQdUe79bkdiOsx3mQRGwlQ5DKP8wcfxac0PP3ERc_pJPk"
                />
              </div>
              <p className="text-[10px] text-slate-500 font-bold tracking-[0.1em] uppercase">
                Vetted by the Elite Council
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 p-12 bg-white flex flex-col overflow-y-auto">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-3 flex-1 relative">
                <div className="step-indicator completed">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Identity</span>
                <div className="absolute top-4 left-[60%] w-[80%] h-[1px] bg-emerald-500/50"></div>
              </div>
              <div className="flex flex-col items-center gap-3 flex-1 relative">
                <div className="step-indicator active">2</div>
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest text-glow-gold">
                  Experience
                </span>
                <div className="absolute top-4 left-[60%] w-[80%] h-[1px] bg-slate-200"></div>
              </div>
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="step-indicator pending">3</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-10 max-w-md mx-auto w-full">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-bold hover:bg-slate-100 transition-all"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              Citizen
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-amber-500 bg-amber-50 text-amber-600 text-sm font-bold transition-all"
            >
              <span className="material-symbols-outlined text-lg">balance</span>
              Advocate
            </button>
          </div>
          <div className="max-w-2xl mx-auto w-full flex-grow">
            <div className="space-y-10">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Professional Experience</h2>
                <p className="text-slate-500">Define your legal mastery and professional background.</p>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Practice Areas <span className="text-amber-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {defaultAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArea(area)}
                        className={`chip-select ${practiceAreas.includes(area) ? 'active' : ''}`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                  {attemptedContinue && practiceAreas.length === 0 && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Please select at least one practice area.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                        Years of Experience <span className="text-amber-500">*</span>
                      </label>
                      <span className="text-amber-600 font-bold text-sm">{yearsExperience} Years</span>
                    </div>
                    <input
                      className="range-luxury range-dot w-full"
                      min="1"
                      max="50"
                      type="range"
                      value={yearsExperience}
                      onChange={(event) => setYearsExperience(Number(event.target.value))}
                      style={experienceTrackStyle}
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                      <span>1 YEAR</span>
                      <span>50+ YEARS</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Cases Solved <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        className="input-luxury pr-3 w-full bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-amber-500"
                        placeholder="e.g. 250"
                        type="number"
                        value={casesSolved}
                        onChange={(e) => setCasesSolved(e.target.value)}
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">

                      </span>
                    </div>
                    {attemptedContinue && !casesSolved.trim() && (
                      <p className="text-[10px] font-semibold text-red-400">
                        Cases solved is required.
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Courts Practiced In <span className="text-amber-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Supreme Court of India',
                      'Delhi High Court',
                      'District & Sessions Courts',
                      'Consumer Forum',
                    ].map((court) => {
                      const active = courts.includes(court)
                      return (
                        <button
                          key={court}
                          type="button"
                          onClick={() => toggleCourt(court)}
                          className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${active
                            ? 'border-amber-500/40 bg-amber-50 text-amber-900'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-500/30'
                            }`}
                        >
                          <span className="text-sm">{court}</span>
                          <span
                            className={`material-symbols-outlined text-sm ${active ? 'text-amber-600' : 'text-slate-400'
                              }`}
                          >
                            {active ? 'check_circle' : 'circle'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {attemptedContinue && courts.length === 0 && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Please select at least one court.
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Professional Summary <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 hover:border-amber-500/40 focus:border-amber-500/60 focus:bg-white focus:outline-none focus:ring-0 transition-colors resize-none"
                    placeholder="A brief elevator pitch of your legal persona for potential clients..."
                    value={professionalSummary}
                    onChange={(e) => setProfessionalSummary(e.target.value)}
                  ></textarea>
                  {attemptedContinue && !professionalSummary.trim() && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Professional summary is required.
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-6 flex flex-col gap-4">
                <button
                  className="w-full h-16 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-widest transition-all shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 group"
                  type="button"
                  onClick={async () => {
                    setAttemptedContinue(true)
                    const isValid =
                      practiceAreas.length > 0 &&
                      casesSolved.trim() &&
                      courts.length > 0 &&
                      professionalSummary.trim()
                    if (isValid) {
                      setAttemptedContinue(true) // Disable while loading if needed, though state handles it
                      // Disable while loading if needed, though state handles it

                      try {
                        const advocateId = advocateData.advocateId
                        // Map selected practice areas to backend enums
                        const mappedPracticeAreas = practiceAreas.map(area => categoryEnumMap[area] || area)

                        const response = await fetch(`${API_BASE_URL}/advocate/onboarding`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            step: 2,
                            advocateId: advocateId,
                            professionalCredentials: {
                              practiceAreas: mappedPracticeAreas,
                              yearsOfExperience: yearsExperience,
                              casesSolved: Number(casesSolved),
                              courtsPracticedIn: courts,
                              professionalSummary: professionalSummary
                            }
                          })
                        })

                        const data = await response.json()
                        if (response.ok && data.success) {
                          // All data saved to DB — only pass advocateId forward
                          setAdvocateData({
                            advocateId: advocateId,
                            id: advocateId,
                            photo: null
                          })
                          navigate('/advocate-signup/pricing')
                        } else {
                          alert(data.message || "Failed to save details. Please try again.")
                        }
                      } catch (error) {
                        console.error("Step 2 Error:", error)
                        alert("Network error. Please try again.")
                      }
                    }
                  }}
                >
                  Continue to Pricing
                  <span className="material-symbols-outlined font-bold group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
                {attemptedContinue && (
                  practiceAreas.length === 0 ||
                  !casesSolved.trim() ||
                  courts.length === 0 ||
                  !professionalSummary.trim()
                ) && (
                    <div className="text-[11px] font-semibold text-red-400 text-center">
                      Please fill all required fields before continuing.
                    </div>
                  )}
                <button
                  className="w-full py-4 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                  type="button"
                  onClick={() => navigate('/advocate-signup')}
                >
                  Return to Identity Details
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
            <button type="button" onClick={() => navigate('/login', { state: { role: 'advocate' } })} className="hover:text-amber-600 transition-colors">
              Go to Login
            </button>
            <span className="size-1 rounded-full bg-slate-300"></span>
            <button type="button" onClick={() => navigate('/')} className="hover:text-amber-600 transition-colors">
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="fixed top-0 right-0 w-[40vw] h-[40vw] bg-amber-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[40vw] h-[40vw] bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
    </div>
  )
}

export default AdvocateExperience
