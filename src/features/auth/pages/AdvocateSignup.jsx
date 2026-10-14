import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { City, Country, State } from 'country-state-city'
import { useNavigate } from 'react-router-dom'
import { useAdvocateSignup } from "../hooks/useAdvocateSignup";

import {
  API_BASE_URL,
} from "@shared/services/apiClient";
const AdvocateSignup = () => {
  const navigate = useNavigate()
  const { advocateData, setAdvocateData } = useAdvocateSignup()
  const formRef = useRef(null)
  const [formValid, setFormValid] = useState(false)
  const [attemptedContinue, setAttemptedContinue] = useState(false)
  const [formValues, setFormValues] = useState({
    fullName: advocateData.fullName || '',
    phone: advocateData.phone || '',
    gender: advocateData.gender || '', // Added gender state
    barCouncil: advocateData.barCouncil || '',
    aadhaar: advocateData.aadhaar || '',
    email: advocateData.email || '',
    password: advocateData.password || '',
    location: advocateData.location || { city: '', state: '', country: '' }
  })
  const [photoPreview, setPhotoPreview] = useState(advocateData.photo ? URL.createObjectURL(advocateData.photo) : '')
  const [selectedLanguages, setSelectedLanguages] = useState(advocateData.language || [])
  const languageOptions = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'Punjabi', 'Malayalam']

  // Track ISO codes for Country/State to drive the dependent dropdowns (API needs codes)
  // while saving full Names to the formValues (DB needs names for better display)
  const [selectedLocationCodes, setSelectedLocationCodes] = useState({
    countryCode: '',
    stateCode: ''
  })

  const countries = useMemo(() => Country.getAllCountries(), [])

  const states = useMemo(
    () => (selectedLocationCodes.countryCode ? State.getStatesOfCountry(selectedLocationCodes.countryCode) : []),
    [selectedLocationCodes.countryCode]
  )
  const cities = useMemo(
    () =>
      selectedLocationCodes.countryCode && selectedLocationCodes.stateCode
        ? City.getCitiesOfState(selectedLocationCodes.countryCode, selectedLocationCodes.stateCode)
        : [],
    [selectedLocationCodes.countryCode, selectedLocationCodes.stateCode]
  )

  // Restore codes from names if editing/back navigation
  useEffect(() => {
    if (advocateData.location?.country) {
      const country = countries.find(c => c.name === advocateData.location.country)
      if (country) {
        const countryCode = country.isoCode
        let stateCode = ''

        if (advocateData.location.state) {
          const countryStates = State.getStatesOfCountry(countryCode)
          const state = countryStates.find(s => s.name === advocateData.location.state)
          if (state) stateCode = state.isoCode
        }

        setSelectedLocationCodes({ countryCode, stateCode })
      }
    }
  }, [])

  // Phone OTP states
  const [otpOpen, setOtpOpen] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpStatus, setOtpStatus] = useState({ type: '', message: '' })
  const [otpLoading, setOtpLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Aadhaar OTP states
  const [aadharOtpOpen, setAadharOtpOpen] = useState(false)
  const [aadharVerified, setAadharVerified] = useState(false)
  const [aadharOtpValue, setAadharOtpValue] = useState('')
  const [aadharOtpStatus, setAadharOtpStatus] = useState({ type: '', message: '' })
  const [aadharOtpLoading, setAadharOtpLoading] = useState(false)
  const [aadharVerifyLoading, setAadharVerifyLoading] = useState(false)
  const [aadharCountdown, setAadharCountdown] = useState(0)

  // Format countdown timer
  const formatCountdown = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Phone countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Aadhaar countdown timer effect
  useEffect(() => {
    if (aadharCountdown > 0) {
      const timer = setTimeout(() => setAadharCountdown(aadharCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [aadharCountdown])

  // Close OTP modal instantly when phone is verified
  useEffect(() => {
    if (phoneVerified && showOtpModal) {
      setShowOtpModal(false)
      setOtpDigits(['', '', '', '', '', ''])
      setOtpStatus({ type: '', message: '' })
    }
  }, [phoneVerified, showOtpModal])

  // Handle OTP digit input
  const handleOtpDigitChange = (index, value) => {
    if (value.length > 1) return

    const newOtpDigits = [...otpDigits]
    newOtpDigits[index] = value
    setOtpDigits(newOtpDigits)

    if (value && index < 5) {
      const nextInput = document.getElementById(`advocate-otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }

    setOtpValue(newOtpDigits.join(''))
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`advocate-otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  // Helper to upload profile photo
  const uploadProfilePhoto = async (advocateId) => {
    if (!advocateData.photo) return null

    try {
      // 1. Get Presigned URL
      const uploadConfigResponse = await fetch(`${API_BASE_URL}/advocate/profile/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advocateId,
          filename: advocateData.photo.name,
        }),
      })
      const uploadConfig = await uploadConfigResponse.json()

      if (!uploadConfig.success || !uploadConfig.data?.uploadUrl) {
        throw new Error(uploadConfig.message || 'Failed to get upload URL')
      }

      // 2. Upload to S3
      const uploadResponse = await fetch(uploadConfig.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': advocateData.photo.type },
        body: advocateData.photo
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo to S3')
      }

      // 3. Update Profile URL in Backend
      const updateResponse = await fetch(`${API_BASE_URL}/advocate/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advocateId,
          profileUrl: uploadConfig.data.key
        })
      })

      if (!updateData.success) {
        throw new Error(updateData.message || 'Failed to update profile URL')
      }

      setFormValues(prev => ({ ...prev, profileUrl: uploadConfig.data.key }))

      return uploadConfig.data.key
    } catch (error) {
      console.error('Photo upload error:', error)
      throw error
    }
  }

  // Send OTP handler (Phone - Step 1 Submission)
  const handleSendOtp = async () => {
    const phone = formValues.phone.trim()
    if (!phone) {
      setOtpStatus({ type: 'error', message: 'Please enter a valid mobile number.' })
      return false
    }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setOtpStatus({ type: 'error', message: 'Please enter a valid 10-digit mobile number.' })
      return false
    }

    setOtpLoading(true)
    setOtpStatus({ type: '', message: '' })

    try {
      // Prepare Personal Details for Step 1 (matches backend schema exactly)
      const personalDetails = {
        fullName: formValues.fullName,
        phone: { number: phone }, // Plain 10-digit number; backend normalizePhone strips +91
        email: formValues.email,
        password: formValues.password,
        gender: formValues.gender?.toLowerCase(),
        aadharCard: {
          number: formValues.aadhaar.replace(/\s/g, ''),
          isVerified: aadharVerified
        },
        barCouncilRegistrationNumber: formValues.barCouncil,
        language: selectedLanguages.length ? selectedLanguages : ['English'],
        location: formValues.location
      }

      // Step 1: Submit Details & Trigger OTP → POST /advocate/onboarding
      const payload = {
        step: 1,
        advocateId: formValues.advocateId,
        action: 'save',
        personalDetails
      }

      const response = await fetch(`${API_BASE_URL}/advocate/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setOtpOpen(true)
        setCountdown(60)
        setOtpStatus({ type: 'success', message: 'OTP sent successfully! Check your phone.' })

        // Resolve advocateId from response or existing state
        const resolvedAdvocateId = data.advocateId || formValues.advocateId

        // Update advocateId in state if returned from backend
        if (data.advocateId) {
          setFormValues(prev => ({ ...prev, advocateId: data.advocateId }))
          setAdvocateData(prev => ({ ...prev, id: data.advocateId }))
        }

        // ✅ Start photo upload immediately in background while user enters OTP
        // Flow: GET presigned URL → PUT to S3 → PUT /advocate/profile (update DB)
        if (advocateData.photo && resolvedAdvocateId) {
          uploadProfilePhoto(resolvedAdvocateId)
            .then((key) => console.log('✅ Photo uploaded to S3 & DB updated:', key))
            .catch((err) => console.warn('⚠️ Background photo upload failed (non-blocking):', err))
        }

        return true
      } else {
        setOtpStatus({ type: 'error', message: data.message || 'Failed to send OTP.' })
        return false
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      setOtpStatus({ type: 'error', message: 'Network error. Please try again.' })
      return false
    } finally {
      setOtpLoading(false)
    }
  }

  // Verify OTP handler (Phone)
  const handleOtpVerify = async () => {
    const otp = otpValue.trim()
    if (!otp) {
      setOtpStatus({ type: 'error', message: 'Please enter the OTP.' })
      return
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setOtpStatus({ type: 'error', message: 'Please enter a valid 6-digit OTP.' })
      return
    }

    if (!formValues.advocateId) {
      setOtpStatus({ type: 'error', message: 'Session error. Please click "Continue" again.' })
      return
    }

    setVerifyLoading(true)
    setOtpStatus({ type: '', message: '' })

    try {
      const response = await fetch(`${API_BASE_URL}/advocate/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advocateId: formValues.advocateId,
          otp: otp,
        }),
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setPhoneVerified(true)
        setOtpStatus({ type: 'success', message: 'Phone number verified successfully!' })
        setCountdown(0)
        persistAndContinue(true)
      } else {
        setOtpStatus({ type: 'error', message: data.message || 'Invalid OTP. Please try again.' })
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      setOtpStatus({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setVerifyLoading(false)
    }
  }

  // Send Aadhaar OTP handler (UIDAI verification)
  const handleSendAadharOtp = async () => {
    const aadhaar = formValues.aadhaar.replace(/\s/g, '').trim()
    if (!aadhaar) {
      setAadharOtpStatus({ type: 'error', message: 'Please enter your Aadhaar number.' })
      return
    }
    if (aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
      setAadharOtpStatus({ type: 'error', message: 'Please enter a valid 12-digit Aadhaar number.' })
      return
    }
    // First digit cannot be 0 or 1 (UIDAI rule)
    if (aadhaar[0] === '0' || aadhaar[0] === '1') {
      setAadharOtpStatus({ type: 'error', message: 'Invalid Aadhaar number format.' })
      return
    }

    setAadharOtpLoading(true)
    setAadharOtpStatus({ type: '', message: '' })

    try {
      // Step 0: Create/Get Advocate ID (Draft)
      const step0Response = await fetch(`${API_BASE_URL}/advocate/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 0,
          personalDetails: {
            fullName: formValues.fullName,
            phone: { number: formValues.phone },
            email: formValues.email,
            gender: formValues.gender?.toLowerCase()
          }
        }),
      })
      const step0Data = await step0Response.json()

      if (!step0Response.ok || !step0Data.success) {
        throw new Error(step0Data.message || 'Failed to initialize registration.')
      }

      const advocateId = step0Data.advocateId
      // Store advocateId in state (adding to formValues for now, or could use separate state)
      setFormValues(prev => ({ ...prev, advocateId }))

      // Step 1: Send Aadhaar OTP using the advocateId
      const response = await fetch(`${API_BASE_URL}/aadhaar/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advocateId,
          aadharCardNumber: aadhaar,
          consent: 'Y'
        }),
      })
      const data = await response.json()

      if (response.ok) {
        setAadharOtpOpen(true)
        setAadharCountdown(60)
        // Store reference_id for verification
        setFormValues(prev => ({
          ...prev,
          aadhaarReferenceId: data.reference_id,
          // Update advocateId if not already set (just in case)
          advocateId: advocateId
        }))
        setAadharOtpStatus({ type: 'success', message: data.message || 'OTP sent to Aadhaar-linked mobile!' })
      } else {
        setAadharOtpStatus({ type: 'error', message: data.message || 'Failed to send OTP.' })
      }
    } catch (error) {
      console.error('Send Aadhaar OTP error:', error)
      setAadharOtpStatus({ type: 'error', message: error.message || 'Network error. Please try again.' })
    } finally {
      setAadharOtpLoading(false)
    }
  }

  // Verify Aadhaar OTP handler (UIDAI verification)
  const handleAadharOtpVerify = async () => {
    const otp = aadharOtpValue.trim()
    if (!otp) {
      setAadharOtpStatus({ type: 'error', message: 'Please enter the OTP.' })
      return
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setAadharOtpStatus({ type: 'error', message: 'Please enter a valid 6-digit OTP.' })
      return
    }

    if (!formValues.aadhaarReferenceId || !formValues.advocateId) {
      setAadharOtpStatus({ type: 'error', message: 'Session expired. Please click "Send OTP" again.' })
      return
    }

    setAadharVerifyLoading(true)
    setAadharOtpStatus({ type: '', message: '' })

    try {
      const aadhaar = formValues.aadhaar.replace(/\s/g, '').trim()
      const response = await fetch(`${API_BASE_URL}/aadhaar/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advocateId: formValues.advocateId,
          otp: String(otp),
          reference_id: String(formValues.aadhaarReferenceId),
          aadharCardNumber: aadhaar
        }),
      })
      const data = await response.json()

      console.log('Verify Aadhaar Response:', { status: response.status, data })

      // Backend always returns HTTP 200 — must check isAadhaarVerified flag
      // and data.message from the third-party UIDAI response
      const thirdPartyMessage = data?.data?.message || ''
      const isVerified = data?.isAadhaarVerified === true

      if (isVerified) {
        setAadharVerified(true)
        setAadharOtpStatus({ type: 'success', message: 'Aadhaar verified successfully!' })
        setAadharCountdown(0)

        // Automatically upload profile photo if selected
        if (advocateData.photo) {
          uploadProfilePhoto(formValues.advocateId)
            .then(() => console.log('Profile photo uploaded automatically'))
            .catch(err => console.error('Auto upload failed:', err))
        }
      } else {
        // Parse third-party message — e.g. "Invalid OTP", "OTP Expired", etc.
        const errorMsg = thirdPartyMessage
          ? thirdPartyMessage
          : data.message || 'Verification failed. Please try again.'
        setAadharVerified(false)
        setAadharOtpStatus({ type: 'error', message: errorMsg })
      }
    } catch (error) {
      console.error('Verify Aadhaar OTP error:', error)
      setAadharVerified(false)  // ✅ reset on network error
      setAadharOtpStatus({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setAadharVerifyLoading(false)
    }
  }

  const handleFormInput = () => {
    if (!formRef.current) return
    setFormValid(formRef.current.checkValidity())
  }

  // Handle File Change
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB')
        return
      }
      setAdvocateData(prev => ({ ...prev, photo: file }))
      const objectUrl = URL.createObjectURL(file)
      setPhotoPreview(objectUrl)
    }
  }

  const handleValueChange = (event) => {
    const { name, value } = event.target

    // Handle nested location updates
    if (name.startsWith('location.')) {
      const field = name.split('.')[1]
      setFormValues(prev => {
        const updatedLocation = { ...prev.location }

        if (field === 'country') {
          const countryObj = countries.find(c => c.isoCode === value)
          updatedLocation.country = countryObj ? countryObj.name : ''
          updatedLocation.state = ''
          updatedLocation.city = ''

          setSelectedLocationCodes(prevCodes => ({
            ...prevCodes,
            countryCode: value,
            stateCode: ''
          }))
        }
        else if (field === 'state') {
          const stateObj = states.find(s => s.isoCode === value)
          updatedLocation.state = stateObj ? stateObj.name : ''
          updatedLocation.city = ''

          setSelectedLocationCodes(prevCodes => ({
            ...prevCodes,
            stateCode: value
          }))
        }
        else {
          // City or other location fields
          updatedLocation[field] = value
        }

        return { ...prev, location: updatedLocation }
      })
      return
    }

    setFormValues((prev) => ({ ...prev, [name]: value }))
  }
  const toggleLanguage = (language) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((item) => item !== language) : [...prev, language]
    )
  }

  const persistAndContinue = (nextPhoneVerified = phoneVerified) => {
    const isValid =
      formValues.fullName.trim() &&
      formValues.phone.trim() &&
      nextPhoneVerified &&
      formValues.gender && // Added gender check
      formValues.barCouncil.trim() &&
      formValues.aadhaar.trim() &&
      aadharVerified &&
      formValues.email.trim() &&
      formValues.password.trim() &&
      formValues.location.city &&
      formValues.location.state &&
      formValues.location.country

    if (!isValid) return false

    // All form data is already saved to DB via /advocate/onboarding (step 1)
    // Only pass advocateId to parent — nothing else needed in state
    setAdvocateData({
      advocateId: formValues.advocateId,
      id: formValues.advocateId,
      photo: null  // Photo already uploaded to S3, no longer needed in memory
    })
    navigate('/advocate-signup/experience')
    return true
  }
  return (
    <div className="font-sans text-slate-600 antialiased min-h-screen lg:h-screen relative overflow-x-hidden lg:overflow-y-hidden flex items-center justify-center p-6 bg-slate-50">
      <div className="fixed inset-0 z-[-3] bg-slate-50"></div>

      <div className="max-w-7xl w-full grid lg:grid-cols-12 glass-gold-warm rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl min-h-[85vh] lg:min-h-0 lg:h-[calc(100vh-3rem)] bg-white">
        <div className="lg:col-span-4 p-12 bg-slate-50 relative flex flex-col justify-between overflow-hidden border-r border-slate-200 lg:h-full lg:min-h-0">
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
                  Advocate <br />
                  <span className="text-amber-600 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-500">
                    Identity Setup
                  </span>
                </h1>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Welcome to Step 1 of your elite professional onboarding. We require these details to establish your
                  verified presence on our premium legal network.
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-amber-50 transition-colors">
                    <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-amber-600">
                      person_search
                    </span>
                  </div>
                  <div>
                    <h4 className="text-slate-900 text-sm font-semibold">Personal Identity</h4>
                    <p className="text-xs text-slate-500">Legal name and contact verification</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-slate-500">domain_verification</span>
                  </div>
                  <div>
                    <h4 className="text-slate-500 text-sm font-semibold">Professional Credentials</h4>
                    <p className="text-xs text-slate-600">Bar Council and practice history</p>
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
                Trusted by Legal Experts
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 p-6 sm:p-8 bg-white flex flex-col lg:h-full lg:min-h-0 lg:overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-3 flex-1 relative">
                <div className="step-indicator active">1</div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Identity</span>
                <div className="absolute top-4 left-[60%] w-[80%] h-[1px] bg-slate-200"></div>
              </div>
              <div className="flex flex-col items-center gap-3 flex-1 relative">
                <div className="step-indicator pending">2</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professional</span>
                <div className="absolute top-4 left-[60%] w-[80%] h-[1px] bg-slate-200"></div>
              </div>
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="step-indicator pending">3</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto w-full">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-bold hover:bg-slate-100 transition-all"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              User
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-amber-500 bg-amber-50 text-amber-600 text-sm font-bold transition-all"
            >
              <span className="material-symbols-outlined text-lg">balance</span>
              Advocate
            </button>
          </div>
          <div className="max-w-2xl mx-auto w-full flex-grow flex flex-col justify-center">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal &amp; Professional Identity</h2>
                <p className="text-xs text-slate-500">
                  Please provide your official information as per government records.
                </p>
              </div>
              <form
  ref={formRef}
  onInput={handleFormInput}
  className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2
    [&_input]:outline-none
    [&_input]:focus:outline-none
    [&_input]:focus-visible:outline-none
    [&_input]:focus:ring-0
    [&_select]:outline-none
    [&_select]:focus:outline-none
    [&_select]:focus-visible:outline-none
    [&_select]:focus:ring-0
    [&_button]:outline-none
    [&_button]:focus:outline-none
    [&_button]:focus-visible:outline-none
    [&_button]:focus-visible:ring-0"
>
                {/* Photo Upload Section */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full border border-amber-200 bg-amber-50 overflow-hidden flex items-center justify-center">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-amber-500 text-2xl">
                          person
                        </span>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">upload</span>
                      Upload Photo
                      <input
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>

                  </div>
                </div>


                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Full Name (As per Aadhaar) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      person
                    </span>
                    <input
                      className="input-luxury h-10 pl-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-amber-500 text-sm"
                      placeholder="e.g. Advocate Siddharth Mehta"
                      type="text"
                      name="fullName"
                      value={formValues.fullName}
                      onChange={handleValueChange}
                      required
                    />
                  </div>
                  {attemptedContinue && !formValues.fullName.trim() && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Full name is required.
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Phone Number <span className="text-amber-500">*</span>
                    {phoneVerified && (
                      <span className="ml-2 text-emerald-600 normal-case font-semibold">✓ Verified</span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                      +91
                    </span>
                    <input
                      className={`input-luxury h-10 pl-12 pr-16 bg-slate-50 text-slate-900 focus:border-amber-500 focus:ring-amber-500 text-sm ${phoneVerified ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
                        }`}
                      placeholder="98765 43210"
                      type="tel"
                      name="phone"
                      value={formValues.phone}
                      onChange={handleValueChange}
                      disabled={phoneVerified}
                      required
                    />
                    {phoneVerified && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </span>
                    )}
                  </div>
                  {otpStatus.message && (
                    <div
                      className={`text-[10px] font-semibold ${otpStatus.type === 'error' ? 'text-red-400' : 'text-emerald-400'
                        }`}
                    >
                      {otpStatus.message}
                    </div>
                  )}
                  {attemptedContinue && !formValues.phone.trim() && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Mobile number is required.
                    </p>
                  )}
                  {attemptedContinue && formValues.phone.trim() && !phoneVerified && !otpOpen && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Please verify your mobile number with OTP.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Gender <span className="text-amber-500">*</span>
                  </label>
                  <select
                    className="input-luxury w-full h-10 px-3 bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-amber-500 appearance-none"
                    name="gender"
                    value={formValues.gender}
                    onChange={handleValueChange}
                    required
                  >
                    <option value="" className="text-slate-400">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {attemptedContinue && !formValues.gender && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Gender is required.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Bar Council ID <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      badge
                    </span>
                    <input
                      className="input-luxury pl-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-amber-500"
                      placeholder="e.g. D/1234/2023"
                      type="text"
                      name="barCouncil"
                      value={formValues.barCouncil}
                      onChange={handleValueChange}
                      required
                    />
                  </div>
                  {attemptedContinue && !formValues.barCouncil.trim() && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Bar Council ID is required.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Aadhaar Number <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-grow">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                        fingerprint
                      </span>
                      <input
                        className="input-luxury pl-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-amber-500"
                        placeholder="0000 0000 0000"
                        type="text"
                        name="aadhaar"
                        value={formValues.aadhaar}
                        onChange={handleValueChange}
                        disabled={aadharVerified}
                        required
                      />
                    </div>
                    {!aadharVerified && (
                      <button
                        type="button"
                        onClick={handleSendAadharOtp}
                        disabled={aadharOtpLoading || aadharCountdown > 0}
                        className="shrink-0 h-12 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {aadharOtpLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span> Sending...
                          </span>
                        ) : aadharCountdown > 0 ? (
                          `Resend (${formatCountdown(aadharCountdown)})`
                        ) : aadharOtpOpen ? (
                          'Resend OTP'
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    )}
                    {aadharVerified && (
                      <div className="shrink-0 h-12 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verified
                      </div>
                    )}
                  </div>
                  {aadharOtpOpen && !aadharVerified && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          className="input-luxury h-10 text-xs bg-slate-50 border-slate-200 text-slate-900"
                          placeholder="Enter 6-digit OTP"
                          type="text"
                          maxLength={6}
                          value={aadharOtpValue}
                          onChange={(event) => setAadharOtpValue(event.target.value.replace(/\D/g, ''))}
                          required
                        />
                        <button
                          type="button"
                          onClick={handleAadharOtpVerify}
                          disabled={aadharVerifyLoading || aadharOtpValue.length !== 6}
                          className="h-10 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {aadharVerifyLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                    </div>
                  )}
                  {aadharOtpStatus.message && (
                    <div
                      className={`text-[10px] font-semibold flex items-center gap-1 ${aadharOtpStatus.type === 'error' ? 'text-red-400' : 'text-emerald-500'
                        }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {aadharOtpStatus.type === 'error' ? 'error' : 'check_circle'}
                      </span>
                      {aadharOtpStatus.message}
                    </div>
                  )}
                  {attemptedContinue && !formValues.aadhaar.trim() && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Aadhaar number is required.
                    </p>
                  )}
                  {attemptedContinue && formValues.aadhaar.trim() && !aadharVerified && !aadharOtpOpen && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Please verify your Aadhaar with OTP.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      mail
                    </span>
                    <input
                      className="input-luxury pl-12 bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-amber-500"
                      placeholder="siddharth@mehtalegal.com"
                      type="email"
                      name="email"
                      value={formValues.email}
                      onChange={handleValueChange}
                      required
                    />
                  </div>
                  {attemptedContinue && !formValues.email.trim() && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Email address is required.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Password <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      lock
                    </span>
                    <input
  className="input-luxury pl-12 bg-slate-50 border-slate-200 text-slate-900 outline-none focus:border-amber-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
  placeholder="••••••••••••"
  type="password"
  name="password"
  value={formValues.password}
  onChange={handleValueChange}
  required
/>
                  </div>
                  {attemptedContinue && !formValues.password.trim() && (
                    <p className="text-[10px] font-semibold text-red-400">
                      Password is required.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`chip-select ${selectedLanguages.includes(lang) ? 'active' : ''}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">If none selected, English will be used by default.</p>
                </div>

                {/* Location Section */}
                <div className="md:col-span-2 space-y-1 pt-1">
                  <h3 className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Location Details</h3>

                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-3">
                      {/* Country */}
                      <select
                        className="input-luxury w-full h-10 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                        name="location.country"
                        value={selectedLocationCodes.countryCode}
                        onChange={handleValueChange}
                        required
                      >
                        <option value="" className="bg-white text-slate-500">Country</option>
                        {countries.map((country) => (
                          <option key={country.isoCode} value={country.isoCode} className="bg-white text-slate-900">
                            {country.name}
                          </option>
                        ))}
                      </select>

                      {/* State */}
                      <select
                        className="input-luxury w-full h-10 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                        name="location.state"
                        value={selectedLocationCodes.stateCode}
                        onChange={handleValueChange}
                        disabled={!states.length}
                        required
                      >
                        <option value="" className="bg-white text-slate-500">State</option>
                        {states.map((state) => (
                          <option key={state.isoCode} value={state.isoCode} className="bg-white text-slate-900">
                            {state.name}
                          </option>
                        ))}
                      </select>

                      {/* City */}
                      <select
                        className="input-luxury w-full h-10 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500"
                        name="location.city"
                        value={formValues.location.city}
                        onChange={handleValueChange}
                        disabled={!cities.length}
                        required
                      >
                        <option value="" className="bg-white text-slate-500">City</option>
                        {cities.map((city) => (
                          <option key={city.name} value={city.name} className="bg-white text-slate-900">
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </form>

              <div className="pt-4">
                <button
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs uppercase tracking-widest transition-all shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  disabled={
                    !formValues.fullName.trim() ||
                    !formValues.phone.trim() ||
                    !formValues.barCouncil.trim() ||
                    !formValues.aadhaar.trim() ||
                    !aadharVerified ||
                    !formValues.email.trim() ||
                    !formValues.password.trim() ||
                    !formValues.location.country ||
                    !formValues.location.state ||
                    !formValues.location.city
                  }
                  onClick={async () => {
                    setAttemptedContinue(true)

                    // Check if phone is not verified
                    if (formValues.phone.trim() && !phoneVerified) {
                      // ✅ Open modal instantly, API runs in background
                      setShowOtpModal(true)
                      handleSendOtp()
                      return
                    }

                    persistAndContinue(phoneVerified)
                  }}
                >
                  Continue to Professional Details
                  <span className="material-symbols-outlined font-bold group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
                {attemptedContinue &&
                  (!formValues.fullName.trim() || !formValues.phone.trim() || !phoneVerified ||
                    !formValues.barCouncil.trim() || !formValues.aadhaar.trim() || !aadharVerified ||
                    !formValues.email.trim() || !formValues.password.trim()) && (
                    <div className="mt-3 text-[11px] font-semibold text-red-400 text-center">
                      Please fill all required fields and verify both phone number and Aadhaar before continuing.
                    </div>
                  )}
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
        </div >
      </div >


      <div className="fixed top-0 right-0 w-[40vw] h-[40vw] bg-amber-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[40vw] h-[40vw] bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl text-amber-600">phone_iphone</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Verify Your Number</h3>
              <p className="text-sm text-slate-600">
                Enter the 6-digit OTP sent to <span className="font-semibold text-amber-600">+91 {formValues.phone}</span>
              </p>
            </div>

            {otpLoading && !otpStatus.message ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-slate-500">Sending OTP...</p>
              </div>
            ) : (
              <>
                {/* OTP Input Boxes */}
                <div className="flex justify-center gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`advocate-otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all bg-slate-50"
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleOtpVerify}
                  disabled={verifyLoading || otpDigits.join('').length !== 6}
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Verifying...
                    </span>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                {/* Resend OTP */}
                {!phoneVerified && (
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-xs text-slate-500">
                        Resend OTP in <span className="font-semibold text-amber-600">{formatCountdown(countdown)}</span>
                      </p>
                    ) : (
                      <button
                        onClick={async () => {
                          // Use specific resend endpoint if we have advocateId
                          if (formValues.advocateId) {
                            try {
                              setOtpLoading(true)
                              const response = await fetch(`${API_BASE_URL}/advocate/resend-phone-otp`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ advocateId: formValues.advocateId }),
                              })
                              const data = await response.json()
                              if (response.ok && data.success) {
                                setCountdown(60)
                                setOtpStatus({ type: 'success', message: 'OTP resent successfully!' })
                              } else {
                                setOtpStatus({ type: 'error', message: data.message || 'Failed to resend OTP.' })
                              }
                            } catch (error) {
                              console.error('Resend OTP error:', error)
                              setOtpStatus({ type: 'error', message: 'Network error.' })
                            } finally {
                              setOtpLoading(false)
                            }
                          } else {
                            // Fallback to initial send if no ID yet (shouldn't happen here usually)
                            await handleSendOtp()
                          }
                        }}
                        disabled={otpLoading}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50"
                      >
                        {otpLoading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                )}

                {/* Status Message */}
                {otpStatus.message && otpOpen && (
                  <div
                    className={`text-xs font-semibold text-center ${otpStatus.type === 'error' ? 'text-red-500' : 'text-emerald-500'
                      }`}
                  >
                    {otpStatus.message}
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowOtpModal(false)
                    setOtpDigits(['', '', '', '', '', ''])
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </>
            )}
          </div>
        </div>
      )
      }
    </div >
  )
}

export default AdvocateSignup
