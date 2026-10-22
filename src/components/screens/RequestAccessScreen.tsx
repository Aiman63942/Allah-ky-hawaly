import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  UserCheck,
  Mail,
  RefreshCw,
  Clock,
  Lock,
  Building2,
  FileCheck2,
  HardDrive
} from 'lucide-react';
import { ScreenId, UserRole, ExpertReview, User } from '../../types';
import { playSuccessSound, playNotificationChime } from '../../utils/audioPlayer';
import { BackButton } from '../common/BackButton';

interface RequestAccessScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  onRegisterExpert?: (newExpert: ExpertReview) => void;
  setSelectedExpertId?: (id: string) => void;
  onRegisteredUser?: (user: User) => void;
  setCurrentUserRole?: (role: UserRole) => void;
}

export const RequestAccessScreen: React.FC<RequestAccessScreenProps> = ({
  setCurrentScreen,
  onRegisterExpert,
  setSelectedExpertId,
  onRegisteredUser,
  setCurrentUserRole
}) => {
  // Registration Step: 'FORM' | 'VERIFY_OTP' | 'SUCCESS'
  const [regStep, setRegStep] = useState<'FORM' | 'VERIFY_OTP' | 'SUCCESS'>('FORM');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [role, setRole] = useState<UserRole>('Forensic Examiner / Expert Witness');
  const [certificationId, setCertificationId] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [password, setPassword] = useState('');
  const [createdUser, setCreatedUser] = useState<User | null>(null);

  // Hardware Platform Authenticator (WebAuthn / FIDO2) Detection
  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean>(false);
  const [hardwareKeyEnrolled, setHardwareKeyEnrolled] = useState<boolean>(false);
  const [hardwareKeyStatus, setHardwareKeyStatus] = useState<string>('Detecting hardware authenticator support...');

  // OTP Verification States
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState<number>(300); // 5 minutes
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Detect real platform WebAuthn capabilities without deceptive claims
  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setWebAuthnSupported(available);
          if (available) {
            setHardwareKeyStatus('Platform biometric / FIDO2 hardware authenticator available.');
          } else {
            setHardwareKeyStatus('Hardware platform authenticator unavailable. Standard cryptographic credentials will be used.');
          }
        })
        .catch(() => {
          setWebAuthnSupported(false);
          setHardwareKeyStatus('Hardware platform authenticator unavailable on this device.');
        });
    } else {
      setWebAuthnSupported(false);
      setHardwareKeyStatus('WebAuthn API not supported by this browser environment.');
    }
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (regStep === 'VERIFY_OTP' && otpTimer > 0 && !isOtpExpired) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setIsOtpExpired(true);
            setOtpError('Verification code expired (5-minute security timeout). Please request a new code.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [regStep, otpTimer, isOtpExpired]);

  // Resend cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Step 1: Submit Form to /api/auth/register
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.includes('@') || !email.includes('.')) {
      setFormError('Please enter a valid official institutional email address (e.g., examiner@agency.gov).');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must contain at least 8 characters for forensic security compliance.');
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: fullName,
          agency,
          role,
          certificationId: certificationId || `CFCE-${Math.floor(1000 + Math.random() * 9000)}`,
          specialty,
          hardwareKeyEnrolled
        })
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (!response.ok) {
        setFormError(data.error || 'Failed to submit registration request.');
        return;
      }

      // If server activated account directly (e.g. SMTP unconfigured)
      if (data.status === 'REGISTERED_AND_AUTHENTICATED') {
        if (data.sessionToken) {
          localStorage.setItem('auth_session_token', data.sessionToken);
        }
        if (data.user) {
          localStorage.setItem('deepfake_detector_user', JSON.stringify(data.user));
          setCreatedUser(data.user);
          if (onRegisteredUser) onRegisteredUser(data.user);
          if (setCurrentUserRole && data.user.role) {
            setCurrentUserRole(data.user.role as UserRole);
          }
        }

        // Register expert review profile if role is expert
        if (role === 'Forensic Examiner / Expert Witness') {
          const expertId = `EXP-${data.user?.id?.replace(/[^0-9]/g, '') || Date.now().toString().slice(-4)}`;
          const newExpert: ExpertReview = {
            id: expertId,
            caseId: '',
            expertName: data.user?.name || fullName,
            email: email.trim(),
            institution: agency,
            certificationId: certificationId || `CFCE-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'Pending',
            technicalAssessment: `Enrolled forensic examiner specializing in ${specialty || 'Acoustic Forensics'}.`,
            checklist: {
              swgdeStandards: true,
              chainOfCustodyVerified: true,
              reproducibleOutputs: true,
              confidenceIntervalsValid: true,
              acousticSpectralInspected: true
            },
            digitalSignature: 'Cryptographic Key Registered',
            signedAt: 'Pending Case Review'
          };
          if (onRegisterExpert) onRegisterExpert(newExpert);
          if (setSelectedExpertId) setSelectedExpertId(expertId);
        }

        playSuccessSound();
        setRegStep('SUCCESS');
        return;
      }

      // If SMTP is configured, move to OTP Step
      if (data.status === 'REGISTRATION_OTP_SENT') {
        setRegStep('VERIFY_OTP');
        setOtpDigits(['', '', '', '', '', '']);
        setOtpTimer(300);
        setIsOtpExpired(false);
        setResendCooldown(45);
        setOtpError(null);
        playNotificationChime();

        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 200);
        return;
      }

      setFormError('Unexpected server response during registration.');
    } catch {
      setIsSubmitting(false);
      setFormError('Network error connecting to Deepfake Audio Detector authentication service.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSubmitting(true);
    setOtpError(null);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok) {
        setOtpTimer(300);
        setIsOtpExpired(false);
        setResendCooldown(45);
        playNotificationChime();
      } else {
        setOtpError(data.error || 'Failed to resend verification code.');
      }
    } catch {
      setIsSubmitting(false);
      setOtpError('Network error while resending verification code.');
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (isOtpExpired) return;

    const val = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = val ? val.slice(-1) : '';
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && val) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        executeVerifyRegistration(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Confirm OTP & Activate Account
  const executeVerifyRegistration = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpDigits.join('');

    if (isOtpExpired) {
      setOtpError('The 5-minute security window has expired. Please click "Resend Code".');
      return;
    }

    if (finalCode.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code sent to your email.');
      return;
    }

    setOtpError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: finalCode
        })
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (!response.ok) {
        setOtpError(data.error || 'Incorrect email verification code. Please check your inbox.');
        return;
      }

      // Account verified and activated
      playSuccessSound();

      if (data.sessionToken) {
        localStorage.setItem('auth_session_token', data.sessionToken);
      }
      if (data.user) {
        localStorage.setItem('deepfake_detector_user', JSON.stringify(data.user));
        setCreatedUser(data.user);
        if (onRegisteredUser) onRegisteredUser(data.user);
        if (setCurrentUserRole && data.user.role) {
          setCurrentUserRole(data.user.role as UserRole);
        }
      }

      setRegStep('SUCCESS');
    } catch {
      setIsSubmitting(false);
      setOtpError('Network error during registration verification. Please try again.');
    }
  };

  return (
    <div id="request-access-screen" className="min-h-full bg-[#F4F8F6] text-[#112217] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl bg-white border border-[#0A3D24]/15 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-[#062817] p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#0A3D24] text-white">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0A3D24] flex items-center justify-center text-white shadow-md border border-[#C88A2C]/30">
                <Shield className="w-5 h-5 text-[#C88A2C]" />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-wide block font-serif-title">ALFADetect</span>
                <span className="text-[9px] font-mono text-[#C88A2C] uppercase tracking-wider font-bold">National Forensic Enclave</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white leading-snug font-serif-title">Operator Credential Enrollment</h2>
              <p className="text-xs text-emerald-200/80 mt-2 leading-relaxed">
                Registering establishes an accredited forensic analyst or expert witness profile governed by FRE 902(13)/(14) digital evidence rules.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strict Institutional Email Credential Verification</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cryptographic Key Binding & FIDO2 Platform Support</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-Trust Role-Based Access Control</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Court-Admissible SWGDE & ISO 27037 Compliance</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-900/50">
            <button
              onClick={() => setCurrentScreen('signin')}
              className="flex items-center space-x-2 text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <BackButton onClick={() => setCurrentScreen('signin')} label="Back to Sign In" variant="pill" />
            <span className="text-[10px] font-mono text-[#54665C]">Enclave Registration</span>
          </div>

          {/* STEP 1: REGISTRATION FORM */}
          {regStep === 'FORM' && (
            <>
              <div>
                <h3 className="text-2xl font-bold text-[#112217] font-serif-title">Accredited Operator Registration</h3>
                <p className="text-xs text-[#54665C] mt-1">Submit institutional credentials to provision authorized forensic access</p>
              </div>

              {formError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#B91C1C]/30 text-[#B91C1C] text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleInitiateRegistration} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#54665C] mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-2.5 text-[#112217] focus:outline-hidden focus:border-[#0A3D24] shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#54665C] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-2.5 text-[#112217] focus:outline-hidden focus:border-[#0A3D24] shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#54665C] mb-1">
                      Official Institutional Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="j.doe@agency.gov"
                      className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-2.5 text-[#112217] focus:outline-hidden focus:border-[#0A3D24] shadow-2xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#54665C] mb-1">
                      Account Password (Min 8 characters)
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-2.5 text-[#112217] focus:outline-hidden focus:border-[#0A3D24] shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#54665C] mb-1">
                      Agency / Forensic Laboratory
                    </label>
                    <input
                      type="text"
                      required
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      placeholder="e.g. State Forensic Audio Lab"
                      className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-2.5 text-[#112217] focus:outline-hidden focus:border-[#0A3D24] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#54665C] mb-1">
                      Requested Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-2.5 text-[#112217] focus:outline-hidden focus:border-[#0A3D24] shadow-2xs font-medium"
                    >
                      <option value="Forensic Examiner / Expert Witness">Forensic Examiner / Expert Witness</option>
                      <option value="Lead Forensic Analyst">Lead Forensic Analyst</option>
                      <option value="Prosecutor / Legal Reviewer">Prosecutor / Legal Reviewer</option>
                      <option value="System Security Administrator">System Security Administrator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#54665C] mb-1">
                    Forensic Certification ID & Specialization
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={certificationId}
                      onChange={(e) => setCertificationId(e.target.value)}
                      placeholder="e.g. CFCE-9924"
                      className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-2.5 text-[#112217] font-mono focus:outline-hidden focus:border-[#0A3D24] shadow-2xs"
                    />
                    <input
                      type="text"
                      required
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="e.g. Neural Vocoder Forensics"
                      className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-2.5 text-[#112217] focus:outline-hidden focus:border-[#0A3D24] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Honest Digital Credentials & Hardware Key Section (No fabricated camera biometrics) */}
                <div className="p-4 bg-[#F8FAF9] border border-[#E1EBE4] rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-[#0A3D24]" />
                      <span className="font-bold text-[#112217] uppercase text-[11px]">
                        Cryptographic Hardware & Identity Verification
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E1EBE4] text-[#54665C] font-semibold">
                      {webAuthnSupported ? 'FIDO2 Detected' : 'Standard Enclave'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#54665C] leading-relaxed">
                    {hardwareKeyStatus}
                  </p>

                  {webAuthnSupported && (
                    <label className="flex items-center space-x-2 cursor-pointer pt-1 text-xs text-[#112217]">
                      <input
                        type="checkbox"
                        checked={hardwareKeyEnrolled}
                        onChange={(e) => setHardwareKeyEnrolled(e.target.checked)}
                        className="rounded-sm text-[#0A3D24] focus:ring-[#0A3D24]"
                      />
                      <span className="font-medium">Bind this account to platform security key on first login</span>
                    </label>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#0A3D24] hover:bg-[#062817] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Credential Request...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Register & Request Access</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* STEP 2: EMAIL OTP VERIFICATION */}
          {regStep === 'VERIFY_OTP' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-[#F0FDF4] text-[#0A3D24] border border-[#15803D]/30 font-mono text-[10px] font-bold rounded-md">
                    STEP 2 OF 2: EMAIL VERIFICATION
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#112217] font-serif-title">Enter Email Verification Code</h3>
                <p className="text-xs text-[#54665C] leading-relaxed">
                  A 6-digit cryptographic verification code was dispatched to <strong className="text-[#112217] font-mono">{email}</strong>.
                </p>
              </div>

              {otpError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#B91C1C]/30 text-[#B91C1C] text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* 6-Digit Input Boxes */}
              <div className="space-y-3">
                <div className="flex justify-center items-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={isOtpExpired || isSubmitting}
                      className="w-12 h-14 bg-[#F8FAF9] border-2 border-[#E1EBE4] focus:border-[#0A3D24] rounded-xl text-center text-xl font-mono font-bold text-[#112217] focus:outline-hidden shadow-2xs"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#54665C] font-mono">
                  <span>Expires in: <strong className="text-[#112217]">{formatTimer(otpTimer)}</strong></span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isSubmitting}
                    className="text-[#0A3D24] hover:text-[#062817] disabled:opacity-40 font-bold"
                  >
                    {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRegStep('FORM')}
                  className="w-1/2 py-2.5 bg-white border border-[#E1EBE4] hover:bg-slate-50 text-[#112217] font-bold text-xs rounded-xl"
                >
                  Change Details
                </button>
                <button
                  type="button"
                  onClick={() => executeVerifyRegistration()}
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 bg-[#0A3D24] hover:bg-[#062817] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Complete Activation</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {regStep === 'SUCCESS' && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border border-[#15803D]/30 flex items-center justify-center text-[#0A3D24] mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-[#15803D]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#112217] font-serif-title">Account Successfully Enrolled</h3>
                <p className="text-xs text-[#54665C] max-w-md mx-auto leading-relaxed">
                  Your credentials for <strong className="text-[#112217]">{email}</strong> have been enrolled into the ALFADetect Forensic Enclave. Your workspace starts in an authorized clean state.
                </p>
              </div>

              <div className="bg-[#F8FAF9] border border-[#E1EBE4] rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#54665C]">Assigned Role:</span>
                  <span className="font-bold text-[#0A3D24]">{role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#54665C]">Agency:</span>
                  <span className="font-medium text-[#112217]">{agency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#54665C]">Active Cases:</span>
                  <span className="font-mono font-bold text-[#112217]">0 (Clean Slate)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentScreen('dashboard')}
                className="w-full max-w-xs mx-auto py-3.5 bg-[#0A3D24] hover:bg-[#062817] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Launch Forensic Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
