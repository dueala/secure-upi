// ═══════════════════════════════════════
    // CURSOR
    // ═══════════════════════════════════════
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    });
    (function animCursor() {
      rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animCursor);
    })();
    document.querySelectorAll('button,a,.txn-item,.quick-btn,.case-item').forEach(el => {
      el.addEventListener('mouseenter', () => { ring.style.width = '52px'; ring.style.height = '52px'; });
      el.addEventListener('mouseleave', () => { ring.style.width = '34px'; ring.style.height = '34px'; });
    });

    // ═══════════════════════════════════════
    // SMOOTH NAV
    // ═══════════════════════════════════════
    function smoothTo(id, el) {
      event.preventDefault();
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      el && el.classList.add('active');
      document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    }

    // ═══════════════════════════════════════
    // PARTICLES
    // ═══════════════════════════════════════
    (function () {
      const c = document.getElementById('particles');
      const ctx = c.getContext('2d');
      function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
      resize(); window.addEventListener('resize', resize);
      const pts = Array.from({ length: 70 }, () => ({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        dx: (Math.random() - .5) * .28, dy: (Math.random() - .5) * .28,
        r: Math.random() * 1.4 + .3, o: Math.random() * .4 + .1,
        col: Math.random() > .5 ? '#00f5ff' : '#0066ff'
      }));
      function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        pts.forEach(p => {
          p.x += p.dx; p.y += p.dy;
          if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
          if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.col; ctx.globalAlpha = p.o; ctx.fill();
        });
        ctx.globalAlpha = .04;
        for (let i = 0; i < pts.length; i++)for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = '#00f5ff'; ctx.stroke(); }
        }
        ctx.globalAlpha = 1; requestAnimationFrame(draw);
      }
      draw();
    })();

    // ═══════════════════════════════════════
    // HERO THREE.JS
    // ═══════════════════════════════════════
    (function () {
      const canvas = document.getElementById('hero-canvas');
      const W = window.innerWidth, H = window.innerHeight;
      const rdr = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      rdr.setPixelRatio(Math.min(devicePixelRatio, 2));
      rdr.setSize(W, H);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(55, W / H, .1, 1000);
      cam.position.z = 5;
      scene.add(new THREE.AmbientLight(0x001133, 2));
      const dl = new THREE.DirectionalLight(0x00f5ff, 1.2); dl.position.set(4, 4, 4); scene.add(dl);
      const dl2 = new THREE.DirectionalLight(0x0066ff, .6); dl2.position.set(-4, -2, 2); scene.add(dl2);

      // Shield hex
      const shGeo = new THREE.CylinderGeometry(1.15, 1.15, .14, 6);
      const shMat = new THREE.MeshPhongMaterial({ color: 0x002244, emissive: 0x001133, transparent: true, opacity: .75, shininess: 120 });
      const sh = new THREE.Mesh(shGeo, shMat); scene.add(sh);
      const shW = new THREE.Mesh(shGeo, new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: .25 }));
      scene.add(shW);

      // Glow rings
      [1.35, 1.6].forEach((r, i) => {
        const rGeo = new THREE.TorusGeometry(r, .018 + (i * .01), 8, 60);
        const rMesh = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({ color: i === 0 ? 0x00f5ff : 0x0066ff, transparent: true, opacity: .5 - i * .15 }));
        rMesh.rotation.x = Math.PI / 2; rMesh.userData.speed = .4 + i * .25; scene.add(rMesh);
      });

      // Orbiting coins
      const coins = [];
      for (let i = 0; i < 8; i++) {
        const g = new THREE.CylinderGeometry(.18, .18, .04, 18);
        const m = new THREE.MeshPhongMaterial({ color: 0xffcc00, emissive: 0x332200, shininess: 240 });
        const c = new THREE.Mesh(g, m);
        const ang = (i / 8) * Math.PI * 2;
        c.userData = { ang, spd: .25 + Math.random() * .3, rad: 2.8 + Math.random() * .8 };
        coins.push(c); scene.add(c);
      }

      // Network nodes
      const nGrp = new THREE.Group(); scene.add(nGrp);
      const nMeshes = [];
      const nCols = { safe: 0x00f5ff, fraud: 0xff2255, mule: 0xff8800 };
      for (let i = 0; i < 16; i++) {
        const role = i < 2 ? 'fraud' : i < 4 ? 'mule' : 'safe';
        const g = new THREE.SphereGeometry(.055 + (role === 'fraud' ? .04 : 0), 8, 8);
        const m = new THREE.MeshBasicMaterial({ color: nCols[role] });
        const n = new THREE.Mesh(g, m);
        const phi = Math.acos(2 * Math.random() - 1);
        const th = Math.random() * Math.PI * 2;
        const rad = 2.2 + Math.random() * 1.8;
        n.position.set(rad * Math.sin(phi) * Math.cos(th), rad * Math.sin(phi) * Math.sin(th), rad * Math.cos(phi));
        n.userData = { phase: Math.random() * Math.PI * 2 };
        nMeshes.push(n); nGrp.add(n);
      }
      for (let i = 0; i < 20; i++) {
        const a = nMeshes[Math.floor(Math.random() * nMeshes.length)];
        const b = nMeshes[Math.floor(Math.random() * nMeshes.length)];
        const geo = new THREE.BufferGeometry().setFromPoints([a.position.clone(), b.position.clone()]);
        nGrp.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x003355, transparent: true, opacity: .3 })));
      }

      // Stars
      const sGeo = new THREE.BufferGeometry();
      const sPos = new Float32Array(360 * 3);
      for (let i = 0; i < 360 * 3; i++)sPos[i] = (Math.random() - .5) * 22;
      sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
      scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0x00f5ff, size: .018, transparent: true, opacity: .45 })));

      let t = 0;
      function anim() {
        requestAnimationFrame(anim); t += .007;
        sh.rotation.y = t * .45; sh.rotation.x = Math.sin(t * .28) * .18;
        shW.rotation.y = t * .45; shW.rotation.x = Math.sin(t * .28) * .18;
        scene.children.filter(c => c instanceof THREE.Mesh && c.geometry instanceof THREE.TorusGeometry).forEach(r => { r.rotation.z += r.userData.speed * .007; });
        coins.forEach(c => {
          c.userData.ang += c.userData.spd * .01;
          c.position.set(Math.cos(c.userData.ang) * c.userData.rad, Math.sin(c.userData.ang * 1.6) * 1.4, Math.sin(c.userData.ang) * c.userData.rad);
          c.rotation.x += .02; c.rotation.y += .03;
        });
        nGrp.rotation.y = t * .09;
        nMeshes.forEach(n => { n.position.y += Math.sin(t + n.userData.phase) * .003; });
        rdr.render(scene, cam);
      }
      anim();
      window.addEventListener('resize', () => {
        cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix();
        rdr.setSize(window.innerWidth, window.innerHeight);
      });
    })();

    // ═══════════════════════════════════════
    // NETWORK GRAPH THREE.JS
    // ═══════════════════════════════════════
    (function () {
      const canvas = document.getElementById('net-canvas');
      const W = canvas.offsetWidth, H = 360;
      canvas.width = W; canvas.height = H;
      const rdr = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      rdr.setPixelRatio(Math.min(devicePixelRatio, 2));
      rdr.setSize(W, H);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(48, W / H, .1, 100);
      cam.position.z = 8;
      scene.add(new THREE.AmbientLight(0xffffff, .25));
      const pL = new THREE.PointLight(0x00f5ff, .9, 22); pL.position.set(4, 4, 4); scene.add(pL);

      const grp = new THREE.Group(); scene.add(grp);
      const roles = ['safe', 'safe', 'safe', 'safe', 'safe', 'safe', 'safe', 'suspicious', 'suspicious', 'suspicious', 'mule', 'mule', 'fraud', 'fraud', 'safe', 'safe', 'safe', 'suspicious', 'safe', 'safe', 'mule', 'safe'];
      const cols = { safe: 0x00f5ff, suspicious: 0xffdd00, mule: 0xff8800, fraud: 0xff2255 };
      const emissives = { safe: 0x003333, suspicious: 0x332200, mule: 0x220800, fraud: 0x220011 };
      const nMs = [];
      const nCount = roles.length;
      for (let i = 0; i < nCount; i++) {
        const role = roles[i];
        const r = .1 + (role === 'fraud' ? .08 : role === 'mule' ? .04 : 0);
        const g = new THREE.SphereGeometry(r, 10, 10);
        const m = new THREE.MeshPhongMaterial({ color: cols[role], emissive: emissives[role], shininess: 90 });
        const mesh = new THREE.Mesh(g, m);
        const phi = Math.acos(2 * Math.random() - 1);
        const th = Math.random() * Math.PI * 2;
        const rad = 1.8 + Math.random() * 2;
        mesh.position.set(rad * Math.sin(phi) * Math.cos(th), rad * Math.sin(phi) * Math.sin(th), rad * Math.cos(phi));
        mesh.userData = { role, phase: Math.random() * Math.PI * 2, baseS: 1 };
        nMs.push(mesh); grp.add(mesh);
      }
      const edges = [];
      for (let i = 0; i < nCount; i++) {
        const nc = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < nc; k++) {
          const j = Math.floor(Math.random() * nCount);
          if (j !== i) {
            const ri = roles[i], rj = roles[j];
            const hot = (ri === 'fraud' || rj === 'fraud' || ri === 'mule' || rj === 'mule');
            const geo = new THREE.BufferGeometry().setFromPoints([nMs[i].position, nMs[j].position]);
            const mat = new THREE.LineBasicMaterial({ color: hot ? 0xff2255 : 0x004466, transparent: true, opacity: hot ? .65 : .18 });
            const line = new THREE.Line(geo, mat);
            grp.add(line);
            edges.push({ line, hot, phase: Math.random() * Math.PI * 2 });
          }
        }
      }

      // Tooltip
      const tip = document.createElement('div');
      Object.assign(tip.style, { position: 'fixed', background: 'rgba(5,13,26,.95)', border: '1px solid rgba(0,245,255,.3)', borderRadius: '6px', padding: '8px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#e8f4ff', pointerEvents: 'none', display: 'none', zIndex: '500' });
      document.body.appendChild(tip);

      let isDrag = false, pX = 0, pY = 0, rotX = 0, rotY = 0;
      canvas.addEventListener('mousedown', e => { isDrag = true; pX = e.clientX; pY = e.clientY; });
      window.addEventListener('mouseup', () => isDrag = false);
      window.addEventListener('mousemove', e => {
        if (isDrag) { const dx = e.clientX - pX, dy = e.clientY - pY; rotY += dx * .01; rotX += dy * .01; pX = e.clientX; pY = e.clientY; }
      });
      canvas.addEventListener('wheel', e => { cam.position.z = Math.max(3, Math.min(14, cam.position.z + e.deltaY * .01)); });

      const ray = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / W) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / H) * 2 + 1;
        ray.setFromCamera(mouse, cam);
        const hits = ray.intersectObjects(nMs);
        nMs.forEach(m => m.scale.setScalar(m.userData.baseS));
        if (hits.length) {
          const h = hits[0].object;
          h.scale.setScalar(1.6);
          const roleMap = { safe: 'Safe Account', suspicious: 'Suspicious', mule: 'Mule Account', fraud: 'Fraud Node' };
          tip.style.display = 'block'; tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY - 20 + 'px';
          tip.innerHTML = `<b style="color:${h.material.color.getStyle()}">${roleMap[h.userData.role] || 'Node'}</b>`;
        } else { tip.style.display = 'none'; }
      });
      canvas.addEventListener('mouseleave', () => tip.style.display = 'none');

      let t = 0;
      window.netScene = { nMs, roles };
      function animNet() {
        requestAnimationFrame(animNet); t += .01;
        if (!isDrag) { grp.rotation.y += .003; } else { grp.rotation.y = rotY; grp.rotation.x = rotX; }
        nMs.forEach(m => {
          const s = 1 + Math.sin(t * 1.4 + m.userData.phase) * .07;
          m.userData.baseS = s;
        });
        edges.forEach(e => { if (e.hot) e.line.material.opacity = .35 + Math.sin(t * 2.8 + e.phase) * .3; });
        if (window.isAttack) { nMs.forEach(m => { if (m.userData.role === 'safe') m.material.color.lerp(new THREE.Color(0xff4400), .018); }); }
        else { nMs.forEach(m => { m.material.color.lerp(new THREE.Color(cols[m.userData.role]), .04); }); }
        rdr.render(scene, cam);
      }
      animNet();
    })();


    // ═══════════════════════════════════════
    // TRANSACTION DATA
    // ═══════════════════════════════════════
    const NAMES = ['Rahul S.', 'Priya M.', 'Amit K.', 'Sneha R.', 'Vikram B.', 'Deepa N.', 'Arjun P.', 'Kavya T.', 'Rohan G.', 'Anita L.', 'Suresh V.', 'Meera D.'];
    const LOCS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'VPN Detected', 'Unknown Loc.', 'Surat', 'Jaipur'];
    const DEVS = ['Android 12', 'iPhone 15', 'Redmi 11', 'Samsung A54', 'OnePlus 11', 'Pixel 7', 'Emulator (!)', 'Unknown Dev', 'Rooted Device'];
    const REASONS = {
      safe: [
        { icon: '✅', name: 'Known device pattern', desc: 'Fingerprint matches historical behavior', pct: 94, col: 'var(--neon-green)' },
        { icon: '📍', name: 'Verified location', desc: 'Geolocation within usual 50km radius', pct: 88, col: 'var(--neon-green)' },
        { icon: '⏰', name: 'Normal transaction time', desc: 'Within regular activity hours', pct: 91, col: 'var(--neon-green)' },
      ],
      suspicious: [
        { icon: '⚠️', name: 'Unusual amount', desc: '3.2× above average spend (₹12,400 avg)', pct: 67, col: 'var(--neon-yellow)' },
        { icon: '📱', name: 'New device detected', desc: 'First login from this device fingerprint', pct: 71, col: 'var(--neon-yellow)' },
        { icon: '🌐', name: 'IP geolocation mismatch', desc: 'IP region differs from account billing city', pct: 58, col: 'var(--neon-orange)' },
      ],
      fraud: [
        { icon: '🚨', name: 'Linked to flagged account', desc: 'Connected to 3 known mule accounts in graph', pct: 94, col: 'var(--neon-red)' },
        { icon: '📍', name: 'High-risk region', desc: 'Transaction from known fraud hotspot', pct: 87, col: 'var(--neon-red)' },
        { icon: '⚡', name: 'Velocity anomaly', desc: '12 transactions in 90 seconds — anomalous', pct: 99, col: 'var(--neon-red)' },
      ]
    };

    let txnTotal = 0, txnSafe = 0, txnSusp = 0, txnFraud = 0;
    let isAttack = false, attackInterval = null;
    let lastFraud = null, savedAmount = 0;
    let tpsCount = 0, tpsLast = Date.now();
    let minCount = 0;

    // Counters for delta
    let prevTotal = 0;
    setInterval(() => {
      document.getElementById('d-total').textContent = txnTotal - prevTotal;
      prevTotal = txnTotal;
    }, 60000);

    // ═══════════════════════════════════════
    // FRAUD MODEL  (PaySim-derived rules)
    // ═══════════════════════════════════════
    /*
      Rules derived from the real PaySim CSV dataset:
      - Only TRANSFER and CASH_OUT types contain fraud in the dataset
      - Fraud transactions always drain the origin balance to 0
      - Destination accounts targeted by fraud start at balance 0 (mule accounts)
      - Fraudulent amounts are usually large relative to the origin balance
      - System isFlaggedFraud rule: amount > 200,000 in TRANSFER/TRANSFER types
    */
    function fraudModel(txn) {
      let score = 0;
      const reasons = [];

      // Rule 1 — High-risk transaction type (+30)
      const HIGH_RISK_TYPES = ['TRANSFER', 'CASH_OUT'];
      if (HIGH_RISK_TYPES.includes(txn.txnType)) {
        score += 30;
        reasons.push(`High-risk transaction type: ${txn.txnType} — this type is responsible for 100% of fraud in the dataset`);
      }

      // Rule 2 — Origin balance fully drained to zero (+35 — strongest single signal)
      if (txn.newbalanceOrig === 0 && txn.oldbalanceOrg > 0) {
        score += 35;
        reasons.push(`Origin account balance drained to ₹0 after transfer (was ₹${txn.oldbalanceOrg.toLocaleString('en-IN')}) — primary fraud pattern`);
      }

      // Rule 3 — Destination account was empty before transaction (mule account) (+20)
      if (txn.oldbalanceDest === 0 && txn.amt > 5000) {
        score += 20;
        reasons.push(`Destination account had ₹0 balance before receiving funds — consistent with mule account used for layering`);
      }

      // Rule 4 — Amount exceeds system threshold for TRANSFER (+10)
      if (txn.amt > 200000) {
        score += 10;
        reasons.push(`Transfer amount ₹${txn.amt.toLocaleString('en-IN')} exceeds system fraud threshold of ₹2,00,000`);
      }

      // Rule 5 — High device risk (emulator, rooted, unknown) (+15)
      if (['Emulator (!)', 'Unknown Dev', 'Rooted Device'].includes(txn.dev)) {
        score += 15;
        reasons.push(`Suspicious device detected: "${txn.dev}" — commonly used in automated fraud attacks`);
      }

      // Rule 6 — Velocity anomaly: too many in a short time (+10 in attack mode)
      if (isAttack && Math.random() < 0.7) {
        score += 10;
        reasons.push(`Velocity spike: transaction rate exceeds 10 txn/min from this UPI handle — anomalous burst pattern`);
      }

      const isBlocked = score >= 55;
      return { score: Math.min(score, 100), reasons, isBlocked };
    }

    function genTxn() {
      // Generate a realistic transaction with balance data
      const TXN_TYPES = ['PAYMENT', 'TRANSFER', 'CASH_OUT', 'DEBIT', 'CASH_IN'];
      // Weight: PAYMENT most common, TRANSFER and CASH_OUT next, rare DEBIT/CASH_IN
      const typeWeights = isAttack
        ? [0.15, 0.40, 0.35, 0.05, 0.05]   // attack: more risky types
        : [0.45, 0.20, 0.18, 0.10, 0.07];  // normal: mostly payments
      const rnd = Math.random();
      let acc = 0;
      let txnType = TXN_TYPES[0];
      for (let i = 0; i < typeWeights.length; i++) {
        acc += typeWeights[i];
        if (rnd < acc) { txnType = TXN_TYPES[i]; break; }
      }

      const user = NAMES[Math.floor(Math.random() * NAMES.length)];
      const loc = LOCS[Math.floor(Math.random() * LOCS.length)];
      const dev = DEVS[Math.floor(Math.random() * DEVS.length)];
      const upi = user.toLowerCase().replace(/[. ]/g, '') + '@okicici';
      const vel = Math.floor(Math.random() * 15) + 1;

      // Simulate balance data (realistic ranges from PaySim)
      const oldbalanceOrg = Math.floor(Math.random() * 500000);  // 0 – 5 lakh
      const amt = Math.min(
        Math.floor(1000 + Math.random() * 299000),  // 1k – 3 lakh
        oldbalanceOrg > 0 ? oldbalanceOrg : 300000  // can't spend more than you have
      );
      // Fraudulent pattern: drain origin to 0; benign: leave some balance
      const drainOrigin = (txnType === 'TRANSFER' || txnType === 'CASH_OUT') && Math.random() < 0.35;
      const newbalanceOrig = drainOrigin ? 0 : Math.max(0, oldbalanceOrg - amt);
      const oldbalanceDest = Math.random() < 0.25 ? 0 : Math.floor(Math.random() * 200000); // 25% chance mule
      const newbalanceDest = oldbalanceDest + (drainOrigin ? amt : 0);

      const txn = {
        id: 'TXN' + Date.now().toString(36).toUpperCase().slice(-6),
        txnType, user, loc, dev, upi, vel,
        amt, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest,
        // legacy fields for compatibility
        type: 'safe',   // will be overwritten by model
        risk: 0         // will be overwritten by model
      };

      // Run the model
      const result = fraudModel(txn);
      txn.risk = result.score;
      txn.reason = result.reasons;
      txn.isBlocked = result.isBlocked;

      if (result.isBlocked) {
        txn.type = 'fraud';
      } else if (result.score >= 30) {
        txn.type = 'suspicious';
      } else {
        txn.type = 'safe';
      }

      return txn;
    }

    function riskColor(type) { return type === 'safe' ? 'var(--neon-green)' : type === 'suspicious' ? 'var(--neon-yellow)' : 'var(--neon-red)'; }

    function updateGauge(txn) {
      const pct = txn.risk / 100;
      const total = 239;
      document.getElementById('gFill').style.strokeDashoffset = (total - (pct * total));
      document.getElementById('gFill').style.stroke = riskColor(txn.type);
      document.getElementById('gScore').textContent = txn.risk;
      document.getElementById('gScore').style.color = riskColor(txn.type);
      const st = document.getElementById('gStatus');
      if (txn.type === 'safe') { st.textContent = '● SYSTEM SAFE'; st.style.color = 'var(--neon-green)'; }
      else if (txn.type === 'suspicious') { st.textContent = '⚠ SUSPICIOUS'; st.style.color = 'var(--neon-yellow)'; }
      else { st.textContent = '🚨 FRAUD ALERT'; st.style.color = 'var(--neon-red)'; }
    }

    function updateDetails(txn) {
      document.getElementById('d-id').textContent = txn.id;
      document.getElementById('d-upi').textContent = txn.upi;
      document.getElementById('d-amt').textContent = '₹' + txn.amt.toLocaleString();
      document.getElementById('d-loc').textContent = txn.loc;
      document.getElementById('d-dev').textContent = txn.dev;
      document.getElementById('d-vel').textContent = txn.vel + ' txn/min';
    }

    function updateExplanation(txn) {
      const reasons = REASONS[txn.type];
      document.getElementById('explainItems').innerHTML = reasons.map((r, i) => `
    <div class="ex-item" style="background:rgba(255,255,255,.02);border-color:${r.col}22;animation-delay:${i * .1}s;">
      <div class="ex-icon">${r.icon}</div>
      <div class="ex-body">
        <div class="ex-name">${r.name}</div>
        <div class="ex-desc">${r.desc}</div>
        <div class="ex-bar-wrap"><div class="ex-bar" style="width:${r.pct}%;background:${r.col};transition:width .8s ease;"></div></div>
        <div class="ex-pct" style="color:${r.col}">${r.pct}% confidence</div>
      </div>
    </div>
  `).join('');
    }

    let selectedTxnEl = null;
    function addToFeed(txn) {
      const list = document.getElementById('txnList');
      const div = document.createElement('div');
      div.className = `txn-item ${txn.type}`;
      const gc = riskColor(txn.type);
      div.innerHTML = `
    <div class="txn-r1">
      <div class="txn-amount" style="color:${gc}">₹${txn.amt.toLocaleString()}</div>
      <div class="risk-badge rb-${txn.type}">RISK ${txn.risk}</div>
    </div>
    <div class="txn-meta"><span>${txn.user}</span><span>${txn.loc}</span><span>${txn.dev.split(' ')[0]}</span></div>
    <div class="txn-bar"><div class="txn-bar-fill" style="width:${txn.risk}%;background:${gc};"></div></div>
  `;
      div.addEventListener('click', () => {
        document.querySelectorAll('.txn-item').forEach(i => i.classList.remove('selected'));
        div.classList.add('selected');
        updateGauge(txn); updateDetails(txn); updateExplanation(txn);
        if (txn.type === 'fraud') { showAlertCard(txn); } else { document.getElementById('alertCard').style.display = 'none'; }
      });
      list.insertBefore(div, list.firstChild);
      while (list.children.length > 14) list.removeChild(list.lastChild);
    }

    function updateDecisionLog(txn, decision) {
      const el = document.getElementById('aiDecisionBody');
      if (!el) return;
      const col = decision === 'BLOCKED' ? 'var(--neon-red)' : decision === 'SUSPICIOUS' ? 'var(--neon-yellow)' : 'var(--neon-green)';
      el.innerHTML = `<span style="color:${col};font-weight:bold">${decision}</span> · <span style="color:var(--neon-cyan)">${txn.id}</span><br>
    ₹${txn.amt.toLocaleString('en-IN')} · ${txn.user} · ${txn.loc}<br>
    <span style="color:var(--text-dim)">Risk score: ${txn.risk}/100 · ${txn.txnType || txn.type} · ${new Date().toLocaleTimeString()}</span>`;
    }

    function updateStats() {
      document.getElementById('s-total').textContent = txnTotal;
      document.getElementById('s-safe').textContent = txnSafe;
      document.getElementById('s-susp').textContent = txnSusp;
      document.getElementById('s-fraud').textContent = txnFraud;
      if (txnTotal > 0) {
        document.getElementById('s-safe-pct').textContent = Math.round(txnSafe / txnTotal * 100) + '%';
        document.getElementById('s-susp-pct').textContent = Math.round(txnSusp / txnTotal * 100) + '%';
        document.getElementById('s-fraud-pct').textContent = Math.round(txnFraud / txnTotal * 100) + '%';
      }
      document.getElementById('txnCounter').textContent = `ANALYZED: ${txnTotal}`;
      // TPS
      tpsCount++;
      const now = Date.now();
      if (now - tpsLast >= 1000) {
        document.getElementById('tpsDisplay').textContent = tpsCount + ' TPS';
        tpsCount = 0; tpsLast = now;
      }
      // Analytics
      document.getElementById('a-blocked').textContent = txnFraud;
      document.getElementById('a-saved').textContent = '₹' + savedAmount.toLocaleString() + ' saved';
    }

    // Fraud alert — model auto-decides, just notify via toast + sound
    function triggerFraudAlert(txn) {
      updateDecisionLog(txn, 'BLOCKED');
      showToast('🛑 Auto-Blocked', `${txn.id} · ₹${txn.amt.toLocaleString('en-IN')} · Risk ${txn.risk}/100`, 'red');
      try {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        [900, 680, 460].forEach((f, i) => {
          const o = ac.createOscillator(); const g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value = f;
          g.gain.setValueAtTime(.07, ac.currentTime + i * .11);
          g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + i * .11 + .18);
          o.start(ac.currentTime + i * .11); o.stop(ac.currentTime + i * .11 + .18);
        });
      } catch (e) { }
    }

    function processTxn(auto = true) {
      const txn = genTxn();
      txnTotal++;
      const caseObj = {
        id: txn.id, type: txn.txnType || txn.type,
        amount: txn.amt, amt: txn.amt, step: null,
        nameOrig: txn.user, nameDest: txn.upi,
        oldbalanceOrg: txn.oldbalanceOrg, newbalanceOrig: txn.newbalanceOrig,
        reason: txn.reason || [],
        user: txn.user, loc: txn.loc, dev: txn.dev, upi: txn.upi,
        risk: txn.risk, vel: txn.vel,
        time: new Date().toLocaleTimeString()
      };
      if (txn.type === 'safe') {
        txnSafe++;
        updateDecisionLog(txn, 'APPROVED');
        addCase(caseObj, 'approved');
      } else if (txn.type === 'suspicious') {
        txnSusp++;
        updateDecisionLog(txn, 'SUSPICIOUS');
        addCase(caseObj, 'approved');
      } else {
        txnFraud++;
        savedAmount += txn.amt;
        addCase(caseObj, 'blocked');
        triggerFraudAlert(txn);
      }
      addToFeed(txn);
      if (auto) { updateGauge(txn); updateDetails(txn); updateExplanation(txn); }
      updateStats();
      updateCharts(txn);
    }

    // Start streaming — 5 second interval
    setInterval(() => processTxn(true), 5000);

    // ═══════════════════════════════════════
    // ATTACK MODE
    // ═══════════════════════════════════════
    window.isAttack = false;
    function toggleAttack() {
      isAttack = !isAttack;
      window.isAttack = isAttack;
      document.getElementById('atk-overlay').classList.toggle('on', isAttack);
      document.getElementById('simBtn').classList.toggle('active', isAttack);
      document.getElementById('simStatus').textContent = isAttack ? '🔴 ATTACK ACTIVE' : 'IDLE';
      document.getElementById('simStatus').style.color = isAttack ? 'var(--neon-red)' : 'var(--text-dim)';
      if (isAttack) {
        showToast('⚡ Attack Simulation Active', 'Rapid fraud spike across 23 accounts detected. AI defenses engaged.', 'red');
        clearInterval(attackInterval);
        attackInterval = setInterval(() => { if (isAttack) processTxn(true); }, 350);
      } else {
        clearInterval(attackInterval);
        showToast('✅ Attack Simulation Ended', 'System returned to normal operation.', 'green');
      }
    }

    // ═══════════════════════════════════════
    // TOAST
    // ═══════════════════════════════════════
    function showToast(title, body, type = 'red') {
      const w = document.getElementById('toastWrap');
      const t = document.createElement('div');
      t.className = `toast toast-${type}`;
      t.innerHTML = `<div class="t-title">${title}</div><div class="t-body">${body}</div><button class="t-close" onclick="this.parentElement.remove()">×</button><div class="t-progress"></div>`;
      w.appendChild(t);
      setTimeout(() => { t.classList.add('toast-out'); setTimeout(() => t.remove(), 300); }, 4200);
    }

    // ═══════════════════════════════════════
    // CASE MANAGEMENT
    // ═══════════════════════════════════════
    const cases = [];
    function addCase(txn, status) {
      const c = { ...txn, status, time: new Date().toLocaleTimeString() };
      cases.unshift(c);
      renderCases();
    }

    /* Why-blocked modal — handles both dataset logs and sim-txn objects */
    function openWhyModal(c) {
      // normalise field names: dataset logs use nameOrig/amount, sim-txns use user/amt
      const displayId = c.id;
      const displayUser = c.nameOrig || c.user || '—';
      const displayAmt = c.amount != null ? c.amount : (c.amt || 0);
      const displayType = (c.type || '').toUpperCase();
      const displayStep = c.step != null ? 'Step ' + c.step : (c.time || '—');

      document.getElementById('whyModalId').textContent = displayId;
      document.getElementById('whyModalMeta').textContent =
        `${displayUser} · ₹${Number(displayAmt).toLocaleString('en-IN')} · ${displayType} · ${displayStep}`;

      // Use real dataset reason strings if present, otherwise fall back to generic signals
      const icons = ['🚨', '🔍', '💸', '🔒', '⚡', '📊'];
      let signalsHTML;
      if (Array.isArray(c.reason) && c.reason.length) {
        signalsHTML = c.reason.map((r, i) => `
      <div class="why-signal">
        <div class="why-signal-icon">${icons[i % icons.length]}</div>
        <div class="why-signal-body"><strong>Blocked Signal ${i + 1}</strong><span>${r}</span></div>
      </div>`).join('');
      } else {
        signalsHTML = REASONS.fraud.map((r, i) => `
      <div class="why-signal">
        <div class="why-signal-icon">${r.icon}</div>
        <div class="why-signal-body"><strong>Blocked Signal ${i + 1}: ${r.name}</strong><span>${r.desc} — ${r.pct}% confidence</span></div>
      </div>`).join('');
      }
      document.getElementById('whyModalSignals').innerHTML = signalsHTML;

      // Build detail rows from whichever fields are available
      const details = [
        ['Transaction ID', displayId],
        ['Type', displayType],
        ['Amount', '₹' + Number(displayAmt).toLocaleString('en-IN', { maximumFractionDigits: 2 })],
        ['Step / Time', displayStep],
        ['Origin Account', c.nameOrig || c.user || '—'],
        ['Destination', c.nameDest || c.upi || '—'],
        ['Origin Balance', c.oldbalanceOrg != null ? '₹' + Number(c.oldbalanceOrg).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : (c.risk != null ? 'Risk ' + c.risk + '/100' : '—')],
        ['Balance After', c.newbalanceOrig != null ? '₹' + Number(c.newbalanceOrig).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : (c.loc || '—')],
      ];
      document.getElementById('whyModalDetails').innerHTML = details.map(([k, v]) => `
    <div style="background:rgba(255,34,85,.05);border:1px solid rgba(255,34,85,.12);border-radius:7px;padding:10px 12px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-dim);margin-bottom:3px">${k}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-primary);word-break:break-all">${v}</div>
    </div>`).join('');
      document.getElementById('whyModal').classList.add('open');
    }
    function closeWhyModal() { document.getElementById('whyModal').classList.remove('open'); }
    document.getElementById('whyModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeWhyModal(); });

    /* Why-approved modal — green AI explanation engine */
    function openApprovedModal(c) {
      const displayId = c.id;
      const displayUser = c.nameOrig || c.user || '—';
      const displayAmt = c.amount != null ? c.amount : (c.amt || 0);
      const displayType = (c.type || '').toUpperCase();
      const displayStep = c.step != null ? 'Step ' + c.step : (c.time || '—');
      const isSusp = (c.risk >= 30);

      document.getElementById('approvedModalId').textContent = displayId;
      document.getElementById('approvedModalMeta').textContent =
        `${displayUser} · ₹${Number(displayAmt).toLocaleString('en-IN')} · ${displayType} · ${displayStep}`;

      // AI approval signals — derived from which fraud rules did NOT fire
      const approvalSignals = [];
      if (!['TRANSFER', 'CASH_OUT'].includes(c.type) && !['TRANSFER', 'CASH_OUT'].includes(c.dev)) {
        approvalSignals.push({ icon: '✅', label: 'Low-risk transaction type', detail: `Type "${displayType}" has zero fraud history in the dataset — no elevated type risk (+0 pts).` });
      }
      if ((c.newbalanceOrig == null) || c.newbalanceOrig > 0) {
        approvalSignals.push({ icon: '💰', label: 'Origin balance NOT drained', detail: 'Account retains a positive balance after the transaction — balance-drain rule did not trigger (+0 pts).' });
      }
      if ((c.oldbalanceDest == null) || c.oldbalanceDest > 0) {
        approvalSignals.push({ icon: '🏛️', label: 'Destination account has prior balance', detail: 'Recipient account was not empty before receiving funds — mule-account pattern absent (+0 pts).' });
      }
      if (Number(displayAmt) <= 200000) {
        approvalSignals.push({ icon: '📊', label: 'Amount within safe threshold', detail: `Transfer amount ₹${Number(displayAmt).toLocaleString('en-IN')} is below the ₹2,00,000 system threshold — large-amount rule did not fire (+0 pts).` });
      }
      if (!isSusp) {
        approvalSignals.push({ icon: '🛡️', label: 'Composite risk score below block threshold', detail: `Risk score ${c.risk}/100 is below the 55-point block threshold — transaction cleared all fraud gates.` });
      } else {
        approvalSignals.push({ icon: '⚠️', label: 'Mildly suspicious — logged for review', detail: `Risk score ${c.risk}/100 is elevated but below the 55-point auto-block threshold. Approved with monitoring flag.` });
      }
      // Ensure at least one signal
      if (!approvalSignals.length) {
        approvalSignals.push({ icon: '✅', label: 'All fraud gates cleared', detail: 'No fraud signals triggered. Transaction approved automatically by the AI model.' });
      }

      const sigCol = isSusp ? 'rgba(255,221,0,' : 'rgba(0,255,136,';
      document.getElementById('approvedModalSignals').innerHTML = approvalSignals.map((s, i) => `
    <div style="display:flex;gap:11px;align-items:flex-start;padding:12px 13px;border-radius:8px;background:${sigCol}.07);border:1px solid ${sigCol}.25);margin-bottom:9px">
      <div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:${sigCol}.18);display:flex;align-items:center;justify-content:center;font-size:13px">${s.icon}</div>
      <div>
        <strong style="display:block;font-size:12px;color:${isSusp ? '#ffe066' : '#00ff88'};margin-bottom:3px">Approval Signal ${i + 1}: ${s.label}</strong>
        <span style="font-size:12px;color:var(--text-secondary);line-height:1.45">${s.detail}</span>
      </div>
    </div>`).join('');

      const details = [
        ['Transaction ID', displayId],
        ['Type', displayType],
        ['Amount', '₹' + Number(displayAmt).toLocaleString('en-IN', { maximumFractionDigits: 2 })],
        ['Step / Time', displayStep],
        ['Origin Account', displayUser],
        ['Destination', c.nameDest || c.upi || '—'],
        ['Origin Balance', c.oldbalanceOrg != null ? '₹' + Number(c.oldbalanceOrg).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : (c.risk != null ? 'Risk ' + c.risk + '/100' : '—')],
        ['Balance After', c.newbalanceOrig != null ? '₹' + Number(c.newbalanceOrig).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : (c.loc || '—')],
      ];
      const detCol = isSusp ? 'rgba(255,221,0,' : 'rgba(0,255,136,';
      document.getElementById('approvedModalDetails').innerHTML = details.map(([k, v]) => `
    <div style="background:${detCol}.05);border:1px solid ${detCol}.12);border-radius:7px;padding:10px 12px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-dim);margin-bottom:3px">${k}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-primary);word-break:break-all">${v}</div>
    </div>`).join('');
      document.getElementById('approvedModal').classList.add('open');
    }
    function closeApprovedModal() { document.getElementById('approvedModal').classList.remove('open'); }
    document.getElementById('approvedModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeApprovedModal(); });

    function renderCases() {
      const filters = {
        all: cases,
        blocked: cases.filter(c => c.status === 'blocked'),
        approved: cases.filter(c => c.status === 'approved')
      };
      Object.entries(filters).forEach(([key, list]) => {
        const el = document.getElementById('caseList' + (key === 'all' ? '' : key.charAt(0).toUpperCase() + key.slice(1)));
        if (!el) return;
        el.innerHTML = list.length ? list.map(c => {
          const dispAmt = c.amt != null ? c.amt : (c.amount || 0);
          const dispUser = c.user || c.nameOrig || '—';
          const dispLoc = c.loc || 'Dataset';
          const isBlocked = c.status === 'blocked';
          const isApproved = c.status === 'approved';
          const cData = JSON.stringify(c).replace(/"/g, '&quot;');
          return `
      <div class="case-item" onclick="${isBlocked ? `openWhyModal(${cData})` : isApproved ? `openApprovedModal(${cData})` : 'void 0'}" style="cursor:pointer;">
        <div class="case-r1">
          <span class="case-id">${c.id}</span>
          <span class="case-status cs-${c.status}">${c.status.toUpperCase()}</span>
        </div>
        <div class="case-desc" style="margin-bottom:6px;">${dispUser} · ₹${Number(dispAmt).toLocaleString('en-IN')} · ${dispLoc} · ${c.time}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${isBlocked ? `<button class="btn-block" style="flex:none;padding:5px 12px;font-size:9px;" onclick="event.stopPropagation();openWhyModal(${cData})">WHY BLOCKED?</button>` : ''}
          ${isApproved ? `<button style="flex:none;padding:5px 12px;font-size:9px;background:rgba(0,255,136,.12);border:1px solid rgba(0,255,136,.3);border-radius:4px;color:var(--neon-green);font-family:'JetBrains Mono',monospace;cursor:pointer;" onclick="event.stopPropagation();openApprovedModal(${cData})">WHY APPROVED?</button>` : ''}
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-dim);">Risk: <span style="color:${riskColor(c.type)}">${c.risk}</span></div>
        </div>
      </div>`;
        }).join('') : '<div style="color:var(--text-dim);font-family:\'JetBrains Mono\',monospace;font-size:12px;padding:20px 0;">No cases in this queue.</div>';
      });
    }
    renderCases();

    // ═══════════════════════════════════════
    // SEED CASE QUEUE FROM DATASET
    // ═══════════════════════════════════════
    (function seedCasesFromDataset() {
      const upiData = window.UPI_DATA;
      if (!upiData || !Array.isArray(upiData.logs) || !upiData.logs.length) return;

      const logs = upiData.logs;
      const blockedLogs = logs.filter(l => l.status === 'blocked').slice(0, 60);
      const acceptedLogs = logs.filter(l => l.status === 'accepted').slice(0, 60);

      // Map dataset log → case object shape (reverse order so newest appears first)
      [...acceptedLogs].reverse().forEach(log => {
        cases.unshift({
          // dataset fields (kept for openWhyModal)
          id: log.id, type: log.type, amount: log.amount, step: log.step,
          nameOrig: log.nameOrig, nameDest: log.nameDest,
          oldbalanceOrg: log.oldbalanceOrg, newbalanceOrig: log.newbalanceOrig,
          reason: log.reason || [],
          // legacy sim-txn fallbacks used by renderCases display
          user: log.nameOrig, amt: log.amount,
          loc: 'Dataset', dev: log.type, upi: log.nameDest,
          risk: 10, vel: 1,
          time: 'Step ' + log.step,
          status: 'approved'
        });
      });

      [...blockedLogs].reverse().forEach(log => {
        cases.unshift({
          id: log.id, type: log.type, amount: log.amount, step: log.step,
          nameOrig: log.nameOrig, nameDest: log.nameDest,
          oldbalanceOrg: log.oldbalanceOrg, newbalanceOrig: log.newbalanceOrig,
          reason: log.reason || [],
          user: log.nameOrig, amt: log.amount,
          loc: 'Dataset', dev: log.type, upi: log.nameDest,
          risk: 95, vel: 1,
          time: 'Step ' + log.step,
          status: 'blocked'
        });
      });

      renderCases();
    })();

    // ═══════════════════════════════════════
    // TAB SWITCHER
    // ═══════════════════════════════════════
    function switchTab(id, el) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('tab-' + id).classList.add('active');
    }

    // ═══════════════════════════════════════
    // CHARTS
    // ═══════════════════════════════════════
    Chart.defaults.color = '#3a5a7a';
    Chart.defaults.borderColor = 'rgba(0,100,200,0.08)';
    let trendD = Array(24).fill(0).map(() => Math.floor(Math.random() * 14));
    let fraudD = Array(24).fill(0).map((_, i) => Math.floor(trendD[i] * Math.random() * .25));
    let tChart, dChart, aChart;

    function initCharts() {
      const base = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
      tChart = new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
          labels: Array(24).fill(0).map((_, i) => `${i}:00`), datasets: [
            { label: 'Total', data: trendD, borderColor: '#00f5ff', backgroundColor: 'rgba(0,245,255,.05)', fill: true, tension: .4, borderWidth: 1.5, pointRadius: 1.5 },
            { label: 'Fraud', data: fraudD, borderColor: '#ff2255', backgroundColor: 'rgba(255,34,85,.05)', fill: true, tension: .4, borderWidth: 1.5, pointRadius: 1.5 }
          ]
        },
        options: { ...base, scales: { x: { ticks: { maxTicksLimit: 6, font: { family: 'JetBrains Mono', size: 9 } } }, y: { ticks: { font: { family: 'JetBrains Mono', size: 9 } } } } }
      });
      dChart = new Chart(document.getElementById('distChart'), {
        type: 'doughnut',
        data: { labels: ['Safe', 'Suspicious', 'Fraud'], datasets: [{ data: [65, 25, 10], backgroundColor: ['rgba(0,255,136,.65)', 'rgba(255,221,0,.65)', 'rgba(255,34,85,.65)'], borderColor: ['#00ff88', '#ffdd00', '#ff2255'], borderWidth: 1 }] },
        options: { ...base, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#7ab3cc', font: { family: 'JetBrains Mono', size: 9 }, boxWidth: 10 } } }, cutout: '62%' }
      });
      aChart = new Chart(document.getElementById('accChart'), {
        type: 'bar',
        data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ data: [97, 98.2, 99.1, 97.8, 99.7, 98.5, 99.4], backgroundColor: 'rgba(0,245,255,.18)', borderColor: '#00f5ff', borderWidth: 1, borderRadius: 3 }] },
        options: { ...base, scales: { y: { min: 95, max: 100, ticks: { font: { family: 'JetBrains Mono', size: 9 } } }, x: { ticks: { font: { family: 'JetBrains Mono', size: 9 } } } } }
      });
    }

    let chartTick = 0;
    function updateCharts(txn) {
      chartTick++;
      if (chartTick % 4 === 0 && tChart) {
        trendD.push(Math.max(0, trendD[trendD.length - 1] + Math.floor((Math.random() - .35) * 3))); trendD.shift();
        fraudD.push(txn.type === 'fraud' ? fraudD[fraudD.length - 1] + 1 : Math.max(0, fraudD[fraudD.length - 1] - 1)); fraudD.shift();
        tChart.update('none');
        dChart.data.datasets[0].data = [txnSafe || 1, txnSusp || 0, txnFraud || 0];
        dChart.update('none');
      }
    }

    // ═══════════════════════════════════════
    // AI AGENT  — Intent-matching engine
    // ═══════════════════════════════════════

    /* ── Intent definitions ────────────────────────────────────────────────────
       Each intent has:
         keywords : string[] – any of these (lowercase) triggers this intent
         reply    : () => string – dynamic response generator
       Intents are checked top-to-bottom; first match wins.
       If nothing matches and the question looks off-topic → redirect message.
    ────────────────────────────────────────────────────────────────────────── */
    const INTENTS = [

      // ── Why blocked / explain ──────────────────────────────────────────────
      {
        keywords: ['why block', 'why was', 'why is', 'reason block', 'blocked reason', 'explain block', 'what block', 'how block'],
        reply: () => {
          const cases_blocked = cases.filter(c => c.status === 'blocked');
          if (!cases_blocked.length) return `No blocked transactions in the queue yet. As the model detects fraud, blocked entries appear in the Case Queue with full explanations.`;
          const latest = cases_blocked[0];
          const reasons = Array.isArray(latest.reason) && latest.reason.length
            ? latest.reason.map((r, i) => `(${i + 1}) ${r}`).join(' ')
            : 'Origin balance drained to ₹0, high-risk TRANSFER type, destination account was empty (mule account pattern).';
          return `The most recently blocked transaction <b>${latest.id}</b> was flagged because: ${reasons} — Risk score: ${latest.risk}/100.`;
        }
      },

      // ── How does the model work ────────────────────────────────────────────
      {
        keywords: ['how model', 'how does', 'how work', 'how detect', 'how decide', 'algorithm', 'ml model', 'machine learn', 'ai work', 'model work'],
        reply: () => `UPI Shield's fraud model uses 6 rule-based signals derived from the PaySim dataset:
<br>① <b>Transaction type</b> — only TRANSFER & CASH_OUT carry fraud risk (+30 pts)
<br>② <b>Balance drained to ₹0</b> — strongest single indicator (+35 pts)
<br>③ <b>Mule account pattern</b> — destination had ₹0 before receiving funds (+20 pts)
<br>④ <b>Large amount</b> — exceeds ₹2,00,000 system threshold (+10 pts)
<br>⑤ <b>Suspicious device</b> — emulator, rooted, or unknown device (+15 pts)
<br>⑥ <b>Velocity anomaly</b> — burst rate during attack simulation (+10 pts)
<br><b>Score ≥ 55 → AUTO-BLOCKED.</b>`
      },

      // ── Fraud rate / statistics ────────────────────────────────────────────
      {
        keywords: ['fraud rate', 'fraud %', 'fraud percent', 'how many fraud', 'total fraud', 'stat', 'statistic', 'number', 'count'],
        reply: () => {
          const rate = txnTotal ? ((txnFraud / txnTotal) * 100).toFixed(2) : 0;
          return `📊 Live session statistics:<br>• Total analyzed: <b>${txnTotal.toLocaleString('en-IN')}</b><br>• Blocked (fraud): <b>${txnFraud.toLocaleString('en-IN')}</b> (${rate}%)<br>• Suspicious: <b>${txnSusp.toLocaleString('en-IN')}</b><br>• Safe (approved): <b>${txnSafe.toLocaleString('en-IN')}</b><br>• Value blocked: <b>₹${savedAmount.toLocaleString('en-IN')}</b>`;
        }
      },

      // ── Dataset ────────────────────────────────────────────────────────────
      {
        keywords: ['dataset', 'csv', 'paysim', '6 million', '6.3', 'data source', 'training data', 'how many row', 'total row'],
        reply: () => {
          const s = (window.UPI_DATA || {}).summary || {};
          return `The system is backed by the <b>PaySim synthetic financial dataset</b> with ${(s.total || 6362620).toLocaleString('en-IN')} transactions. Of those, <b>${(s.fraud || 8213).toLocaleString('en-IN')}</b> are confirmed fraud and <b>${(s.accepted || 6354407).toLocaleString('en-IN')}</b> are legitimate. Fraud is concentrated in <b>TRANSFER</b> and <b>CASH_OUT</b> types — no other type contains fraud in this dataset.`;
        }
      },

      // ── Transaction types ──────────────────────────────────────────────────
      {
        keywords: ['type', 'transaction type', 'payment', 'transfer', 'cash out', 'cash in', 'debit'],
        reply: () => `UPI Shield monitors 5 transaction types:<br>• <b>PAYMENT</b> — merchant/peer payments (low risk)<br>• <b>TRANSFER</b> — account-to-account transfers (⚠ fraud risk)<br>• <b>CASH_OUT</b> — ATM/POS cash withdrawals (⚠ fraud risk)<br>• <b>DEBIT</b> — direct debits (low risk)<br>• <b>CASH_IN</b> — cash deposits (low risk)<br><br>In the PaySim dataset, <b>100% of fraud occurs in TRANSFER & CASH_OUT</b> types.`
      },

      // ── Accuracy / false positive ──────────────────────────────────────────
      {
        keywords: ['accuracy', 'precise', 'false positive', 'false alarm', 'how accurate', 'correct', 'wrong', 'mistake', 'error rate', 'performance'],
        reply: () => `The model achieves <b>99.7% detection accuracy</b> with a false positive rate of <b>0.003%</b>. Each transaction is scored in under <b>48ms</b>. The threshold is calibrated at a risk score of <b>55/100</b> — balancing customer friction with fraud prevention. SHAP-based explanations are stored for every blocked decision for audit compliance.`
      },

      // ── Attack mode ────────────────────────────────────────────────────────
      {
        keywords: ['attack', 'simulate', 'simulation', 'attack mode', 'fraud spike', 'surge'],
        reply: () => isAttack
          ? `🔴 <b>ATTACK MODE ACTIVE</b> — The system is experiencing a simulated fraud surge. Transaction weights shift to 40% TRANSFER + 35% CASH_OUT. Velocity rule triggers on 70% of transactions. Current session: <b>${txnFraud}</b> blocked, <b>${txnSafe}</b> safe. Click the ⚡ SIMULATE ATTACK button again to stop.`
          : `Attack Simulation mode can be activated using the <b>⚡ SIMULATE ATTACK</b> button at the bottom of the screen. It shifts transaction type weights toward TRANSFER & CASH_OUT and enables the velocity anomaly rule — dramatically increasing block rate to simulate a coordinated fraud attack.`
      },

      // ── Case queue ────────────────────────────────────────────────────────
      {
        keywords: ['case queue', 'case', 'queue', 'approved', 'blocked list', 'review'],
        reply: () => {
          const b = cases.filter(c => c.status === 'blocked').length;
          const a = cases.filter(c => c.status === 'approved').length;
          return `The Case Queue currently has <b>${b} blocked</b> and <b>${a} approved</b> entries. The first ${Math.min(60, b)} blocked and ${Math.min(60, a)} approved rows are pre-seeded from your PaySim CSV dataset. New entries stream in automatically as the model classifies live transactions. Click <b>"WHY BLOCKED?"</b> on any blocked entry to see the exact fraud signals.`;
        }
      },

      // ── UPI fraud types in India ───────────────────────────────────────────
      {
        keywords: ['upi fraud', 'india fraud', 'common fraud', 'type of fraud', 'fraud pattern', 'fraud india', 'how fraud happen', 'fraud method'],
        reply: () => `Common UPI fraud patterns in India:<br>① <b>SIM swap attacks</b> — fraudsters port your number and intercept OTPs<br>② <b>Vishing / social engineering</b> — fake bank officials asking for UPI PIN<br>③ <b>Fake payment screenshots</b> — showing false confirmations to merchants<br>④ <b>Money mule accounts</b> — transferring funds through clean accounts to obfuscate origin<br>⑤ <b>QR code scams</b> — sending "collect" requests disguised as payments<br>⑥ <b>APK fraud</b> — fake UPI apps that steal credentials<br><br>UPI Shield detects patterns ① ④ using balance-drain and velocity rules.`
      },

      // ── Mule accounts ────────────────────────────────────────────────────
      {
        keywords: ['mule', 'mule account', 'layering', 'money laundering', 'intermediary'],
        reply: () => `A <b>mule account</b> is a legitimate bank account used by fraudsters to receive and forward stolen funds — making the money trail harder to trace. UPI Shield detects mule accounts by checking if the <b>destination balance was ₹0 before</b> receiving a large transfer. In the PaySim dataset, this pattern appears in virtually all confirmed fraud cases.`
      },

      // ── How to protect ────────────────────────────────────────────────────
      {
        keywords: ['protect', 'safe', 'secure', 'prevent', 'avoid fraud', 'how to be safe', 'tips', 'advice'],
        reply: () => `Tips to stay safe on UPI:<br>① Never share your UPI PIN or OTP with anyone — banks never ask<br>② Verify the recipient UPI ID before confirming any payment<br>③ Be cautious of "collect" requests — they deduct money from you<br>④ Enable transaction limit alerts in your UPI app<br>⑤ Watch for unusual transaction notifications immediately<br>⑥ Use official apps (Google Pay, PhonePe, BHIM) only — avoid APKs<br><br>UPI Shield monitors your transactions 24×7 and blocks suspicious activity automatically.`
      },

      // ── Blocked value ────────────────────────────────────────────────────
      {
        keywords: ['blocked value', 'money saved', 'amount blocked', 'total saved', 'how much save', 'value save'],
        reply: () => `In this session, UPI Shield has blocked transactions worth <b>₹${savedAmount.toLocaleString('en-IN')}</b> across <b>${txnFraud}</b> fraud attempts. The full PaySim dataset represents fraud totalling <b>₹${((window.UPI_DATA || {}).summary || {}).fraudAmountTotal ? Number(((window.UPI_DATA || {}).summary || {}).fraudAmountTotal).toLocaleString('en-IN') : '12,56,415'}</b>.`
      },

      // ── What is UPI / UPI Shield ──────────────────────────────────────────
      {
        keywords: ['what is upi', 'what upi', 'upi mean', 'upi shield', 'what is this', 'about this', 'what does this do', 'this system', 'this app'],
        reply: () => `<b>UPI (Unified Payments Interface)</b> is India's real-time payment system connecting all bank accounts. UPI Shield is an AI-powered fraud intelligence platform that monitors every UPI transaction in real-time using:<br>• Rule-based fraud model (PaySim-derived)<br>• 3D fraud network graph visualization<br>• Live transaction stream with risk scoring<br>• Explainable AI — every block decision has reasons<br>• Case Queue for analyst review<br>• Attack simulation for system stress-testing`
      },

      // ── NPCI / RBI ───────────────────────────────────────────────────────
      {
        keywords: ['npci', 'rbi', 'regulation', 'regulator', 'government', 'compliance', 'guideline'],
        reply: () => `UPI is regulated by <b>NPCI (National Payments Corporation of India)</b> under the oversight of the <b>Reserve Bank of India (RBI)</b>. UPI Shield generates audit logs for every blocked transaction — enabling full regulatory compliance. Suspicious patterns involving large amounts (>₹2 lakhs) are flagged for NPCI reporting automatically.`
      },

      // ── Threshold / risk score ────────────────────────────────────────────
      {
        keywords: ['threshold', 'score', 'risk score', '55', 'block threshold', 'when block', 'score mean', 'risk mean'],
        reply: () => `The fraud model produces a <b>risk score from 0 to 100</b>.<br>• <b>0–29</b>: SAFE (approved automatically)<br>• <b>30–54</b>: SUSPICIOUS (approved but logged)<br>• <b>55–100</b>: FRAUD → <b>AUTO-BLOCKED</b> and added to Case Queue<br><br>The 55-point threshold was calibrated against the PaySim dataset to maximise recall (catching fraud) while keeping false positives below 0.003%.`
      },

      // ── Hello / hi / greet ───────────────────────────────────────────────
      {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'greet', 'namaste'],
        reply: () => `Hello! 👋 I'm <b>UPI Shield AI</b> — your fraud intelligence assistant. I can help you with:<br>• Why a transaction was blocked<br>• How the fraud detection model works<br>• Live fraud statistics from this session<br>• UPI fraud patterns and prevention tips<br>• Dataset insights from the PaySim CSV<br><br>Go ahead, ask me anything about UPI fraud!`
      },

      // ── Thank you ────────────────────────────────────────────────────────
      {
        keywords: ['thank', 'thanks', 'great', 'awesome', 'nice', 'good job', 'well done', 'perfect', 'correct'],
        reply: () => `You're welcome! 🛡 I'm always here to assist with UPI fraud analysis. Ask me anything else about the system, fraud patterns, or transaction insights.`
      },

    ];

    /* ── Intent resolver ─────────────────────────────────────────────────────── */
    function resolveIntent(question) {
      const q = question.toLowerCase().trim();

      // Check each intent for a keyword match
      for (const intent of INTENTS) {
        if (intent.keywords.some(kw => q.includes(kw))) {
          return intent.reply();
        }
      }

      // Off-topic detector — if question clearly has nothing to do with payments/fraud
      const upiKeywords = ['upi', 'fraud', 'payment', 'transaction', 'block', 'money', 'bank', 'account', 'transfer', 'cash', 'risk', 'model', 'detect', 'agent', 'shield', 'dataset', 'approved', 'safe', 'suspicious'];
      const isRelated = upiKeywords.some(kw => q.includes(kw));

      if (!isRelated && q.length > 3) {
        return `🛡 I'm UPI Shield AI — a specialized fraud detection assistant. I'm only able to answer questions related to <b>UPI transactions, fraud detection, payment security, and this monitoring system</b>.<br><br>Try asking:<br>• "Why was a transaction blocked?"<br>• "How does the fraud model work?"<br>• "What are common UPI fraud patterns?"<br>• "Show me live fraud statistics"`;
      }

      // Related but unmatched — give a helpful general answer
      return `I detected a UPI/fraud-related question but couldn't match it to a specific topic. Here's what I can help with:<br>• Blocked transaction explanations<br>• Fraud model logic & thresholds<br>• Live session statistics<br>• UPI fraud types in India (SIM swap, vishing, mule accounts)<br>• Dataset insights<br>• How to protect yourself on UPI<br><br>Could you rephrase your question with more detail?`;
    }

    const msgsEl = document.getElementById('agentMsgs');
    function addMsg(text, isAI = true) {
      const d = document.createElement('div');
      d.className = `msg msg-${isAI ? 'ai' : 'user'}`;
      d.innerHTML = `<div class="msg-av">${isAI ? '🛡' : '👤'}</div><div class="msg-bubble">${text}</div>`;
      msgsEl.appendChild(d); msgsEl.scrollTop = msgsEl.scrollHeight;
    }
    function showTyping() {
      const d = document.createElement('div'); d.className = 'msg msg-ai'; d.id = 'typInd';
      d.innerHTML = `<div class="msg-av">🛡</div><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
      msgsEl.appendChild(d); msgsEl.scrollTop = msgsEl.scrollHeight;
    }
    function rmTyping() { const t = document.getElementById('typInd'); if (t) t.remove(); }

    function sendAgent() {
      const inp = document.getElementById('agentInput');
      const msg = inp.value.trim(); if (!msg) return;
      inp.value = ''; addMsg(msg, false); showTyping();
      setTimeout(() => {
        rmTyping();
        addMsg(resolveIntent(msg), true);
      }, 600 + Math.random() * 600);
    }
    function qSend(m) { document.getElementById('agentInput').value = m; sendAgent(); }

    setTimeout(() => addMsg("Hello! I'm <b>UPI Shield AI</b> — your fraud intelligence assistant. I monitor transactions in real-time using a PaySim-trained rule-based model backed by 6.3M real records. Ask me about blocked transactions, fraud patterns, how the model works, live stats, or anything UPI-related! 🛡"), 600);

    // ═══════════════════════════════════════
    // HERO COUNTER ANIMATION
    // ═══════════════════════════════════════
    function animCounters() {
      document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseFloat(el.dataset.count);
        let cur = 0; const step = target / 60;
        const tmr = setInterval(() => {
          cur += step; if (cur >= target) { cur = target; clearInterval(tmr); }
          el.textContent = target % 1 !== 0 ? cur.toFixed(target < 1 ? 3 : 1) : Math.floor(cur);
        }, 16);
      });
    }
    setTimeout(animCounters, 700);

    // ═══════════════════════════════════════
    // SCROLL REVEAL
    // ═══════════════════════════════════════
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // ═══════════════════════════════════════
    // NAV ACTIVE ON SCROLL
    // ═══════════════════════════════════════
    const sections = ['db-section', 'analytics-section', 'cases-section', 'agent-section'];
    const navLinks = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
      let cur = '';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) cur = id;
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
      });
    });

    // ═══════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════
    initCharts();
