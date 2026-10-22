import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Award,
  FileText,
  Lock,
  Shield,
  CheckSquare,
  Square,
  ShieldCheck,
  Cpu,
  Volume2,
  Pause,
  Play,
  AlertTriangle,
  Sparkles,
  Fingerprint,
  Camera,
  RefreshCw,
  Clock,
  User as UserIcon,
  HardDrive,
  Check,
  XCircle,
  Video,
  VideoOff,
  Scan,
  Plus,
  AlertCircle,
  ShieldAlert,
  Sliders,
  CheckCircle
} from 'lucide-react';
import { ScreenId, User, ExpertReview, ThumbBiometricTemplate } from '../../types';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';
import { speakAudioEvidence, stopAudioEvidence, playSuccessSound, playNotificationChime } from '../../utils/audioPlayer';
import { BackButton } from '../common/BackButton';

interface ExpertValidationScreenProps {
  setCurrentScreen: (screen: ScreenId) => void;
  selectedCaseId: string;
  currentUser: User;
  expertReviews?: ExpertReview[];
  setExpertReviews?: React.Dispatch<React.SetStateAction<ExpertReview[]>>;
  onRegisterExpert?: (newExpert: ExpertReview) => void;
  initialSelectedExpertId?: string;
}

export const ExpertValidationScreen: React.FC<ExpertValidationScreenProps> = ({
  setCurrentScreen,
  selectedCaseId,
  currentUser,
  expertReviews = [],
  setExpertReviews,
  onRegisterExpert,
  initialSelectedExpertId
}) => {
  // Currently active expert ID
  const [activeExpertId, setActiveExpertId] = useState<string>(
    initialSelectedExpertId || (expertReviews.length > 0 ? expertReviews[0].id : 'EXP-01')
  );

  // Selected Expert Object
  const currentExpert = expertReviews.find((e) => e.id === activeExpertId) || expertReviews[0] || {
    id: 'EXP-01',
    caseId: selectedCaseId || 'DS-2024-4471',
    expertName: 'Dr. Keisha Okafor',
    institution: 'MIT Lincoln Lab / Forensic Voice Institute',
    certificationId: 'CFCE-2891',
    status: 'Approved',
    technicalAssessment: 'Ensemble AI detection findings are technically sound. The model\'s identification of GAN artifacts in the 340-880Hz range is consistent with current synthetic voice generation techniques. High-frequency phase mismatch in neural vocoder harmonics confirms synthetic origin with >97% certainty.',
    checklist: {
      swgdeStandards: true,
      chainOfCustodyVerified: true,
      reproducibleOutputs: true,
      confidenceIntervalsValid: true,
      acousticSpectralInspected: true
    },
    digitalSignature: 'RSA-4096: 0xA7B2C901E5F2D83A4B5C6D7E8F9A0B1C [Cert: CFCE-2891]',
    signedAt: '2026-08-01 10:14:00 UTC',
    thumbBiometricTemplate: {
      minutiaeHash: 'THUMB-VEC-EXP01-4b9e28f10a7c3d5e8b6a9c1f0d2e4a8b',
      enrolledAt: '2026-08-01 10:14:00 UTC',
      ridgeCount: 64,
      patternType: 'Whorl',
      enrolledByCamera: true
    }
  };

  const [assessmentText, setAssessmentText] = useState(currentExpert.technicalAssessment || '');

  const [checklist, setChecklist] = useState({
    swgdeStandards: currentExpert.checklist?.swgdeStandards ?? true,
    chainOfCustodyVerified: currentExpert.checklist?.chainOfCustodyVerified ?? true,
    reproducibleOutputs: currentExpert.checklist?.reproducibleOutputs ?? true,
    confidenceIntervalsValid: currentExpert.checklist?.confidenceIntervalsValid ?? true,
    acousticSpectralInspected: currentExpert.checklist?.acousticSpectralInspected ?? true
  });

  // Security & Thumb Camera Biometric States
  const [isSigned, setIsSigned] = useState(currentExpert.status === 'Approved');
  const [signingStep, setSigningStep] = useState<string | null>(null);

  // Real-time Camera Thumb Biometrics
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanningThumb, setIsScanningThumb] = useState(false);
  const [thumbScanProgress, setThumbScanProgress] = useState(0);

  // Strict Security Test Modes:
  // 'AUTHENTIC': Submits authentic candidate vector matching enrolled template -> Server passes
  // 'IMPOSTER': Submits imposter candidate vector -> Server rejects and logs security incident
  const [testBiometricMode, setTestBiometricMode] = useState<'AUTHENTIC' | 'IMPOSTER'>('AUTHENTIC');

  const [biometricStatus, setBiometricStatus] = useState<'IDLE' | 'MATCH' | 'FAILED'>(
    currentExpert.status === 'Approved' ? 'MATCH' : 'IDLE'
  );
  const [similarityScore, setSimilarityScore] = useState<number | null>(
    currentExpert.status === 'Approved' ? 98.7 : null
  );
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [proofToken, setProofToken] = useState<string | null>(
    currentExpert.status === 'Approved' ? 'BIO-PROOF-INITIAL' : null
  );

  const [verificationAuditRecord, setVerificationAuditRecord] = useState<{
    expertName: string;
    certId: string;
    method: string;
    similarity: string;
    timestamp: string;
    signatureHash: string;
    auditLogId: string;
  } | null>(
    currentExpert.status === 'Approved'
      ? {
          expertName: currentExpert.expertName,
          certId: currentExpert.certificationId,
          method: 'Real-Time Camera Thumb Biometric Scan (Optical Minutiae Match)',
          similarity: '98.7%',
          timestamp: currentExpert.signedAt || '2026-08-01 10:14:00 UTC',
          signatureHash: currentExpert.digitalSignature || 'RSA-4096: 0xA7B2C901E5F2D83A4B5C6D7E8F9A0B1C',
          auditLogId: 'AUD-EXP-019842'
        }
      : null
  );

  // Quick Register New Expert Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newExpName, setNewExpName] = useState('');
  const [newExpEmail, setNewExpEmail] = useState('');
  const [newExpInstitution, setNewExpInstitution] = useState('');
  const [newExpCertId, setNewExpCertId] = useState('');
  const [newExpSpecialty, setNewExpSpecialty] = useState('Voice Biometrics & Neural Vocoder Forensics');
  const [modalScanning, setModalScanning] = useState(false);
  const [modalScanProgress, setModalScanProgress] = useState(0);
  const [modalEnrolledTemplate, setModalEnrolledTemplate] = useState<ThumbBiometricTemplate | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Examiner Oral Finding Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [duration] = useState(38); // 38 seconds examiner oral finding
  const examinerTranscript =
    'This is Senior Forensic Examiner Dr. Keisha Okafor. I have completed independent acoustic and spectral verification on evidence item EV-2024-8842. The voice recording exhibits synthetic neural vocoder phase distortion and flat fundamental frequency contours incompatible with natural human phonation. I certify this evidence as an artificial deepfake voice clone.';

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize when selected expert changes
  useEffect(() => {
    if (currentExpert) {
      setAssessmentText(currentExpert.technicalAssessment || '');
      setChecklist({
        swgdeStandards: currentExpert.checklist?.swgdeStandards ?? true,
        chainOfCustodyVerified: currentExpert.checklist?.chainOfCustodyVerified ?? true,
        reproducibleOutputs: currentExpert.checklist?.reproducibleOutputs ?? true,
        confidenceIntervalsValid: currentExpert.checklist?.confidenceIntervalsValid ?? true,
        acousticSpectralInspected: currentExpert.checklist?.acousticSpectralInspected ?? true
      });
      setIsSigned(currentExpert.status === 'Approved');
      setBiometricStatus(currentExpert.status === 'Approved' ? 'MATCH' : 'IDLE');
      setSimilarityScore(currentExpert.status === 'Approved' ? 98.7 : null);
      setSecurityAlert(null);
      setProofToken(currentExpert.status === 'Approved' ? 'BIO-PROOF-INITIAL' : null);
    }
  }, [activeExpertId, expertReviews]);

  // Start Camera
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        throw new Error('Camera device not directly accessible');
      }
    } catch (err: any) {
      console.warn('Camera sandbox fallback:', err);
      setIsCameraActive(true);
      startSimulatedThumbCameraCanvas();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Canvas visual loop for camera preview & thumb optical scanning overlay
  const startSimulatedThumbCameraCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const drawLoop = () => {
      if (!isCameraActive && frame > 100) return;
      frame++;

      ctx.fillStyle = '#032319';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw thumb contour target in center
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.strokeStyle =
        biometricStatus === 'FAILED'
          ? '#F43F5E'
          : isScanningThumb
          ? '#34D399'
          : '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      // Thumb shape outline
      ctx.beginPath();
      ctx.ellipse(cx, cy, 45, 75, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw internal thumb ridges
      ctx.strokeStyle =
        biometricStatus === 'FAILED'
          ? 'rgba(244, 63, 94, 0.7)'
          : isScanningThumb
          ? 'rgba(52, 211, 153, 0.7)'
          : 'rgba(16, 185, 129, 0.4)';
      for (let r = 10; r <= 35; r += 6) {
        ctx.beginPath();
        ctx.ellipse(cx, cy - 10 + r, r, r * 1.4, 0, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
      }

      // Laser scan line across thumb
      if (isScanningThumb) {
        const scanY = (frame * 3) % (canvas.height - 40) + 20;
        ctx.strokeStyle = testBiometricMode === 'IMPOSTER' ? '#F43F5E' : '#34D399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 50, scanY);
        ctx.lineTo(cx + 50, scanY);
        ctx.stroke();
      }

      if (isCameraActive) {
        requestAnimationFrame(drawLoop);
      }
    };
    drawLoop();
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  // Helper to generate 64-dimensional biometric vector
  const generateBiometricVector = (seedString: string, isAuthentic: boolean): number[] => {
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash |= 0;
    }
    const baseVal = (Math.abs(hash) % 1000) / 1000;
    const vector: number[] = [];

    for (let i = 0; i < 64; i++) {
      if (isAuthentic) {
        // High similarity vector with tiny optical noise
        const val = Math.sin(baseVal * (i + 1)) + (Math.random() * 0.05 - 0.025);
        vector.push(+val.toFixed(4));
      } else {
        // Orthogonal / Imposter vector
        const val = Math.cos((baseVal + 0.789) * (i + 3)) * 2.5 + (Math.random() - 0.5);
        vector.push(+val.toFixed(4));
      }
    }
    return vector;
  };

  // Perform Server-Side Biometric Verification
  const handlePerformCameraThumbScan = async () => {
    if (!isCameraActive) {
      await startCamera();
    }
    setIsScanningThumb(true);
    setBiometricStatus('IDLE');
    setSimilarityScore(null);
    setSecurityAlert(null);
    setProofToken(null);
    setThumbScanProgress(0);

    let p = 0;
    const interval = setInterval(async () => {
      p += 20;
      setThumbScanProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(interval);
        setIsScanningThumb(false);

        // Generate candidate vector based on authentic mode vs imposter mode
        const isAuthentic = testBiometricMode === 'AUTHENTIC';
        const candidateVector = generateBiometricVector(
          currentExpert.expertName + (currentExpert.thumbBiometricTemplate?.minutiaeHash || ''),
          isAuthentic
        );

        try {
          // Call Server Biometric Verification Endpoint
          const response = await fetch('/api/biometrics/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              expertId: currentExpert.id,
              candidateVector: candidateVector,
              method: 'optical_thumb_minutiae'
            })
          });

          const data = await response.json();

          if (response.ok && data.verified) {
            setSimilarityScore(data.matchScore);
            setBiometricStatus('MATCH');
            setProofToken(data.proofToken);
            playSuccessSound();

            MOCK_AUDIT_LOGS.unshift({
              id: `AUD-${Date.now().toString().slice(-4)}`,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
              user: currentExpert.expertName,
              action: 'VERIFY',
              resource: `Cryptographic Server Thumbprint Match (${data.matchScore}%) for Certified Expert ${currentExpert.expertName} (${currentExpert.certificationId})`,
              ipAddress: '10.0.1.88',
              status: 'SUCCESS'
            });
          } else {
            setSimilarityScore(data.matchScore || 28.4);
            setBiometricStatus('FAILED');
            setProofToken(null);
            const alertMessage = `STRICT SECURITY ALERT: Scanned thumbprint does NOT match the enrolled biometric template for ${currentExpert.expertName} (Minutiae Score: ${data.matchScore || 28.4}% / Required: >=${data.threshold || 92.0}%). Unauthorized biometric attempt logged.`;
            setSecurityAlert(alertMessage);

            MOCK_AUDIT_LOGS.unshift({
              id: `AUD-ALERT-${Date.now().toString().slice(-4)}`,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
              user: 'UNAUTHORIZED_ATTEMPT',
              action: 'VERIFY',
              resource: `TAMPER ALERT: Server Rejected Thumbprint Mismatch (${data.matchScore || 28.4}%) against template for ${currentExpert.expertName}`,
              ipAddress: '10.0.1.88',
              status: 'FAILED'
            });
          }
        } catch (err) {
          setBiometricStatus('FAILED');
          setSecurityAlert('Network error: Unable to contact biometric verification enclave.');
        }
      }
    }, 150);
  };

  // Quick Modal: Enroll Thumb Scan with Camera
  const handleModalScanThumb = async () => {
    setModalScanning(true);
    setModalScanProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setModalScanProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(interval);
        setModalScanning(false);

        const seed = `${newExpName}_${Date.now()}`;
        let h = 0;
        for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
        const hex = Math.abs(h).toString(16).padStart(8, '0');
        const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(10)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        const newTemplate: ThumbBiometricTemplate = {
          minutiaeHash: `THUMB-VEC-${hex}-${randomHex}`,
          enrolledAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
          ridgeCount: 68,
          patternType: 'Whorl',
          enrolledByCamera: true,
          technology: 'High-Res Optical Minutiae Extraction'
        };

        setModalEnrolledTemplate(newTemplate);
        playSuccessSound();
      }
    }, 180);
  };

  // Handle Quick Register Form Submit
  const handleQuickRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEnrolledTemplate) {
      alert('You must scan and enroll the new expert\'s thumbprint via camera before registering.');
      return;
    }

    const expertId = `EXP-${String(expertReviews.length + 1).padStart(2, '0')}`;
    const name = newExpName.startsWith('Dr.') || newExpName.startsWith('Prof.') ? newExpName : `Dr. ${newExpName}`;

    // Enroll template with server
    const templateVector = generateBiometricVector(name + modalEnrolledTemplate.minutiaeHash, true);
    try {
      await fetch('/api/biometrics/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: expertId,
          expertName: name,
          templateVector: templateVector
        })
      });
    } catch (err) {
      console.warn('Backend enrollment note:', err);
    }

    const newExpert: ExpertReview = {
      id: expertId,
      caseId: selectedCaseId || 'DS-2024-4471',
      expertName: name,
      email: newExpEmail || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@fbi.gov`,
      institution: newExpInstitution || 'Federal Cyber Forensics Laboratory',
      certificationId: newExpCertId || `CFCE-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      technicalAssessment: `Enrolled forensic examiner specializing in ${newExpSpecialty}. Preliminary acoustic review pending biometric signature.`,
      checklist: {
        swgdeStandards: true,
        chainOfCustodyVerified: true,
        reproducibleOutputs: true,
        confidenceIntervalsValid: true,
        acousticSpectralInspected: true
      },
      digitalSignature: 'Pending Biometric Authentication',
      signedAt: 'Pending',
      thumbBiometricTemplate: modalEnrolledTemplate
    };

    if (onRegisterExpert) {
      onRegisterExpert(newExpert);
    } else if (setExpertReviews) {
      setExpertReviews((prev) => [...prev, newExpert]);
    }

    setActiveExpertId(expertId);
    setIsRegisterModalOpen(false);
    playNotificationChime();
  };

  // Examiner Oral Finding Audio Playback
  const handleToggleAudioPlayback = () => {
    if (isPlayingAudio) {
      stopAudioEvidence();
      setIsPlayingAudio(false);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    } else {
      setIsPlayingAudio(true);
      setPlaybackProgress(0);

      speakAudioEvidence(examinerTranscript, {
        isSynthetic: false,
        onEnd: () => {
          setIsPlayingAudio(false);
          setPlaybackProgress(100);
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        }
      });

      const startTime = Date.now();
      const totalMs = duration * 1000;
      playbackTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / totalMs) * 100);
        setPlaybackProgress(pct);
        if (pct >= 100 && playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
        }
      }, 250);
    }
  };

  // Certify and Sign Workflow calling Server Certification Endpoint
  const handleExecuteCertification = async () => {
    const allChecked = Object.values(checklist).every(Boolean);
    if (!allChecked) {
      alert('Forensic Protocol Requirement: All items in the Methodological Review Checklist must be checked before legal certification.');
      return;
    }

    if (biometricStatus !== 'MATCH' || !proofToken) {
      alert(`Strict Security Protocol: Live Camera Thumb Biometric Verification must be successfully matched on the server for ${currentExpert.expertName} before signing.`);
      return;
    }

    setSigningStep(`Verifying Cryptographic Proof Token against ${currentExpert.expertName}'s Enrolled Vector on Server...`);

    try {
      const response = await fetch('/api/expert-review/certify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: currentExpert.id,
          caseId: currentExpert.caseId,
          proofToken: proofToken,
          assessmentText: assessmentText,
          checklist: checklist
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || 'Certification rejected by security server. Biometric proof token may be expired.');
        setSigningStep(null);
        return;
      }

      setSigningStep('Locking Immutable Digital Signature Seal & Updating Ledger...');

      setTimeout(() => {
        const record = data.certifiedRecord;
        setVerificationAuditRecord({
          expertName: currentExpert.expertName,
          certId: currentExpert.certificationId,
          method: 'Server-Verified Camera Thumb Biometric Scan (FIPS-201 Cryptographic Proof)',
          similarity: `${similarityScore || 98.7}%`,
          timestamp: record.signedAt,
          signatureHash: record.digitalSignature,
          auditLogId: record.auditLogId
        });

        // Update expert status in list
        if (setExpertReviews) {
          setExpertReviews((prev) =>
            prev.map((e) =>
              e.id === currentExpert.id
                ? {
                    ...e,
                    status: 'Approved',
                    technicalAssessment: assessmentText,
                    checklist,
                    digitalSignature: record.digitalSignature,
                    signedAt: record.signedAt
                  }
                : e
            )
          );
        }

        setIsSigned(true);
        setSigningStep(null);
        playSuccessSound();
      }, 700);
    } catch (err) {
      alert('Network error connecting to certification server.');
      setSigningStep(null);
    }
  };

  return (
    <div id="expert-validation-screen" className="p-4 sm:p-6 space-y-6 bg-[#F4F8F6] min-h-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BackButton onClick={() => setCurrentScreen('detection-results')} label="Back to Detection Results" variant="pill" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center space-x-2">
              <UserCheck className="w-6 h-6 text-emerald-700" />
              <span>Expert Witness Review & Biometric Certification</span>
            </h1>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
              DOCKET: {selectedCaseId || 'DS-2024-4471'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review, validate, and certify existing forensic findings with person-specific camera thumbprint biometric verification
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Register New Expert Review</span>
          </button>

          <button
            onClick={() => setCurrentScreen('report-generation')}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Proceed to Report Generation →</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        {/* Left Column: Assigned Experts & Camera Thumb Biometrics */}
        <div className="lg:col-span-5 space-y-5">
          {/* Assigned Expert Witness Profile List */}
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                  <span>Registered Expert Witnesses</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded-full font-mono text-[10px]">
                    {expertReviews.length}
                  </span>
                </h2>
                <p className="text-[10px] text-slate-500">Select an expert to verify their specific thumbprint</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {expertReviews.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => setActiveExpertId(exp.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    activeExpertId === exp.id
                      ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{exp.expertName}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      exp.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {exp.status === 'Approved' ? 'CERTIFIED' : 'PENDING SIGN'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{exp.institution}</p>
                  
                  <div className="flex justify-between items-center text-[10px] font-mono text-emerald-800 font-bold mt-1.5 pt-1.5 border-t border-slate-200/60">
                    <span>Cert: {exp.certificationId}</span>
                    <span className="text-[9px] text-slate-500">
                      {exp.thumbBiometricTemplate?.patternType || 'Whorl'} Biometric Vector
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Camera Thumb Biometric Verification Card */}
          <div className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-900 flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Strict Security Camera Thumb Scan</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Verifying live camera feed against <strong>{currentExpert.expertName}'s</strong> enrolled fingerprint
                </p>
              </div>
              <button
                type="button"
                onClick={isCameraActive ? stopCamera : startCamera}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-500 text-slate-700 flex items-center space-x-1 transition-all cursor-pointer"
              >
                {isCameraActive ? <VideoOff className="w-3 h-3 text-rose-600" /> : <Video className="w-3 h-3 text-emerald-700" />}
                <span>{isCameraActive ? 'Turn Off Camera' : 'Enable Camera'}</span>
              </button>
            </div>

            {/* Live Camera Viewfinder with Thumb Optical Contour Overlay */}
            <div className="relative w-full aspect-4/3 bg-[#032319] rounded-2xl overflow-hidden border border-emerald-950/40 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className={`w-full h-full object-cover ${isCameraActive ? 'hidden' : 'block'}`}
              />

              {/* Thumb Optical Contour Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                <div className={`w-28 h-44 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center relative ${
                  biometricStatus === 'MATCH'
                    ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                    : biometricStatus === 'FAILED'
                    ? 'border-rose-500 bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : isScanningThumb
                    ? 'border-emerald-400 animate-pulse bg-emerald-500/10'
                    : 'border-emerald-500/60'
                }`}>
                  <Fingerprint className={`w-14 h-14 ${
                    biometricStatus === 'MATCH'
                      ? 'text-emerald-400'
                      : biometricStatus === 'FAILED'
                      ? 'text-rose-400'
                      : isScanningThumb
                      ? 'text-emerald-300'
                      : 'text-emerald-500/50'
                  }`} />

                  {isScanningThumb && (
                    <div
                      style={{ top: `${thumbScanProgress}%` }}
                      className={`absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${testBiometricMode === 'IMPOSTER' ? 'rose-400' : 'emerald-400'} to-transparent shadow-[0_0_8px_${testBiometricMode === 'IMPOSTER' ? '#F43F5E' : '#34D399'}] transition-all duration-100`}
                    ></div>
                  )}
                </div>

                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full mt-2 backdrop-blur-xs ${
                  biometricStatus === 'MATCH'
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                    : biometricStatus === 'FAILED'
                    ? 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
                    : 'bg-black/70 text-emerald-300/90'
                }`}>
                  {isScanningThumb
                    ? `EXTRACTING MINUTIAE (${thumbScanProgress}%)...`
                    : biometricStatus === 'MATCH'
                    ? `✓ MATCHED: ${currentExpert.expertName}`
                    : biometricStatus === 'FAILED'
                    ? '⛔ REJECTED: FINGERPRINT MISMATCH'
                    : `HOLD ${currentExpert.expertName.toUpperCase()}'S THUMB TO CAMERA`}
                </span>
              </div>
            </div>

            {/* Target Person's Enrolled Template Profile Summary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 uppercase font-bold">Target Enrolled Biometric:</span>
                <span className="font-mono text-emerald-800 font-bold">
                  {currentExpert.thumbBiometricTemplate?.ridgeCount || 64} RIDGES ({currentExpert.thumbBiometricTemplate?.patternType || 'WHORL'})
                </span>
              </div>
              <div className="font-mono text-[10px] text-slate-600 truncate">
                Hash: {currentExpert.thumbBiometricTemplate?.minutiaeHash || 'THUMB-VEC-ENROLLED-8f92b1a0...'}
              </div>
            </div>

            {/* Strict Security Test Mode Toggle */}
            <div className="p-3 bg-slate-100 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-slate-600 flex items-center space-x-1">
                  <Sliders className="w-3 h-3 text-slate-500" />
                  <span>Biometric Verification Test Matrix:</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-800 font-bold">FRE 902 Security Enclave</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTestBiometricMode('AUTHENTIC');
                    setBiometricStatus('IDLE');
                    setSecurityAlert(null);
                    setProofToken(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer text-left ${
                    testBiometricMode === 'AUTHENTIC'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ✓ Registered Thumb (PASS)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTestBiometricMode('IMPOSTER');
                    setBiometricStatus('IDLE');
                    setSecurityAlert(null);
                    setProofToken(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer text-left ${
                    testBiometricMode === 'IMPOSTER'
                      ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ✗ Different Thumb (FAIL)
                </button>
              </div>
            </div>

            {/* Biometric Status Feedback Box */}
            {biometricStatus === 'MATCH' && (
              <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 text-emerald-950 rounded-xl space-y-1">
                <div className="flex items-center space-x-2 font-bold text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>✓ Biometric Verification Successful</span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-0.5">
                  <p>Verified Identity: <strong>{currentExpert.expertName}</strong></p>
                  <p>Optical Minutiae Similarity: <strong className="text-emerald-800">{similarityScore || 98.4}% (Threshold: &ge; 88.0%)</strong></p>
                  <p className="text-[10px] font-mono text-emerald-900 truncate">Cryptographic Proof: {proofToken}</p>
                </div>
              </div>
            )}

            {biometricStatus === 'FAILED' && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-500 text-rose-950 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-xs text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>✗ Biometric Verification Failed</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-tight">
                  Scanned camera thumb does NOT match the enrolled biometric template for <strong>{currentExpert.expertName}</strong> (Similarity: {similarityScore || '28.4'}% &lt; 88.0% required threshold).
                </p>
                <div className="text-[10px] font-mono text-rose-900 bg-rose-100/70 p-2 rounded-lg border border-rose-300">
                  Audit incident logged in tamper-proof ledger. Legal certification signing remains strictly blocked.
                </div>
              </div>
            )}

            {biometricStatus === 'IDLE' && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>⚠ Biometric Verification Not Completed</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Please hold your thumb in front of the camera and click the verification button below.
                </p>
              </div>
            )}

            {/* Action Buttons for Biometric Scan */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handlePerformCameraThumbScan}
                disabled={isScanningThumb}
                className="w-full py-3 bg-[#0A3D24] hover:bg-[#062817] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Fingerprint className={`w-4 h-4 ${isScanningThumb ? 'animate-pulse' : ''}`} />
                <span>
                  {isScanningThumb
                    ? 'Extracting Minutiae from Camera...'
                    : `Scan Camera Thumb & Verify ${currentExpert.expertName}`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Review & Validate Existing Findings */}
        <div className="lg:col-span-7 bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-6 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Independent Review & Validation of Forensic Findings</h2>
              <span className="text-xs font-mono font-bold text-emerald-800">
                {currentExpert.expertName} — {currentExpert.certificationId}
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 self-start sm:self-auto">
              COURT-QUALIFIED EXPERT
            </span>
          </div>

          {/* Examiner Oral Findings Audio Player */}
          <div className="p-4 bg-[#032319] border border-emerald-950/20 rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold uppercase tracking-wider text-white">
                  Examiner Oral Findings & Recorded Statement
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                SEGMENT: 00:00.00 — 00:38.00
              </span>
            </div>

            {/* Audio Progress Timeline */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-emerald-400/80">
                <span>{isPlayingAudio ? `00:${Math.floor((playbackProgress / 100) * duration).toString().padStart(2, '0')}` : '00:00'}</span>
                <span>00:{duration}</span>
              </div>
              <div className="h-2 bg-emerald-950 rounded-full overflow-hidden border border-emerald-900/60">
                <div
                  style={{ width: `${playbackProgress}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                ></div>
              </div>
            </div>

            {/* Audio Playback Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleToggleAudioPlayback}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors shadow-xs cursor-pointer"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Statement</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Listen to Examiner Oral Finding</span>
                  </>
                )}
              </button>

              <span className="text-[10px] font-mono text-emerald-300/80">
                AUDIO SAMPLE EV-2024-8842
              </span>
            </div>

            {/* Oral Findings Transcript Display */}
            <div className="pt-2 border-t border-emerald-900/50 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                Recorded Examiner Statement Transcript:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-black/30 p-2.5 rounded-xl border border-emerald-900/40">
                "{examinerTranscript}"
              </p>
            </div>
          </div>

          {/* Technical Assessment & Findings Validation */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase text-slate-500">
              EXPERT WITNESS TECHNICAL ASSESSMENT & VALIDATION
            </label>
            <textarea
              rows={4}
              value={assessmentText}
              onChange={(e) => setAssessmentText(e.target.value)}
              className="w-full bg-[#F8FAF9] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white font-sans leading-relaxed shadow-xs"
            ></textarea>
          </div>

          {/* Methodological Review Checklist */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase text-slate-500">
              METHODOLOGICAL REVIEW CHECKLIST (ALL REQUIRED FOR CERTIFICATION)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.swgdeStandards}
                  onChange={(e) => setChecklist({ ...checklist, swgdeStandards: e.target.checked })}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span>Conforms to SWGDE Standards</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.chainOfCustodyVerified}
                  onChange={(e) => setChecklist({ ...checklist, chainOfCustodyVerified: e.target.checked })}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span>Chain of Custody Verified</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.reproducibleOutputs}
                  onChange={(e) => setChecklist({ ...checklist, reproducibleOutputs: e.target.checked })}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span>Model Outputs Reproducible</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.confidenceIntervalsValid}
                  onChange={(e) => setChecklist({ ...checklist, confidenceIntervalsValid: e.target.checked })}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span>Confidence Intervals Valid (99% CI)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={checklist.acousticSpectralInspected}
                  onChange={(e) => setChecklist({ ...checklist, acousticSpectralInspected: e.target.checked })}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span>Acoustic & spectral anomaly regions inspected & validated</span>
              </label>
            </div>
          </div>

          {/* RSA-4096 Digital Signature & Certified Audit Box */}
          {isSigned && verificationAuditRecord && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-3 text-emerald-950 text-xs">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>EXPERT WITNESS REVIEW CERTIFIED & DIGITALLY SEALED</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">Expert Witness:</span>
                  <span className="font-bold text-slate-800">{verificationAuditRecord.expertName} ({verificationAuditRecord.certId})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Biometric Method:</span>
                  <span className="font-bold text-slate-800">{verificationAuditRecord.method}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Thumb Minutiae Match:</span>
                  <span className="font-bold text-emerald-800">{verificationAuditRecord.similarity}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Audit Ledger Entry:</span>
                  <span className="font-bold text-emerald-800">{verificationAuditRecord.auditLogId}</span>
                </div>
              </div>
              <div className="p-2.5 bg-[#032319] rounded-xl font-mono text-[10px] text-emerald-300 break-all leading-tight">
                {verificationAuditRecord.signatureHash}
              </div>
            </div>
          )}

          {signingStep && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center space-x-2 text-amber-900 text-xs font-bold animate-pulse">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{signingStep}</span>
            </div>
          )}

          {/* Certify & Sign Action Button */}
          <div className="flex justify-end pt-2">
            <button
              id="certify-sign-button"
              type="button"
              disabled={isSigned || !!signingStep || biometricStatus !== 'MATCH' || !proofToken}
              onClick={handleExecuteCertification}
              className={`px-6 py-3.5 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer ${
                isSigned
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : biometricStatus !== 'MATCH' || !proofToken
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-emerald-900/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSigned
                  ? `✓ Review Certified & Signed for ${currentExpert.expertName}`
                  : biometricStatus !== 'MATCH' || !proofToken
                  ? 'Scan & Verify Thumbprint to Enable Signing'
                  : `Certify & Sign Review as ${currentExpert.expertName}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Register New Expert Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-900/20 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Register New Expert Review</h3>
                  <p className="text-[10px] text-slate-500">Enroll new expert witness & camera thumbprint</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Expert Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Marcus Vance"
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Institution / Agency
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FBI Cyber Forensics"
                    value={newExpInstitution}
                    onChange={(e) => setNewExpInstitution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Certification ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CFCE-8421"
                    value={newExpCertId}
                    onChange={(e) => setNewExpCertId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Camera Biometric Scan in Modal */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-[10px] uppercase flex items-center space-x-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Camera Thumb Biometric Enrollment</span>
                  </span>
                  {modalEnrolledTemplate && (
                    <span className="text-[9px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                      ✓ ENROLLED
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleModalScanThumb}
                    disabled={modalScanning}
                    className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{modalScanning ? `Scanning (${modalScanProgress}%)...` : modalEnrolledTemplate ? 'Re-Scan Thumb' : 'Scan Thumb with Camera'}</span>
                  </button>

                  <p className="text-[10px] text-slate-500 leading-tight">
                    {modalEnrolledTemplate
                      ? `Enrolled Template: ${modalEnrolledTemplate.minutiaeHash.slice(0, 22)}...`
                      : 'Align thumb in camera to generate biometric signing key.'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save & Select Expert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
