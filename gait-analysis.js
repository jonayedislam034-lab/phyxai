/* Local-only MediaPipe Pose pipeline. The camera stream never leaves this browser. */
const GaitAnalysis = (() => {
  let stream, camera, pose, running = false, lastFrame = performance.now(), frames = 0;
  const video = () => document.querySelector('#gait-video');
  const canvas = () => document.querySelector('#gait-canvas');
  const el = id => document.querySelector(id);
  const landmarkIndices = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

  function angle(a, b, c) { const ab = Math.hypot(a.x-b.x, a.y-b.y), bc = Math.hypot(c.x-b.x, c.y-b.y), ac = Math.hypot(a.x-c.x, a.y-c.y); return Math.acos(Math.min(1, Math.max(-1, (ab*ab+bc*bc-ac*ac)/(2*ab*bc)))) * 180 / Math.PI; }
  function updateResult(landmarks) {
    const hip = (landmarks[23].y + landmarks[24].y) / 2, shoulder = (landmarks[11].y + landmarks[12].y) / 2;
    const kneeAngle = (angle(landmarks[23], landmarks[25], landmarks[27]) + angle(landmarks[24], landmarks[26], landmarks[28])) / 2;
    const ankleSpread = Math.abs(landmarks[27].x - landmarks[28].x);
    let pattern = GAIT_PATTERNS[24];
    if (kneeAngle < 145) pattern = GAIT_PATTERNS.find(p => p.name === 'Crouch');
    else if (ankleSpread > .28) pattern = GAIT_PATTERNS.find(p => p.name === 'Ataxic');
    else if (hip - shoulder > .29) pattern = GAIT_PATTERNS.find(p => p.name === 'Gluteus Maximus');
    const target = el('#gait-result');
    target.innerHTML = `<span>PRELIMINARY SCREEN</span><b>${pattern.name} pattern possible</b><p>${pattern.cue} ${pattern.cause}</p>`;
    el('#gait-phase').textContent = `Knee flexion ~${Math.round(180-kneeAngle)}°`;
  }
  function onResults(results) {
    const c = canvas(), v = video(); if (!c || !v) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext('2d'); ctx.save(); ctx.clearRect(0, 0, c.width, c.height);
    if (results.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#69E0BB', lineWidth: 2 });
      landmarkIndices.forEach(i => drawLandmarks(ctx, [results.poseLandmarks[i]], { color: '#F6C458', lineWidth: 1, radius: 5 }));
      updateResult(results.poseLandmarks);
    }
    ctx.restore(); frames++; const now = performance.now(); if (now-lastFrame > 1000) { el('#gait-fps').textContent = `${frames} FPS`; frames = 0; lastFrame = now; }
  }
  async function start() {
    if (running) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } }, audio: false });
      video().srcObject = stream; await video().play();
      pose = new Pose({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` });
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: .55, minTrackingConfidence: .55 }); pose.onResults(onResults);
      camera = new Camera(video(), { onFrame: async () => { if (running) await pose.send({ image: video() }); }, width: 960, height: 720 });
      running = true; camera.start(); el('#camera-placeholder').classList.add('hidden'); el('#start-camera').disabled = true; el('#stop-camera').disabled = false;
    } catch (err) { el('#gait-result').innerHTML = `<span>CAMERA UNAVAILABLE</span><b>Permission was not granted</b><p>${err.message || 'Please allow camera access and try again.'}</p>`; }
  }
  function stop() { running = false; if (stream) stream.getTracks().forEach(t => t.stop()); video().srcObject = null; const c=canvas(); c.getContext('2d').clearRect(0,0,c.width,c.height); el('#camera-placeholder').classList.remove('hidden'); el('#start-camera').disabled = false; el('#stop-camera').disabled = true; el('#gait-fps').textContent = '— FPS'; el('#gait-phase').textContent = 'Camera stopped'; }
  return { start, stop };
})();
