import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import API_BASE from '../../services/api';

const MAX_DISTANCE_THRESHOLD = 0.65;

export default function MobileFaceVerification({ onVerificationSuccess, studentRegNumber, token }) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('Loading AI models...');
  const [errorMsg, setErrorMsg] = useState(null);

  const videoRef = useRef(null);
  
  // Use a ref for the reference descriptor to avoid closure issues in setInterval
  const referenceDescriptorRef = useRef(null);
  const [verificationState, setVerificationState] = useState('init'); // init, position, match, success, failed

  const verifyingRef = useRef(false);
  const consecutiveFramesRef = useRef(0);
  
  // Normalize register number
  const exactRegNumber = studentRegNumber ? studentRegNumber.toUpperCase() : "UNKNOWN";
  const expectedPhotoFilename = `${exactRegNumber.toLowerCase()}.jpg`;

  useEffect(() => {
    // 13. Make sure the reference descriptor is reset whenever a different student logs in.
    referenceDescriptorRef.current = null;
    verifyingRef.current = false;
    consecutiveFramesRef.current = 0;

    const loadModelsAndReference = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        setModelsLoaded(true);
        setStatus('Initializing camera...');

        if (!studentRegNumber || exactRegNumber === "UNKNOWN") {
          throw new Error('Student Register Number is missing from session.');
        }

        // 3. Construct ONLY that student's reference photo
        const photoUrl = `/students_photos/${expectedPhotoFilename}`;
        
        // 4. Log the resolved reference filename during development
        console.log(`Login ${exactRegNumber} -> ${expectedPhotoFilename}`);

        let img;
        try {
          img = await faceapi.fetchImage(photoUrl);
        } catch (photoErr) {
          // 5. Load the reference image successfully. If cannot be loaded: STOP verification.
          console.error("Failed to load reference image:", photoErr);
          throw new Error('Registered reference photo could not be loaded.');
        }

        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection || !detection.descriptor) {
          // 6. Generate the reference face descriptor. If no face is detected: STOP.
          throw new Error('No face detected in the registered photograph. Contact admin.');
        }
        
        referenceDescriptorRef.current = detection.descriptor;
        startCamera();
      } catch (err) {
        setErrorMsg(err.message);
        setStatus('Failed');
      }
    };

    loadModelsAndReference();

    return () => {
      stopCamera();
      referenceDescriptorRef.current = null;
    };
  }, [studentRegNumber, exactRegNumber, expectedPhotoFilename]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus('Position your face inside the frame');
      setVerificationState('position');
    } catch (err) {
      console.error(err);
      setErrorMsg('Camera permission is required for mobile attendance verification.');
      setStatus('Failed');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  };

  const handleVideoPlay = () => {
    if (!modelsLoaded || !referenceDescriptorRef.current) return;

    const interval = setInterval(async () => {
      if (verifyingRef.current || verificationState === 'success' || verificationState === 'failed') return;

      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      try {
        const detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 });
        
        const detection = await faceapi.detectSingleFace(videoRef.current, detectorOptions)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection || !detection.descriptor) {
          consecutiveFramesRef.current = 0;
          setStatus('Please position your face inside the camera frame.');
          setVerificationState('position');
          return;
        }

        consecutiveFramesRef.current += 1;
        setStatus('Verifying face...');
        setVerificationState('match');

        if (consecutiveFramesRef.current >= 3 && !verifyingRef.current) {
          verifyingRef.current = true;
          
          // 12. No fallback if referenceDescriptor is missing
          if (!referenceDescriptorRef.current) {
              throw new Error("Reference descriptor missing during live matching.");
          }

          // 7 & 8. Generate live face descriptor and Calculate distance
          const liveDescriptor = detection.descriptor;
          const distance = faceapi.euclideanDistance(liveDescriptor, referenceDescriptorRef.current);
          
          // 9. Log the distance for development testing
          console.log("--- FACE VERIFICATION LOG ---");
          console.log(`Register Number: ${exactRegNumber}`);
          console.log(`Reference Filename: ${expectedPhotoFilename}`);
          console.log(`Calculated Distance: ${distance}`);
          console.log(`Threshold: ${MAX_DISTANCE_THRESHOLD}`);
          console.log("-----------------------------");

          // 16. Verify all conditions before hitting backend
          if (distance === null || distance === undefined || isNaN(distance)) {
              throw new Error("Distance calculation failed.");
          }

          if (distance <= MAX_DISTANCE_THRESHOLD) {
            setStatus('Face verified successfully');
            setVerificationState('success');

            try {
              await axios.post(`${API_BASE}/api/attendance/mobile-face-verify`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });

              setTimeout(() => {
                stopCamera();
                onVerificationSuccess();
              }, 1500);
            } catch (err) {
              console.error("Backend token issue:", err);
              setErrorMsg('Failed to bind verification to server session.');
              setVerificationState('failed');
              stopCamera();
            }
          } else {
            // 17. If distance > 0.65 reject and allow retry
            setStatus('Face does not match the registered photo');
            setVerificationState('failed');
            setErrorMsg(`The live face does not match the registered student photograph. (Score: ${distance.toFixed(3)})`);
            stopCamera();
          }
        }
      } catch (e) {
        console.error("Detection error:", e);
        if (verifyingRef.current) {
            setStatus('Verification Error');
            setVerificationState('failed');
            setErrorMsg(`An error occurred during verification: ${e.message}`);
            stopCamera();
        }
      }
    }, 200);

    return () => clearInterval(interval);
  };

  const retry = () => {
    setVerificationState('position');
    setErrorMsg(null);
    verifyingRef.current = false;
    consecutiveFramesRef.current = 0;
    startCamera();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0f172a', padding: '20px', color: '#fff', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'rgba(30,41,59,0.8)', padding: '2rem', borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxWidth: '400px', width: '100%', textAlign: 'center'
      }}>
        <div style={{
          fontSize: '2rem', marginBottom: '1rem',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800'
        }}>
          Face Verification
        </div>

        <div style={{
          position: 'relative', width: '100%', height: '280px', borderRadius: '16px', overflow: 'hidden',
          background: '#000', marginBottom: '1.5rem', border: `3px solid ${verificationState === 'success' ? '#10b981' :
              verificationState === 'failed' ? '#ef4444' : '#3b82f6'
            }`
        }}>
          {!errorMsg && (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onPlay={handleVideoPlay}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
          )}

          {verificationState === 'match' && !errorMsg && (
            <div style={{
              position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(59,130,246,0.9)', padding: '6px 16px', borderRadius: '20px',
              fontWeight: '700', fontSize: '0.9rem', animation: 'pulse 1.5s infinite'
            }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Verifying...
            </div>
          )}
        </div>

        <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', minHeight: '48px', color: errorMsg ? '#ef4444' : '#e2e8f0' }}>
          {errorMsg || status}
        </div>

        {errorMsg && (
          <button
            onClick={retry}
            style={{
              padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px',
              fontWeight: '700', cursor: 'pointer', width: '100%', fontSize: '1rem'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

