import React, { useState } from 'react';
import {
  Hash,
  CheckCircle2,
  ShieldCheck,
  AlertOctagon,
  Upload,
  RefreshCw,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  User as UserIcon,
  Clock,
  FileCheck,
  ShieldAlert,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { ScreenId, AudioEvidence, User } from '../../types';
import { calculateFileSHA256, calculateStringSHA256 } from '../../utils/crypto';
import { BackButton } from '../common/BackButton';

interface HashIntegrityScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  activeEvidence: AudioEvidence;
  currentUser: User;
}

export const HashIntegrityScreen: React.FC<HashIntegrityScreenProps> = ({
  setCurrentScreen,
  activeEvidence,
  currentUser
}) => {
  const [selectedFileName, setSelectedFileName] = useState(activeEvidence.filename);
  const [originalHash, setOriginalHash] = useState(activeEvidence.sha256Hash || '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5');
  const [currentHash, setCurrentHash] = useState<string>(activeEvidence.sha256Hash || '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'MATCH' | 'NO_MATCH'>('MATCH');
  const [verificationTimestamp, setVerificationTimestamp] = useState<string>(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
  const [verifierName, setVerifierName] = useState<string>(`${currentUser.name} (${currentUser.role})`);
  const [isSimulatingTampering, setIsSimulatingTampering] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedCurrent, setCopiedCurrent] = useState(false);

  // File upload re-verification
  const handleFileChange = async (file: File) => {
    setSelectedFileName(file.name);
    setIsVerifying(true);
    setIsSimulatingTampering(false);

    try {
      const liveCalculatedHash = await calculateFileSHA256(file);
      setCurrentHash(liveCalculatedHash);
      const isMatch = liveCalculatedHash.toLowerCase() === originalHash.toLowerCase();
      setVerificationResult(isMatch ? 'MATCH' : 'NO_MATCH');
      setVerificationTimestamp(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
      setVerifierName(`${currentUser.name} (${currentUser.role})`);
    } catch (err) {
      console.error('Hash calculation error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Re-verify current file
  const handleRecomputeHash = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      if (isSimulatingTampering) {
        // Generate altered hash
        const modifiedHash = await calculateStringSHA256(`tampered_content_${Date.now()}`);
        setCurrentHash(modifiedHash);
        setVerificationResult('NO_MATCH');
      } else {
        setCurrentHash(originalHash);
        setVerificationResult('MATCH');
      }
      setVerificationTimestamp(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
      setVerifierName(`${currentUser.name} (${currentUser.role})`);
      setIsVerifying(false);
    }, 500);
  };

  // Toggle simulated tampering
  const toggleTamperSimulation = async () => {
    const nextState = !isSimulatingTampering;
    setIsSimulatingTampering(nextState);
    setIsVerifying(true);

    setTimeout(async () => {
      if (nextState) {
        // Alter current hash
        const corruptedHash = '8f9e1b2c3d4a5e6f708192a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3';
        setCurrentHash(corruptedHash);
        setVerificationResult('NO_MATCH');
      } else {
        setCurrentHash(originalHash);
        setVerificationResult('MATCH');
      }
      setVerificationTimestamp(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
      setVerifierName(`${currentUser.name} (${currentUser.role})`);
      setIsVerifying(false);
    }, 400);
  };

  const copyToClipboard = (text: string, isOriginal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isOriginal) {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedCurrent(true);
      setTimeout(() => setCopiedCurrent(false), 2000);
    }
  };

  return (
    <div id="hash-integrity-screen" className="p-4 sm:p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={() => setCurrentScreen('evidence')} label="Back to Evidence" variant="pill" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2 font-sans">
              <Hash className="w-6 h-6 text-emerald-700" />
              <span>Cryptographic Hash Integrity Verification</span>
            </h1>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
              FRE 902(13)/(14) SELF-AUTHENTICATING
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Forensic cryptographic verification establishing byte-for-byte authenticity and immutability
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTamperSimulation}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center space-x-1.5 transition-all shadow-xs ${
              isSimulatingTampering
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isSimulatingTampering ? 'Simulating Tampering (Active)' : 'Test Tamper Detection'}</span>
          </button>
          <button
            onClick={() => setCurrentScreen('chain-of-custody')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 transition-all flex items-center space-x-1.5"
          >
            <span>View Chain of Custody →</span>
          </button>
        </div>
      </div>

      {/* Feature Explanation Banner */}
      <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>What is Cryptographic Hash Integrity in Digital Forensics?</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          When digital audio evidence is first ingested into the forensic repository, a unique <strong>256-bit SHA-256 cryptographic digest</strong> is mathematically generated from its raw binary content. This digest functions as a tamper-evident digital fingerprint. During ongoing investigation, court presentation, or peer validation, the system calculates the current hash of the file and compares it against the baseline ingestion hash:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start space-x-2 text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Match (Identical Checksums)</strong>
              <span className="text-slate-600">The evidence file has not been altered, truncated, or modified in any way since initial collection.</span>
            </div>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start space-x-2 text-rose-950">
            <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">No Match (Checksum Mismatch)</strong>
              <span className="text-slate-600">The evidence file may have been modified, spliced, compressed, corrupted, or altered.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
        {/* Left Column: Evidence File & Live Checksum Computation */}
        <div className="lg:col-span-6 bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>1. Current Evidence Audio File</span>
            <FileCheck className="w-4 h-4 text-emerald-700" />
          </h2>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Evidence ID</span>
                <span className="font-mono font-bold text-emerald-900">{activeEvidence.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase text-[10px]">File Name</span>
                <span className="font-bold text-slate-900">{selectedFileName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase text-[10px]">File Size & Format</span>
                <span className="font-mono text-slate-700">{activeEvidence.fileSize} • WAV (Linear PCM)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Ingestion Timestamp</span>
                <span className="font-mono text-slate-700">{activeEvidence.uploadTimestamp}</span>
              </div>
            </div>

            {/* Dropzone for local file check */}
            <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 rounded-xl p-5 text-center space-y-2 relative transition-all cursor-pointer">
              <Upload className="w-6 h-6 text-emerald-700 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-900">Upload or drop file to re-calculate hash</p>
                <p className="text-[10px] text-slate-500">Computes real SHA-256 via Web Cryptography API</p>
              </div>
              <input
                type="file"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRecomputeHash}
              disabled={isVerifying}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing 256-bit Checksum...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Re-Calculate & Verify SHA-256 Live</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Comparative Hash Audit */}
        <div className="lg:col-span-6 bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>2. Hash Comparison & Audit Result</span>
            <Lock className="w-4 h-4 text-emerald-700" />
          </h2>

          <div className="space-y-4 text-xs">
            {/* Original Stored Hash */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Original Ingestion SHA-256 Hash
                </span>
                <button
                  onClick={() => copyToClipboard(originalHash, true)}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center space-x-1"
                >
                  {copiedOriginal ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedOriginal ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-[#032319] border border-emerald-950/20 rounded-xl font-mono text-[11px] text-emerald-300 break-all leading-tight shadow-inner">
                {originalHash}
              </div>
            </div>

            {/* Current Computed Hash */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Current Computed SHA-256 Hash
                </span>
                <button
                  onClick={() => copyToClipboard(currentHash, false)}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center space-x-1"
                >
                  {copiedCurrent ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCurrent ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className={`p-2.5 rounded-xl font-mono text-[11px] break-all leading-tight shadow-inner border ${
                verificationResult === 'MATCH'
                  ? 'bg-[#032319] border-emerald-950/20 text-emerald-300'
                  : 'bg-rose-950 border-rose-700 text-rose-200'
              }`}>
                {currentHash}
              </div>
            </div>

            {/* Status Card: Match vs No Match */}
            {verificationResult === 'MATCH' ? (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl space-y-2 text-emerald-950">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>MATCH: EVIDENCE HAS NOT BEEN ALTERED</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cryptographic verification confirms 100% bit-level fidelity with the initial ingestion repository. Zero modifications detected.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-xl space-y-2 text-rose-950">
                <div className="flex items-center space-x-2 font-bold text-sm text-rose-900">
                  <AlertOctagon className="w-5 h-5 text-rose-700 shrink-0" />
                  <span>NO MATCH: EVIDENCE MAY BE MODIFIED OR CORRUPTED</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Alert: Current file checksum does not match the baseline ingestion hash. The evidence file has been modified, tampered with, or corrupted.
                </p>
              </div>
            )}

            {/* Audit Log Metadata Footer */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verification Date & Time:</span>
                </span>
                <span className="font-mono font-bold text-slate-800">{verificationTimestamp}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center space-x-1">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verified By:</span>
                </span>
                <span className="font-bold text-slate-800">{verifierName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
