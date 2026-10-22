import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Clock,
  AlertTriangle,
  Mail,
  Building2,
  FileCheck,
  Inbox,
  ExternalLink
} from 'lucide-react';
import { ScreenId, UserRole, User } from '../../types';
import { playNotificationChime, playSuccessSound, playKeyClickSound } from '../../utils/audioPlayer';
import { BackButton } from '../common/BackButton';

interface SignInScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  setCurrentUserRole?: (role: UserRole) => void;
  onLoginSuccess?: (user?: User) => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  setCurrentScreen,
  setCurrentUserRole,
  onLoginSuccess
}) => {
  const [authStep, setAuthStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);

  // 6-digit OTP States
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState<number>(300); // 5 minutes
  const [remainingAttempts, setRemainingAttempts] = useState<number>(3);
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 5-minute Countdown Timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authStep === 2 && otpTimer > 0 && !isOtpExpired) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setIsOtpExpired(true);
            setErrorMsg('Verification code expired (5-minute security timeout). Please request a new code.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, otpTimer, isOtpExpired]);

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

  // Step 1: Submit Credentials to Server
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid institutional agency email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();
      setIsVerifying(false);

      if (!response.ok) {
        setErrorMsg(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      // If server granted direct authenticated session
      if (data.status === 'AUTHENTICATED' && data.sessionToken) {
        localStorage.setItem('auth_session_token', data.sessionToken);
        if (data.user) {
          localStorage.setItem('deepfake_detector_user', JSON.stringify(data.user));
          if (setCurrentUserRole && data.user.role) {
            setCurrentUserRole(data.user.role as UserRole);
          }
        }
        playSuccessSound();
        if (onLoginSuccess) onLoginSuccess(data.user);
        setCurrentScreen('dashboard');
        return;
      }

      // If server dispatched OTP via configured delivery provider
      if (data.status === 'OTP_SENT') {
        setAuthStep(2);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpTimer(300);
        setRemainingAttempts(3);
        setIsOtpExpired(false);
        setResendCooldown(45);
        setErrorMsg('');
        setSuccessMsg(data.message || 'A verification code has been dispatched to your email address.');
        playNotificationChime();

        setTimeout(() => {
          digitInputRefs.current[0]?.focus();
        }, 200);
        return;
      }

      setErrorMsg('Unexpected response from authentication server.');
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMsg('Network error: Unable to connect to Deepfake Audio Detector authentication service.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();
      setIsVerifying(false);

      if (response.ok) {
        setOtpTimer(300);
        setIsOtpExpired(false);
        setRemainingAttempts(3);
        setResendCooldown(45);
        setSuccessMsg(data.message || 'A fresh verification code has been dispatched to your email address.');
        playNotificationChime();
      } else {
        setErrorMsg(data.error || 'Failed to resend verification code.');
      }
    } catch (e) {
      setIsVerifying(false);
      setErrorMsg('Network error while resending verification code.');
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (isOtpExpired || remainingAttempts <= 0) return;

    const val = value.replace(/[^0-9]/g, '');
    if (!val) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    playKeyClickSound();
    const lastChar = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = lastChar;
    setOtpDigits(newDigits);

    if (index < 5 && lastChar) {
      digitInputRefs.current[index + 1]?.focus();
    }

    // Auto verify when all 6 digits entered
    if (index === 5 && lastChar) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        executeServerOtpVerification(fullCode);
      }
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Validate OTP with Server
  const executeServerOtpVerification = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpDigits.join('');

    if (isOtpExpired) {
      setErrorMsg('The 5-minute security window has expired. Please click "Resend Code".');
      return;
    }

    if (remainingAttempts <= 0) {
      setErrorMsg('Maximum 3 attempts exceeded. Please click "Resend Code" for a new OTP.');
      return;
    }

    if (finalCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: finalCode
        })
      });

      const data = await response.json();
      setIsVerifying(false);

      if (!response.ok) {
        setErrorMsg(data.error || 'Incorrect verification code. Please check your email.');
        const newAttempts = remainingAttempts - 1;
        setRemainingAttempts(newAttempts);
        return;
      }

      // Successful verification
      playSuccessSound();
      if (data.sessionToken) {
        localStorage.setItem('auth_session_token', data.sessionToken);
      }
      if (data.user) {
        localStorage.setItem('deepfake_detector_user', JSON.stringify(data.user));
        if (setCurrentUserRole && data.user.role) {
          setCurrentUserRole(data.user.role as UserRole);
        }
      }

      if (onLoginSuccess) onLoginSuccess(data.user);
      setCurrentScreen('dashboard');
    } catch (err) {
      setIsVerifying(false);
      setErrorMsg('Network error during OTP validation. Please try again.');
    }
  };

  return (
    <div id="signin-screen" className="min-h-full bg-[#F4F8F6] text-[#112217] flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-4xl bg-white border border-[#0A3D24]/15 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Panel: ALFADetect Forensic Enclave Branding */}
        <div className="lg:col-span-5 bg-[#062817] p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#0A3D24] text-white">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0A3D24] flex items-center justify-center text-white shadow-lg border border-[#C88A2C]/30">
                <Shield className="w-6 h-6 text-[#C88A2C]" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight block font-serif-title">ALFADetect</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C88A2C] font-bold">
                  NATIONAL FORENSIC ENCLAVE
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-serif-title">
                Secure Operator Authentication
              </h2>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Cryptographic authentication portal for accredited forensic laboratories, federal prosecutors, and judiciary personnel.
              </p>
            </div>

            {/* Security Standard Accreditations */}
            <div className="space-y-3 pt-3 border-t border-emerald-900/50 text-xs">
              <div className="flex items-center space-x-2.5 text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>FRE 902(13)/(14) Self-Authenticating</span>
              </div>
              <div className="flex items-center space-x-2.5 text-emerald-200">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SWGDE Digital Audio Standards</span>
              </div>
              <div className="flex items-center space-x-2.5 text-emerald-200">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ISO/IEC 27037 Chain-of-Custody</span>
              </div>
              <div className="flex items-center space-x-2.5 text-emerald-200">
                <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>FIPS 140-3 Cryptographic Integrity</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-900/50 text-[10px] text-emerald-400/70 font-mono flex items-center justify-between">
            <span>TERMINAL ID: ALFA-SEC-4096</span>
            <span>AES-256 / SHA-256 SEAL</span>
          </div>
        </div>

        {/* Right Panel: Login / OTP Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="flex items-center justify-between">
            <BackButton onClick={() => setCurrentScreen('landing')} label="Back to Portal" variant="pill" />
            <span className="text-[10px] font-mono text-[#54665C]">FRE 902 Enclave</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#112217]">
              {authStep === 1 ? 'Operator Sign In' : 'Multi-Factor Email Verification'}
            </h2>
            <p className="text-xs text-[#54665C]">
              {authStep === 1
                ? 'Enter your institutional credentials to authenticate your session.'
                : 'Enter the verification code sent to your registered institutional address.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FEF2F2] border border-[#B91C1C]/30 text-[#B91C1C] text-xs rounded-xl flex items-center space-x-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#F0FDF4] border border-[#15803D]/30 text-[#15803D] text-xs rounded-xl flex items-center space-x-2 font-medium">
              <CheckCircle className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {authStep === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#54665C]">Institutional Agency Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@fbi.gov"
                  className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-3 text-[#112217] focus:outline-hidden focus:border-[#0A3D24] shadow-2xs text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#54665C]">Password / Token PIN</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl p-3 text-[#112217] focus:outline-hidden focus:border-[#0A3D24] shadow-2xs text-xs"
                />
              </div>

              {/* Zero-Trust Role Guidance */}
              <div className="p-3 bg-[#F8FAF9] border border-[#E1EBE4] rounded-xl text-[11px] text-[#54665C] leading-relaxed">
                <strong className="text-[#0A3D24]">Cryptographic Access Control:</strong> Your role and case assignments are verified server-side based on institutional credentials. Self-selection is disabled under FRE 902.
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-[#54665C]">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded-sm text-[#0A3D24] focus:ring-[#0A3D24]"
                  />
                  <span>Remember this workstation</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('request-access')}
                  className="text-[#0A3D24] hover:text-[#062817] font-bold"
                >
                  Request Credentials
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-[#0A3D24] hover:bg-[#062817] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all mt-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials on Server...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-3.5 bg-[#F0FDF4] border border-[#15803D]/30 rounded-2xl flex items-start space-x-3 text-xs text-[#15803D]">
                <Mail className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Security Verification Code Dispatched</p>
                  <p className="text-[11px] text-[#54665C] mt-0.5">
                    A cryptographically secure 6-digit code was dispatched to <strong>{email}</strong> via configured provider.
                  </p>
                </div>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex justify-between gap-2 max-w-sm mx-auto">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (digitInputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className="w-12 h-14 bg-[#F8FAF9] border-2 border-[#E1EBE4] focus:border-[#0A3D24] rounded-xl text-center text-xl font-mono font-bold text-[#112217] focus:outline-hidden shadow-2xs"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-[#54665C] font-mono">
                <span>Expires in: <strong className="text-[#112217]">{formatTimer(otpTimer)}</strong></span>
                <span>Attempts: <strong className="text-[#112217]">{remainingAttempts}/3</strong></span>
              </div>

              {/* Actions & Resend */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E1EBE4] text-xs">
                <button
                  type="button"
                  onClick={() => setAuthStep(1)}
                  className="text-[#54665C] hover:text-[#112217] font-semibold"
                >
                  Change Email / Password
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isVerifying}
                  className="text-[#0A3D24] hover:text-[#062817] disabled:opacity-40 font-medium"
                >
                  {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                </button>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthStep(1)}
                  className="w-1/2 py-2.5 bg-white border border-[#E1EBE4] hover:bg-slate-50 text-[#112217] font-bold text-xs rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => executeServerOtpVerification()}
                  disabled={isVerifying}
                  className="w-1/2 py-2.5 bg-[#0A3D24] hover:bg-[#062817] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Complete Sign In</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
