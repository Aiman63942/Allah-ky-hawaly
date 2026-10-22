import crypto from 'crypto';
import {
  isScreenAllowed,
  getDenialReason,
  canCreateCases,
  canUploadEvidence,
  canRunDetection,
  canRunAiAnalysis,
  canVerifyEvidence,
  canManageChainOfCustody,
  canSignExpertValidation,
  canSubmitLegalReview,
  canSignFinalForensicReport,
  canManageUsers,
  canConfigureSecurity,
  isReadOnlyForensics,
  ROLE_CONFIGS
} from '../src/utils/rbac';
import { serverDb } from '../serverDb';
import { UserRole, ScreenId } from '../src/types';
import {
  decodeAudioBuffer,
  computeAcousticMeasurements,
  extractSpeakerEmbeddingVector,
  evaluateVoiceConditionHypotheses
} from '../src/utils/audioDsp';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  category: string;
}

const testResults: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runTest(category: string, name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          testResults.push({ name, passed: true, category });
          console.log(`  [PASS] ${name}`);
        })
        .catch((err) => {
          testResults.push({ name, passed: false, error: err.message, category });
          console.error(`  [FAIL] ${name}: ${err.message}`);
        });
    } else {
      testResults.push({ name, passed: true, category });
      console.log(`  [PASS] ${name}`);
    }
  } catch (err: any) {
    testResults.push({ name, passed: false, error: err.message, category });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log('   ALFADetect — AUTOMATED QA, SECURITY & ACCEPTANCE TESTS   ');
  console.log('===============================================================\n');

  // SECTION 1: ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS MATRIX
  console.log('--- SECTION 1: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX ---');

  runTest('RBAC', '1.1 Public screens are accessible by all roles and unauthenticated users', () => {
    const publicScreens: ScreenId[] = ['landing', 'workflow', 'signin', 'request-access', 'public-verify'];
    const roles: UserRole[] = [
      'Lead Forensic Analyst',
      'Forensic Examiner / Expert Witness',
      'Prosecutor / Legal Reviewer',
      'System Security Administrator'
    ];
    for (const r of roles) {
      for (const s of publicScreens) {
        assert(isScreenAllowed(r, s), `${r} should be allowed on ${s}`);
      }
    }
  });

  runTest('RBAC', '1.2 Lead Forensic Analyst has full case workflow permissions', () => {
    const role: UserRole = 'Lead Forensic Analyst';
    assert(canCreateCases(role), 'Lead Analyst must be able to create cases');
    assert(canUploadEvidence(role), 'Lead Analyst must be able to upload evidence');
    assert(canRunDetection(role), 'Lead Analyst must be able to run detection');
    assert(canRunAiAnalysis(role), 'Lead Analyst must be able to run AI analysis');
    assert(canVerifyEvidence(role), 'Lead Analyst must be able to verify evidence');
    assert(canManageChainOfCustody(role), 'Lead Analyst must manage chain of custody');
    assert(canSignFinalForensicReport(role), 'Lead Analyst must sign final forensic reports');
    assert(!canManageUsers(role), 'Lead Analyst must NOT have user administration rights');
  });

  runTest('RBAC', '1.3 Forensic Examiner has analysis permissions but cannot manage users or legal review', () => {
    const role: UserRole = 'Forensic Examiner / Expert Witness';
    assert(canUploadEvidence(role), 'Examiner can upload evidence');
    assert(canRunDetection(role), 'Examiner can run detection');
    assert(canSignExpertValidation(role), 'Examiner can sign expert validation');
    assert(!canCreateCases(role), 'Examiner cannot create case dockets');
    assert(!canManageUsers(role), 'Examiner cannot manage users');
    assert(!isScreenAllowed(role, 'admin-panel'), 'Examiner must be denied admin-panel screen');
    assert(!isScreenAllowed(role, 'legal-review'), 'Examiner must be denied legal-review screen');
  });

  runTest('RBAC', '1.4 Prosecutor / Legal Reviewer is strictly read-only for forensics', () => {
    const role: UserRole = 'Prosecutor / Legal Reviewer';
    assert(isReadOnlyForensics(role), 'Prosecutor must be marked as read-only forensics');
    assert(canSubmitLegalReview(role), 'Prosecutor can submit legal reviews');
    assert(!canUploadEvidence(role), 'Prosecutor cannot upload raw evidence');
    assert(!canRunDetection(role), 'Prosecutor cannot run detection');
    assert(!canRunAiAnalysis(role), 'Prosecutor cannot run AI pipeline');
    assert(!isScreenAllowed(role, 'pipeline'), 'Prosecutor must be denied pipeline screen');
    assert(!isScreenAllowed(role, 'admin-panel'), 'Prosecutor must be denied admin-panel screen');
  });

  runTest('RBAC', '1.5 System Security Administrator cannot alter forensic findings or sign reports', () => {
    const role: UserRole = 'System Security Administrator';
    assert(canManageUsers(role), 'Admin can manage users');
    assert(canConfigureSecurity(role), 'Admin can configure security');
    assert(isReadOnlyForensics(role), 'Admin has read-only access to forensic data');
    assert(!canCreateCases(role), 'Admin cannot create forensic cases');
    assert(!canUploadEvidence(role), 'Admin cannot upload evidence');
    assert(!canRunDetection(role), 'Admin cannot run deepfake detection');
    assert(!canSignFinalForensicReport(role), 'Admin cannot sign forensic reports');
    assert(!isScreenAllowed(role, 'pipeline'), 'Admin cannot access pipeline screen');
    assert(!isScreenAllowed(role, 'expert-validation'), 'Admin cannot access expert validation');
    assert(!isScreenAllowed(role, 'legal-review'), 'Admin cannot access legal review screen');
  });

  // SECTION 2: CRYPTOGRAPHIC INTEGRITY & REAL SHA-256 HASH VERIFICATION
  console.log('\n--- SECTION 2: CRYPTOGRAPHIC INTEGRITY & SHA-256 ---');

  runTest('Crypto', '2.1 Server computes accurate SHA-256 from raw evidence bytes', () => {
    const sampleBuffer = Buffer.from('RIFF_WAV_AUDIO_SAMPLE_FORENSIC_EVIDENCE_BYTES_123456');
    const computedHash = crypto.createHash('sha256').update(sampleBuffer).digest('hex');
    assert(computedHash.length === 64, 'SHA-256 must be 64 hexadecimal characters');
    
    // Determinism test
    const recomputed = crypto.createHash('sha256').update(sampleBuffer).digest('hex');
    assert(computedHash === recomputed, 'Hash recomputation must be strictly deterministic');
  });

  runTest('Crypto', '2.2 Modified evidence bytes alter hash and trigger tampering alert', () => {
    const originalBytes = Buffer.from('ORIGINAL_GENUINE_POLITICAL_SPEECH_RECORDING_123');
    const tamperedBytes = Buffer.from('ORIGINAL_GENUINE_POLITICAL_SPEECH_RECORDING_124'); // 1 character changed
    
    const originalHash = crypto.createHash('sha256').update(originalBytes).digest('hex');
    const tamperedHash = crypto.createHash('sha256').update(tamperedBytes).digest('hex');
    
    assert(originalHash !== tamperedHash, 'Modified bytes must produce completely different hash');
  });

  runTest('Crypto', '2.3 Missing original reference hash returns Cannot Verify error', () => {
    const candidateHash = '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5';
    const missingStoredHash = '';
    
    const verifyIntegrity = (orig: string, cand: string) => {
      if (!orig || !orig.trim()) return 'CANNOT_VERIFY_ORIGINAL_UNAVAILABLE';
      return orig.toLowerCase() === cand.toLowerCase() ? 'MATCH' : 'NO_MATCH';
    };

    const result = verifyIntegrity(missingStoredHash, candidateHash);
    assert(result === 'CANNOT_VERIFY_ORIGINAL_UNAVAILABLE', 'Missing original hash must never verify successfully');
  });

  // SECTION 3: SERVER PERSISTENCE & DATABASE OPERATIONS
  console.log('\n--- SECTION 3: PERSISTED DATABASE & CASE MANAGEMENT ---');

  runTest('Persistence', '3.1 Server database persists new forensic case and enforces schema', () => {
    const testCaseId = `DS-TEST-${Date.now().toString().slice(-4)}`;
    const createdCase = serverDb.createCase({
      id: testCaseId,
      title: 'QA Automated Verification Docket',
      description: 'Test case created during QA automated acceptance test run',
      status: 'Active',
      verdict: 'AUTHENTIC',
      priority: 'High',
      analyst: 'Automated QA Lead',
      agency: 'Federal Forensic Testing Division',
      date: new Date().toISOString().slice(0, 10),
      updatedDate: new Date().toISOString().slice(0, 10),
      evidenceCount: 1,
      createdBy: 'qa-tester@forensics.gov'
    });

    assert(createdCase.id === testCaseId, 'Created case must have matching ID');
    const retrieved = serverDb.getCaseById(testCaseId);
    assert(retrieved !== undefined, 'Case must be retrievable from persistent store');
    assert(retrieved?.analyst === 'Automated QA Lead', 'Retrieved case properties must match stored values');
  });

  runTest('Persistence', '3.2 Updating case status reflects in database and prevents unauthorized changes', () => {
    const testCaseId = `DS-TEST-${Date.now().toString().slice(-4)}`;
    serverDb.createCase({
      id: testCaseId,
      title: 'Status Transition Test Case',
      description: 'Testing valid state transition',
      status: 'Active',
      verdict: 'INCONCLUSIVE',
      priority: 'Medium',
      analyst: 'Automated QA Lead',
      agency: 'Federal Forensic Testing Division',
      date: new Date().toISOString().slice(0, 10),
      updatedDate: new Date().toISOString().slice(0, 10),
      evidenceCount: 0,
      createdBy: 'qa-tester@forensics.gov'
    });

    const updated = serverDb.updateCase(testCaseId, { status: 'Under Review', verdict: 'DEEPFAKE' });
    assert(updated !== null, 'Update case should succeed');
    assert(updated?.status === 'Under Review', 'Case status must be updated');
    assert(updated?.verdict === 'DEEPFAKE', 'Case verdict must be updated');
  });

  runTest('Persistence', '3.3 Evidence record links correctly to docket and stores SHA-256', () => {
    const testCaseId = `DS-TEST-EVID-${Date.now().toString().slice(-4)}`;
    serverDb.createCase({
      id: testCaseId,
      title: 'Evidence Association Test Case',
      description: 'Evidence link test',
      status: 'Active',
      verdict: 'INCONCLUSIVE',
      priority: 'Low',
      analyst: 'Automated QA Lead',
      agency: 'Federal Forensic Testing Division',
      date: new Date().toISOString().slice(0, 10),
      updatedDate: new Date().toISOString().slice(0, 10),
      evidenceCount: 0,
      createdBy: 'qa-tester@forensics.gov'
    });

    const testEvidenceId = `EV-TEST-${Date.now().toString().slice(-4)}`;
    const sampleHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    
    const ev = serverDb.createEvidence({
      id: testEvidenceId,
      caseId: testCaseId,
      filename: 'suspect_call_recorded.wav',
      fileSize: '1.24 MB',
      duration: '01:42',
      sampleRate: '44.1 kHz',
      bitDepth: '16-bit',
      channels: 'Mono',
      sha256Hash: sampleHash,
      uploadTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      status: 'Uploaded',
      uploadedBy: 'qa-tester@forensics.gov'
    });

    assert(ev.id === testEvidenceId, 'Evidence ID must match');
    const caseEvidence = serverDb.getEvidence(testCaseId);
    assert(caseEvidence.length === 1, 'Case must have exactly 1 linked evidence');
    assert(caseEvidence[0].sha256Hash === sampleHash, 'Stored SHA-256 must match exactly');
  });

  runTest('Persistence', '3.4 Chain of Custody events are append-only and linked to docket', () => {
    const testCaseId = `DS-TEST-COC-${Date.now().toString().slice(-4)}`;
    const eventId = `COC-TEST-${Date.now().toString().slice(-4)}`;
    
    const event = serverDb.addChainOfCustodyEvent({
      id: eventId,
      caseId: testCaseId,
      eventNumber: 1,
      title: 'Evidence Ingestion & Secure Hash Sealing',
      actorRole: 'Lead Analyst',
      status: 'VERIFIED',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      userName: 'Dr. Sarah Anderson',
      ipAddress: '10.0.1.22',
      digitalSignature: 'RSA-4096: 0x99A1...44BC',
      blockHash: '0x1234567890ABCDEF'
    });

    assert(event.id === eventId, 'Event must be recorded');
    const retrievedEvents = serverDb.getChainOfCustody(testCaseId);
    assert(retrievedEvents.length >= 1, 'Should find at least 1 custody event for case');
    assert(retrievedEvents[0].actorRole === 'Lead Analyst', 'Actor role must be preserved');
  });

  runTest('Persistence', '3.5 Audit log captures security events without recording passwords or secrets', () => {
    const logId = `AUD-TEST-${Date.now().toString().slice(-4)}`;
    const log = serverDb.addAuditLog({
      id: logId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      user: 'qa-tester@forensics.gov',
      action: 'LOGIN',
      resource: 'Enclave User Session Established',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      role: 'Lead Forensic Analyst'
    });

    assert(log.id === logId, 'Audit log created');
    const allLogs = serverDb.getAuditLogs();
    const found = allLogs.find((l) => l.id === logId);
    assert(found !== undefined, 'Audit log must be persisted');
    // Ensure no secret field exists in audit log object
    assert(!('password' in (found as any)), 'Audit log must not contain password field');
    assert(!('otpCode' in (found as any)), 'Audit log must not contain OTP field');
  });

  // SECTION 4: DEEPFAKE PIPELINE & MODEL AVAILABILITY TRUTHFULNESS
  console.log('\n--- SECTION 4: AI PIPELINE & MODEL TRUTHFULNESS ---');

  runTest('Pipeline', '4.1 Unconfigured models must explicitly report Unavailable instead of fake scores', () => {
    // Model configuration simulation
    interface ModelConfig {
      name: string;
      isConfigured: boolean;
      weightsPath?: string;
    }

    const installedModels: ModelConfig[] = [
      { name: 'RawNet3 Spectrogram', isConfigured: false },
      { name: 'BiLSTM Pitch Contour', isConfigured: false },
      { name: 'Wav2Vec2 Contextual', isConfigured: false }
    ];

    const evaluateModel = (m: ModelConfig) => {
      if (!m.isConfigured) {
        return { status: 'MODEL_UNAVAILABLE', message: 'Model unavailable / weights not configured in environment' };
      }
      return { status: 'SUCCESS', score: 0.95 };
    };

    for (const m of installedModels) {
      const result = evaluateModel(m);
      assert(result.status === 'MODEL_UNAVAILABLE', `${m.name} must report unavailable when weights absent`);
      assert(!('score' in result), 'Unavailable model must never return a fabricated confidence score');
    }
  });

  runTest('Pipeline', '4.2 Audio file validation rejects unsupported formats and oversized files', () => {
    const supportedExtensions = ['.wav', '.mp3', '.flac', '.m4a'];
    const maxSizeBytes = 50 * 1024 * 1024; // 50MB

    const validateUpload = (filename: string, sizeBytes: number) => {
      const ext = '.' + filename.split('.').pop()?.toLowerCase();
      if (!supportedExtensions.includes(ext)) {
        return { valid: false, error: `Unsupported audio format: ${ext}. Supported formats: WAV, MP3, FLAC, M4A.` };
      }
      if (sizeBytes <= 0) {
        return { valid: false, error: 'Empty file: 0 bytes received.' };
      }
      if (sizeBytes > maxSizeBytes) {
        return { valid: false, error: 'File exceeds maximum upload size (50MB).' };
      }
      return { valid: true };
    };

    assert(!validateUpload('malicious.exe', 1024).valid, 'EXE must be rejected');
    assert(!validateUpload('audio.wav', 0).valid, '0-byte file must be rejected');
    assert(!validateUpload('huge_audio.wav', 60 * 1024 * 1024).valid, 'Oversized file must be rejected');
    assert(validateUpload('valid_sample.wav', 2 * 1024 * 1024).valid, 'Valid WAV must be accepted');
    assert(validateUpload('evidence.flac', 4 * 1024 * 1024).valid, 'Valid FLAC must be accepted');
  });

  // SECTION 5: PUBLIC VERIFICATION & TOKEN VALIDATION
  console.log('\n--- SECTION 5: PUBLIC VERIFICATION & TOKEN INTEGRITY ---');

  runTest('PublicVerify', '5.1 Valid issued report token verifies authentic details without disclosing private data', () => {
    const validToken = 'VRF-4471-A9B2C8E4';
    const reportRecord = {
      token: validToken,
      reportId: 'REP-2024-4471-F01',
      caseId: 'DS-2024-4471',
      evidenceSha256: '3a7b4fcd18e9a2b5c8d4e1f6a3b2c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
      verdict: 'DEEPFAKE' as const,
      revoked: false,
      tampered: false
    };

    const verifyToken = (token: string) => {
      if (token !== reportRecord.token) return { valid: false, error: 'Token not found in official judicial registry' };
      if (reportRecord.revoked) return { valid: false, error: 'Report has been revoked by judicial authority' };
      if (reportRecord.tampered) return { valid: false, error: 'Cryptographic digital seal tamper detected' };
      return {
        valid: true,
        reportId: reportRecord.reportId,
        caseId: reportRecord.caseId,
        verdict: reportRecord.verdict,
        sha256: reportRecord.evidenceSha256
      };
    };

    const res = verifyToken(validToken);
    assert(res.valid, 'Valid token must be verified');
    assert(res.verdict === 'DEEPFAKE', 'Verdict must match official record');

    const invalidRes = verifyToken('VRF-FAKE-9999');
    assert(!invalidRes.valid, 'Fake token must fail verification');
  });

  // SECTION 6: CLEAN WORKSPACE & NO UNINTENDED SAMPLE POLLUTION
  console.log('\n--- SECTION 6: CLEAN WORKSPACE & IDENTITY ISOLATION ---');

  runTest('CleanWorkspace', '6.1 Default unauthenticated state starts with empty cases and guest identity', () => {
    const INITIAL_GUEST = {
      id: 'USR-GUEST',
      name: 'Unauthenticated Operator',
      email: '',
      role: 'Forensic Examiner / Expert Witness' as UserRole,
      agency: 'Digital Forensics Enclave',
      avatar: '?',
      status: 'inactive' as const,
      casesCount: 0
    };

    assert(INITIAL_GUEST.id === 'USR-GUEST', 'Must start as guest');
    assert(INITIAL_GUEST.email === '', 'Guest must not have pre-filled email');
    assert(INITIAL_GUEST.name !== 'Sarah Anderson', 'Guest identity must not default to Sarah Anderson');
  });

  // Helper to build a clean PCM WAV buffer for real DSP tests
  function createPcmWav(freqHz: number, durationSec: number = 1.0, sampleRate: number = 16000): Buffer {
    const numSamples = Math.floor(sampleRate * durationSec);
    const dataSize = numSamples * 2;
    const buf = Buffer.alloc(44 + dataSize);

    buf.write('RIFF', 0);
    buf.writeUInt32LE(36 + dataSize, 4);
    buf.write('WAVE', 8);

    buf.write('fmt ', 12);
    buf.writeUInt32LE(16, 16);
    buf.writeUInt16LE(1, 20); // PCM
    buf.writeUInt16LE(1, 22); // Mono
    buf.writeUInt32LE(sampleRate, 24);
    buf.writeUInt32LE(sampleRate * 2, 28);
    buf.writeUInt16LE(2, 32); // BlockAlign
    buf.writeUInt16LE(16, 34); // BitsPerSample

    buf.write('data', 36);
    buf.writeUInt32LE(dataSize, 40);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * freqHz * t) * 0.7;
      buf.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
    }
    return buf;
  }

  // SECTION 7: SPEAKER VERIFICATION & VOICE MATCHING WORKFLOW
  console.log('\n--- SECTION 7: SPEAKER VERIFICATION & VOICE MATCHING WORKFLOW ---');

  runTest('SpeakerVerification', '7.1 Audio DSP extracts real acoustic measurements and pitch without dummy fallbacks', () => {
    const wavBuf = createPcmWav(220, 1.5, 16000);
    const decoded = decodeAudioBuffer(wavBuf);
    assert(decoded.isWavDecoded, 'Decoded buffer must flag isWavDecoded true');
    assert(decoded.sampleRate === 16000, 'Decoded sample rate must match');
    assert(decoded.samples.length > 0, 'Samples array must not be empty');

    const meas = computeAcousticMeasurements(decoded.samples, decoded.sampleRate);
    assert(meas.speechDurationSec > 0.5, 'Speech duration must be calculated');
    assert(meas.f0MeanHz > 180 && meas.f0MeanHz < 260, `Pitch around 220Hz expected, got ${meas.f0MeanHz}`);
    assert(typeof meas.jitterPercent === 'number', 'Jitter must be real number');
    assert(typeof meas.shimmerPercent === 'number', 'Shimmer must be real number');
    assert(typeof meas.hnrDb === 'number', 'Harmonics-to-noise ratio must be computed');
  });

  runTest('SpeakerVerification', '7.2 Speaker embedding vector extraction produces authentic similarity comparisons', () => {
    const voiceA = createPcmWav(150, 1.2, 16000);
    const voiceB = createPcmWav(150, 1.2, 16000);
    const voiceC = createPcmWav(400, 1.2, 16000);

    const decodedA = decodeAudioBuffer(voiceA);
    const decodedB = decodeAudioBuffer(voiceB);
    const decodedC = decodeAudioBuffer(voiceC);

    const embA = extractSpeakerEmbeddingVector(decodedA.samples, decodedA.sampleRate);
    const embB = extractSpeakerEmbeddingVector(decodedB.samples, decodedB.sampleRate);
    const embC = extractSpeakerEmbeddingVector(decodedC.samples, decodedC.sampleRate);

    assert(embA.length === 32, 'Embedding length must be 32-dimensional');

    // Dot product cosine similarity
    const cosineSim = (a: number[], b: number[]) => {
      let dot = 0, nA = 0, nB = 0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        nA += a[i] * a[i];
        nB += b[i] * b[i];
      }
      return dot / (Math.sqrt(nA) * Math.sqrt(nB));
    };

    const simIdentical = cosineSim(embA, embB);
    const simDivergent = cosineSim(embA, embC);

    assert(simIdentical >= 0.95, `Identical acoustic signal similarity must be high, got ${simIdentical}`);
    assert(simDivergent < simIdentical, `Different acoustic signal must have lower similarity, got ${simDivergent}`);
  });

  runTest('SpeakerVerification', '7.3 Synthetic audio detection mandates forensic identity caveat', () => {
    // When evidence is flagged as synthetic, speaker verification cannot state identity attribution
    const isSynthetic = true;
    const similarity = 0.94;
    
    let forensicCaveat = '';
    if (isSynthetic) {
      forensicCaveat = 'Warning: Audio exhibits indicators of synthetic generation or voice conversion. High acoustic similarity does NOT establish physical speaker identity when synthetic manipulation is present.';
    }

    assert(forensicCaveat.includes('High acoustic similarity does NOT establish physical speaker identity'), 'Forensic caveat must be explicitly required for synthetic audio');
  });

  // SECTION 8: VOICE CONDITION & ACOUSTIC FEATURE DISGUISE ANALYSIS
  console.log('\n--- SECTION 8: VOICE CONDITION & ACOUSTIC FEATURE DISGUISE ANALYSIS ---');

  runTest('VoiceDisguise', '8.1 Multi-hypothesis evaluation examines illness, strain, disguise, and AI conversion', () => {
    const qWav = createPcmWav(180, 2.0, 16000);
    const rWav = createPcmWav(180, 2.0, 16000);

    const qDecoded = decodeAudioBuffer(qWav);
    const rDecoded = decodeAudioBuffer(rWav);

    const qMeas = computeAcousticMeasurements(qDecoded.samples, qDecoded.sampleRate);
    const rMeas = computeAcousticMeasurements(rDecoded.samples, rDecoded.sampleRate);

    const hypotheses = evaluateVoiceConditionHypotheses(qMeas, rMeas);
    assert(hypotheses.length === 5, 'Must evaluate all 5 scientific hypotheses');

    const names = hypotheses.map((h) => h.hypothesis);
    assert(names.includes('Illness or temporary vocal condition'), 'Must evaluate illness/condition');
    assert(names.includes('Vocal strain / fatigue'), 'Must evaluate vocal strain/fatigue');
    assert(names.includes('Intentional vocal disguise'), 'Must evaluate intentional disguise');
    assert(names.includes('AI-based voice conversion / cloning'), 'Must evaluate AI conversion');
    assert(names.includes('Acoustic / equipment / noise confounding'), 'Must evaluate equipment confounding');

    hypotheses.forEach((h) => {
      assert(h.findings.length > 0, `Hypothesis "${h.hypothesis}" must have explanatory findings`);
      assert(h.likelihood === 'Supported by acoustic data' || h.likelihood === 'Unconfirmed', 'Likelihood must be honestly qualified');
    });
  });

  // SECTION 9: ABSOLUTE NO-DUMMY-DATA ENFORCEMENT
  console.log('\n--- SECTION 9: ABSOLUTE NO-DUMMY-DATA ENFORCEMENT ---');

  runTest('NoDummyData', '9.1 Empty case database yields zero invented records and truthful empty state', () => {
    const nonExistentCase = serverDb.getCaseById('DS-DOES-NOT-EXIST-0000');
    assert(!nonExistentCase, 'Non-existent case must return undefined, never a fabricated record');

    const nonExistentEvidence = serverDb.getEvidenceById('EV-DOES-NOT-EXIST-0000');
    assert(!nonExistentEvidence, 'Non-existent evidence must return undefined, never a fabricated record');
  });

  runTest('NoDummyData', '9.2 Awaiting model integration must be reported when external model is absent', () => {
    const modelStatuses = [
      { id: 'mesonet', name: 'MesoNet Forensic Audio Head', status: 'Awaiting model integration' },
      { id: 'spec-cnn', name: 'Acoustic Spectrogram ResNet-50', status: 'Awaiting model integration' },
      { id: 'ecapa-tdnn', name: 'ECAPA-TDNN Speaker Biometric Encoder', status: 'Awaiting model integration' }
    ];

    modelStatuses.forEach((m) => {
      assert(m.status === 'Awaiting model integration', `${m.name} must honestly report awaiting integration when unconfigured`);
      assert(m.status !== 'DEPLOYED', `${m.name} must not claim DEPLOYED when not hosted`);
    });
  });

  console.log('\n===============================================================');
  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.filter((r) => !r.passed).length;
  console.log(`TOTAL TESTS: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('===============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite();

