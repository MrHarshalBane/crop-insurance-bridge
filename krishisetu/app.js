// KrishiSetu Central Controller & Simulation Engine
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Database
  if (!window.KrishiSetuDB) {
    console.error("Database mockData.js not loaded.");
    return;
  }

  // Local state reference
  const state = {
    claims: [...window.KrishiSetuDB.claims],
    policies: [...window.KrishiSetuDB.policies],
    weatherLogs: { ...window.KrishiSetuDB.weatherLogs },
    selectedFarmerClaimId: null,
    selectedNgoClaimId: null,
    selectedInsurerClaimId: null,
    currentRole: 'public',
    currentView: 'public',
    isOffline: false,
    offlineQueue: [],
    uploadedEvidence: null
  };

  // Select DOM Elements
  const policySelect = document.getElementById("policy-select");
  const farmerClaimsList = document.getElementById("farmer-claims-list-container");
  const ngoPendingList = document.getElementById("ngo-pending-list");
  const insurerPendingList = document.getElementById("insurer-pending-list");
  const globalSettledDisplay = document.getElementById("global-settled-count");
  const sidebarNgoBadge = document.getElementById("ngo-badge");
  const sidebarInsurerBadge = document.getElementById("insurer-badge");

  // Map elements
  const mapContainer = document.getElementById("maharashtra-map");
  const mapTooltip = document.getElementById("map-tooltip");

  // Init App
  function init() {
    populatePolicies();
    updateUI();
    setupMapListeners();
    autoSetDate();
  }

  function autoSetDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("damage-date").value = today;
    document.getElementById("damage-date").max = today;
  }

  // Populate Policy Dropdown for Farmers
  function populatePolicies() {
    policySelect.innerHTML = '<option value="">-- Select Registered Policy --</option>';
    state.policies.forEach(policy => {
      const option = document.createElement("option");
      option.value = policy.policyNumber;
      option.textContent = `${policy.policyNumber} - ${policy.farmerName} (${policy.crop})`;
      policySelect.appendChild(option);
    });
  }

  // Autofill details when farmer selects a policy
  window.autoFillPolicyInfo = function() {
    const policyNum = policySelect.value;
    if (!policyNum) {
      document.getElementById("farmer-name-display").value = "";
      document.getElementById("farmer-district-display").value = "";
      document.getElementById("farmer-crop-display").value = "";
      document.getElementById("evidence-preview-box").style.display = "none";
      document.getElementById("evidence-dropzone").style.display = "block";
      state.uploadedEvidence = null;
      return;
    }

    const policy = state.policies.find(p => p.policyNumber === policyNum);
    if (policy) {
      document.getElementById("farmer-name-display").value = policy.farmerName;
      document.getElementById("farmer-district-display").value = policy.district;
      document.getElementById("farmer-crop-display").value = policy.crop;
      
      // Auto geotag projection based on district coordinates
      const coords = getDistrictCoords(policy.district);
      document.getElementById("exif-gps").innerText = `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`;
      document.getElementById("exif-time").innerText = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      // Pre-select appropriate damage cause based on district for demo convenience
      const damageCauseSelect = document.getElementById("damage-cause");
      if (policy.district === "Beed") {
        damageCauseSelect.value = "Drought";
      } else if (policy.district === "Nashik") {
        damageCauseSelect.value = "Hailstorm";
      } else if (policy.district === "Latur") {
        damageCauseSelect.value = "Excess Rain";
      } else {
        damageCauseSelect.value = "Excess Rain";
      }
    }
  };

  // Get coordinates for district
  function getDistrictCoords(district) {
    const coordsMap = {
      "Beed": { lat: 18.9892, lng: 75.7601 },
      "Nashik": { lat: 20.0812, lng: 74.1105 },
      "Latur": { lat: 18.2514, lng: 76.5123 },
      "Yavatmal": { lat: 20.4578, lng: 77.5689 },
      "Jalgaon": { lat: 21.0077, lng: 75.5626 }
    };
    return coordsMap[district] || { lat: 19.0760, lng: 72.8777 }; // Default Mumbai coordinates
  }

  // Simulate Geotagged Photo Upload
  window.triggerSimulationUpload = function() {
    const policyNum = policySelect.value;
    if (!policyNum) {
      alert("Please select a policy first so we can geotag the photo to the registered farm plot coordinates.");
      return;
    }

    const policy = state.policies.find(p => p.policyNumber === policyNum);
    const damageCause = document.getElementById("damage-cause").value || "Excess Rain";
    
    // Choose appropriate image
    let photoFilename = "cotton_rain.jpg";
    if (policy.crop === "Soybean" && damageCause === "Drought") {
      photoFilename = "soybean_drought.jpg";
    } else if (policy.crop === "Onion" && damageCause === "Hailstorm") {
      photoFilename = "onion_hail.jpg";
    } else if (policy.crop === "Soybean" && damageCause === "Excess Rain") {
      photoFilename = "cotton_rain.jpg"; // Recycled
    } else if (policy.crop === "Cotton") {
      photoFilename = "cotton_rain.jpg";
    } else {
      photoFilename = "soybean_drought.jpg";
    }

    state.uploadedEvidence = photoFilename;

    // UI Updates
    document.getElementById("evidence-preview-img").src = photoFilename;
    document.getElementById("evidence-dropzone").style.display = "none";
    document.getElementById("evidence-preview-box").style.display = "block";
  };

  // Farmer Claim Submission
  window.handleClaimSubmit = function(event) {
    event.preventDefault();
    
    const policyNum = policySelect.value;
    if (!policyNum) {
      alert("Please select a policy.");
      return;
    }

    if (!state.uploadedEvidence) {
      alert("Please upload (simulate) a crop damage photo to capture geotag evidence.");
      return;
    }

    const policy = state.policies.find(p => p.policyNumber === policyNum);
    const damageDate = document.getElementById("damage-date").value;
    const damageCause = document.getElementById("damage-cause").value;
    const estimatedLoss = parseInt(document.getElementById("estimated-loss").value);
    
    const newClaim = {
      id: `KS-2026-${100 + state.claims.length + 1}`,
      farmerName: policy.farmerName,
      farmerAadhaar: policy.aadhaar,
      policyNumber: policy.policyNumber,
      district: policy.district,
      village: policy.district === "Beed" ? "Wadwani" : (policy.district === "Nashik" ? "Niphad" : "Gram Panchayat Area"),
      cropType: policy.crop,
      damageDate: damageDate,
      damageCause: damageCause,
      estimatedLoss: estimatedLoss,
      gpsCoords: getDistrictCoords(policy.district),
      timestamp: new Date().toISOString(),
      evidencePhoto: state.uploadedEvidence,
      status: "submitted",
      ngoNotes: "",
      ngoVerifiedLoss: 0,
      insurerNotes: "",
      rejectionReason: ""
    };

    // Add to state
    state.claims.unshift(newClaim);
    
    // Reset Form
    policySelect.value = "";
    document.getElementById("claimForm").reset();
    document.getElementById("evidence-preview-box").style.display = "none";
    document.getElementById("evidence-dropzone").style.display = "block";
    state.uploadedEvidence = null;
    autoSetDate();

    // Select this claim in Farmer View
    state.selectedFarmerClaimId = newClaim.id;
    
    // Switch to tracker tab
    toggleFarmerTab("my-claims");
    
    // Notification Simulation
    alert(`Claim submitted successfully! ID: ${newClaim.id}. Dispatched to local NGO field auditor for digitized verification.`);
    
    // Refresh Everything
    updateUI();
  };

  // Toggle internal Farmer views (File claim vs View active claims)
  window.toggleFarmerTab = function(tabName) {
    const formTab = document.getElementById("farmer-form-tab");
    const listTab = document.getElementById("farmer-list-tab");
    
    if (tabName === "new-claim") {
      formTab.style.display = "block";
      listTab.style.display = "none";
    } else {
      formTab.style.display = "none";
      listTab.style.display = "block";
      renderFarmerClaims();
    }
  };

  // Render Farmer Filed Claims list
  function renderFarmerClaims() {
    farmerClaimsList.innerHTML = "";
    
    // Filter claims relevant to the logged-in farmer (in this case, all for simplicity or Beed specifically)
    const farmerClaims = state.claims;

    if (farmerClaims.length === 0) {
      farmerClaimsList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding: 20px;">No claims filed yet.</p>`;
      return;
    }

    farmerClaims.forEach(claim => {
      const card = document.createElement("div");
      card.className = `claim-card ${state.selectedFarmerClaimId === claim.id ? 'selected' : ''}`;
      card.onclick = () => selectFarmerClaim(claim.id);

      const avatar = getCropAvatar(claim.cropType);
      const badgeClass = claim.status;

      card.innerHTML = `
        <div class="claim-crop-avatar">${avatar}</div>
        <div class="claim-info">
          <div class="claim-id">${claim.id}</div>
          <div class="claim-farmer">${claim.cropType} - ${claim.damageCause}</div>
          <div class="claim-meta">
            <span>📅 ${claim.damageDate}</span>
            <span>📍 ${claim.district}</span>
          </div>
        </div>
        <span class="badge ${badgeClass}">${claim.status}</span>
        <div class="claim-loss-badge">
          <div class="claim-loss-value ${claim.estimatedLoss >= 75 ? 'severe' : 'moderate'}">${claim.estimatedLoss}%</div>
          <div class="claim-loss-label">Estimated</div>
        </div>
      `;
      farmerClaimsList.appendChild(card);
    });

    if (state.selectedFarmerClaimId) {
      renderFarmerTracker(state.selectedFarmerClaimId);
    }
  }

  // Get crop emoji helper
  function getCropAvatar(crop) {
    const crops = {
      "Soybean": "🌱",
      "Onion": "🧅",
      "Cotton": "☁️",
      "Banana": "🍌",
      "Wheat": "🌾"
    };
    return crops[crop] || "🌾";
  }

  // Select claim in Farmer Portal
  function selectFarmerClaim(claimId) {
    state.selectedFarmerClaimId = claimId;
    
    // Highlight active card
    const cards = farmerClaimsList.querySelectorAll(".claim-card");
    cards.forEach(c => {
      const id = c.querySelector(".claim-id").innerText;
      if (id === claimId) c.classList.add("selected");
      else c.classList.remove("selected");
    });

    renderFarmerTracker(claimId);
  }

  // Render Farmer Tracker Detail
  function renderFarmerTracker(claimId) {
    const claim = state.claims.find(c => c.id === claimId);
    if (!claim) return;

    document.getElementById("tracker-empty-state").style.display = "none";
    document.getElementById("tracker-active-content").style.display = "block";

    document.getElementById("tracker-claim-id").innerText = claim.id;
    document.getElementById("tracker-claim-date").innerText = `Filed on: ${claim.timestamp.substring(0, 10)}`;
    document.getElementById("tracker-claim-loss").innerText = `${claim.estimatedLoss}% Loss`;
    
    const badge = document.getElementById("tracker-claim-status-badge");
    badge.className = `badge ${claim.status}`;
    badge.innerText = claim.status;

    // Timeline steps completion
    const stepFiled = document.getElementById("step-filed");
    const stepNgo = document.getElementById("step-ngo");
    const stepWeather = document.getElementById("step-weather");
    const stepSettled = document.getElementById("step-settled");

    // Reset classes
    [stepFiled, stepNgo, stepWeather, stepSettled].forEach(s => {
      s.className = "timeline-step";
      s.querySelector(".step-node").innerHTML = s.id === "step-filed" ? "1" : (s.id === "step-ngo" ? "2" : (s.id === "step-weather" ? "3" : "4"));
    });

    // Populate steps based on status
    stepFiled.classList.add("completed");
    stepFiled.querySelector(".step-node").innerHTML = "✓";

    const logsUl = document.getElementById("tracker-audit-logs");
    logsUl.innerHTML = `<li>[${claim.timestamp.substring(0,10)}] Digital claim filed with geotagged photo. Farm plot coordinates verified against PMFBY registry.</li>`;

    if (claim.status === "submitted") {
      stepNgo.classList.add("active");
      logsUl.innerHTML += `<li>[Pending] Dispatched to local NGO auditor in ${claim.district} for physical/on-site audit.</li>`;
    } 
    else if (claim.status === "audited") {
      stepNgo.classList.add("completed");
      stepNgo.querySelector(".step-node").innerHTML = "✓";
      stepWeather.classList.add("active");
      logsUl.innerHTML += `<li>[✓] NGO on-site audit complete. Loss verified at <strong>${claim.ngoVerifiedLoss}%</strong>.</li>`;
      logsUl.innerHTML += `<li>[Pending] Pushed to Insurance Queue. Running automated satellite weather matching checks...</li>`;
    } 
    else if (claim.status === "settled") {
      stepNgo.classList.add("completed");
      stepNgo.querySelector(".step-node").innerHTML = "✓";
      stepWeather.classList.add("completed");
      stepWeather.querySelector(".step-node").innerHTML = "✓";
      stepSettled.classList.add("completed");
      stepSettled.querySelector(".step-node").innerHTML = "✓";
      
      logsUl.innerHTML += `<li>[✓] NGO audit complete. verified loss: <strong>${claim.ngoVerifiedLoss}%</strong>.</li>`;
      logsUl.innerHTML += `<li>[✓] Weather check MATCH: Satellite confirms ${claim.damageCause} event on date.</li>`;
      logsUl.innerHTML += `<li class="text-success">[✓] Claim SETTLED! Payout disbursed via NPCI Aadhaar Bridge. Notes: ${claim.insurerNotes}</li>`;
    } 
    else if (claim.status === "rejected") {
      stepNgo.classList.add("completed");
      stepNgo.querySelector(".step-node").innerHTML = "✓";
      
      stepWeather.classList.add("failed");
      stepWeather.querySelector(".step-node").innerHTML = "✗";
      
      stepSettled.classList.add("failed");
      stepSettled.querySelector(".step-node").innerHTML = "✗";
      
      logsUl.innerHTML += `<li>[✓] NGO audit complete. verified loss: <strong>${claim.ngoVerifiedLoss}%</strong>.</li>`;
      logsUl.innerHTML += `<li class="text-danger">[✗] Claim REJECTED. Reason: <strong>${claim.rejectionReason}</strong>. Officer notes: ${claim.insurerNotes || 'None'}</li>`;
    }
  }

  // --- NGO PORTAL AUDIT FUNCTIONS ---

  // Simulate Offline Mode
  window.simulateOfflineMode = function() {
    state.isOffline = !state.isOffline;
    const btn = document.getElementById("offline-sim-btn");
    const syncText = document.getElementById("sync-status-text");

    if (state.isOffline) {
      btn.innerText = "Disable Offline Mode (Re-sync)";
      btn.className = "btn btn-danger";
      syncText.innerHTML = `<span class="text-warning" style="font-weight:700;">OFFLINE QUEUE ACTIVE</span> - Audit reports will cache locally.`;
      document.querySelector(".sync-banner").style.borderColor = "var(--danger-crimson)";
    } else {
      btn.innerText = "Simulate Offline Mode (Rural Areas)";
      btn.className = "btn btn-secondary";
      
      // Process offline queue
      if (state.offlineQueue.length > 0) {
        syncText.innerHTML = `<strong>Syncing ${state.offlineQueue.length} records...</strong>`;
        setTimeout(() => {
          state.offlineQueue.forEach(q => {
            const claim = state.claims.find(c => c.id === q.id);
            if (claim) {
              claim.status = "audited";
              claim.ngoVerifiedLoss = q.verifiedLoss;
              claim.ngoNotes = q.notes;
            }
          });
          state.offlineQueue = [];
          syncText.innerText = "All inspection reports successfully pushed to insurance servers.";
          document.querySelector(".sync-banner").style.borderColor = "rgba(13, 202, 240, 0.15)";
          updateUI();
          alert("Connection restored! All offline audit reports have been securely synced to the insurance dashboard.");
        }, 1200);
      } else {
        syncText.innerText = "All inspection reports successfully pushed to insurance servers.";
        document.querySelector(".sync-banner").style.borderColor = "rgba(13, 202, 240, 0.15)";
      }
    }
  };

  // Render NGO Pending Audit list
  function renderNgoQueue() {
    ngoPendingList.innerHTML = "";
    
    // Submitted claims need auditing
    const submittedClaims = state.claims.filter(c => c.status === "submitted");

    // Add offline-queued claims in NGO queue with unique styling
    const offlineClaims = state.offlineQueue;
    
    sidebarNgoBadge.innerText = submittedClaims.length + offlineClaims.length;
    sidebarNgoBadge.style.display = (submittedClaims.length + offlineClaims.length) === 0 ? "none" : "inline-flex";

    if (submittedClaims.length === 0 && offlineClaims.length === 0) {
      ngoPendingList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding: 20px;">No audits pending. Excellent job!</p>`;
      return;
    }

    // Render normal submitted
    submittedClaims.forEach(claim => {
      createNgoCard(claim, false);
    });

    // Render cached offline
    offlineClaims.forEach(queueItem => {
      const claim = state.claims.find(c => c.id === queueItem.id);
      if (claim) {
        createNgoCard(claim, true);
      }
    });
  }

  function createNgoCard(claim, isOfflineCached) {
    const card = document.createElement("div");
    card.className = `claim-card ${state.selectedNgoClaimId === claim.id ? 'selected' : ''}`;
    card.onclick = () => selectNgoClaim(claim.id, isOfflineCached);

    const avatar = getCropAvatar(claim.cropType);
    
    card.innerHTML = `
      <div class="claim-crop-avatar">${avatar}</div>
      <div class="claim-info">
        <div class="claim-id">${claim.id} ${isOfflineCached ? '<span class="badge warning" style="font-size:0.55rem; padding: 1px 4px;">QUEUED</span>' : ''}</div>
        <div class="claim-farmer">${claim.farmerName}</div>
        <div class="claim-meta">
          <span>🌾 ${claim.cropType}</span>
          <span>📍 ${claim.village}, ${claim.district}</span>
        </div>
      </div>
      <span class="badge submitted">${claim.damageCause}</span>
      <div class="claim-loss-badge">
        <div class="claim-loss-value moderate">${claim.estimatedLoss}%</div>
        <div class="claim-loss-label">Estimated</div>
      </div>
    `;
    ngoPendingList.appendChild(card);
  }

  // Select claim in NGO View
  function selectNgoClaim(claimId, isOfflineCached) {
    state.selectedNgoClaimId = claimId;
    
    // Highlight
    const cards = ngoPendingList.querySelectorAll(".claim-card");
    cards.forEach(c => {
      if (c.querySelector(".claim-id").innerText.includes(claimId)) c.classList.add("selected");
      else c.classList.remove("selected");
    });

    const claim = state.claims.find(c => c.id === claimId);
    if (!claim) return;

    document.getElementById("ngo-empty-state").style.display = "none";
    document.getElementById("ngo-active-content").style.display = "block";

    document.getElementById("ngo-claim-id").innerText = claim.id;
    document.getElementById("ngo-claim-farmer").innerText = `Farmer: ${claim.farmerName}`;
    document.getElementById("ngo-claim-cause").innerText = claim.damageCause;
    document.getElementById("ngo-policy-no").innerText = claim.policyNumber;
    document.getElementById("ngo-crop-type").innerText = claim.cropType;
    document.getElementById("ngo-claimed-loss").innerText = `${claim.estimatedLoss}%`;
    document.getElementById("ngo-evidence-img").src = claim.evidencePhoto;
    document.getElementById("ngo-evidence-gps").innerText = `${claim.gpsCoords.lat.toFixed(4)}° N, ${claim.gpsCoords.lng.toFixed(4)}° E`;

    // Reset NGO Inputs
    const verifiedLossSlider = document.getElementById("ngo-verified-loss");
    verifiedLossSlider.value = claim.estimatedLoss; // default to farmer estimate
    document.getElementById("ngo-loss-lbl").innerText = `${claim.estimatedLoss}%`;

    // Notes prefill
    if (isOfflineCached) {
      const qItem = state.offlineQueue.find(q => q.id === claimId);
      document.getElementById("ngo-audit-notes").value = qItem ? qItem.notes : "";
      verifiedLossSlider.value = qItem ? qItem.verifiedLoss : claim.estimatedLoss;
      document.getElementById("ngo-loss-lbl").innerText = `${verifiedLossSlider.value}%`;
    } else {
      document.getElementById("ngo-audit-notes").value = "";
    }
  }

  // NGO Audit Submission
  window.submitNgoAudit = function() {
    const claimId = state.selectedNgoClaimId;
    if (!claimId) return;

    const verifiedLoss = parseInt(document.getElementById("ngo-verified-loss").value);
    const notes = document.getElementById("ngo-audit-notes").value.trim();

    if (!notes) {
      alert("Please enter field observation notes before signing off the audit.");
      return;
    }

    if (state.isOffline) {
      // Add to offline queue
      state.offlineQueue.push({
        id: claimId,
        verifiedLoss: verifiedLoss,
        notes: notes
      });
      // Remove from visual submitted queue
      state.claims = state.claims.map(c => {
        if (c.id === claimId) {
          c.status = "submitted"; // remains submitted visually, but we hide it by checking offlineQueue
        }
        return c;
      });
      alert("Device offline! Audit report stored in local secure cache. Will upload automatically when network is restored.");
    } else {
      // Submit online
      state.claims = state.claims.map(c => {
        if (c.id === claimId) {
          c.status = "audited";
          c.ngoVerifiedLoss = verifiedLoss;
          c.ngoNotes = notes;
        }
        return c;
      });
      alert(`Audit reports synced for claim ${claimId}! Sent to Insurance Board for weather confirmation.`);
    }

    state.selectedNgoClaimId = null;
    document.getElementById("ngo-active-content").style.display = "none";
    document.getElementById("ngo-empty-state").style.display = "flex";
    
    updateUI();
  };

  // --- INSURER PORTAL FUNCTIONS ---

  // Render Insurer Audited Claims list
  function renderInsurerQueue() {
    insurerPendingList.innerHTML = "";
    
    // Audited claims need reviewing
    const auditedClaims = state.claims.filter(c => c.status === "audited");
    
    sidebarInsurerBadge.innerText = auditedClaims.length;
    sidebarInsurerBadge.style.display = auditedClaims.length === 0 ? "none" : "inline-flex";

    if (auditedClaims.length === 0) {
      insurerPendingList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding: 20px;">All claims clear. Processing backlog: 0</p>`;
      return;
    }

    auditedClaims.forEach(claim => {
      const card = document.createElement("div");
      card.className = `claim-card ${state.selectedInsurerClaimId === claim.id ? 'selected' : ''}`;
      card.onclick = () => selectInsurerClaim(claim.id);

      const avatar = getCropAvatar(claim.cropType);
      
      card.innerHTML = `
        <div class="claim-crop-avatar">${avatar}</div>
        <div class="claim-info">
          <div class="claim-id">${claim.id}</div>
          <div class="claim-farmer">${claim.farmerName}</div>
          <div class="claim-meta">
            <span>📍 ${claim.district}</span>
            <span>Verified loss: ${claim.ngoVerifiedLoss}%</span>
          </div>
        </div>
        <span class="badge audited">Audited</span>
        <div class="claim-loss-badge">
          <div class="claim-loss-value severe">${claim.ngoVerifiedLoss}%</div>
          <div class="claim-loss-label">NGO Loss</div>
        </div>
      `;
      insurerPendingList.appendChild(card);
    });
  }

  // Select claim in Insurer View
  function selectInsurerClaim(claimId) {
    state.selectedInsurerClaimId = claimId;

    // Highlight
    const cards = insurerPendingList.querySelectorAll(".claim-card");
    cards.forEach(c => {
      if (c.querySelector(".claim-id").innerText === claimId) c.classList.add("selected");
      else c.classList.remove("selected");
    });

    const claim = state.claims.find(c => c.id === claimId);
    if (!claim) return;

    document.getElementById("insurer-empty-state").style.display = "none";
    document.getElementById("insurer-active-content").style.display = "block";

    document.getElementById("insurer-claim-id").innerText = claim.id;
    document.getElementById("insurer-claim-farmer").innerText = `Farmer: ${claim.farmerName}`;
    document.getElementById("insurer-evidence-img").src = claim.evidencePhoto;
    document.getElementById("insurer-lat").innerText = claim.gpsCoords.lat.toFixed(4);
    document.getElementById("insurer-lng").innerText = claim.gpsCoords.lng.toFixed(4);
    document.getElementById("insurer-district").innerText = claim.district;
    
    // Policy Sum Insured Lookup
    const policy = state.policies.find(p => p.policyNumber === claim.policyNumber);
    const sumInsured = policy ? policy.sumInsured : 50000;
    document.getElementById("insurer-sum-insured").innerText = `₹${sumInsured.toLocaleString('en-IN')}`;
    document.getElementById("insurer-ngo-loss").innerText = `${claim.ngoVerifiedLoss}%`;
    document.getElementById("insurer-notes").value = "";

    // SATELLITE WEATHER CROSS-CHECK ENGINE
    const weatherLogs = state.weatherLogs[claim.district] || [];
    const matchingLog = weatherLogs.find(log => log.date === claim.damageDate);

    const matchBadge = document.getElementById("weather-crosscheck-verdict-badge");
    const verdictLog = document.getElementById("weather-verdict-log");
    
    // Dom fields
    const precField = document.getElementById("weather-precipitation");
    const devField = document.getElementById("weather-deviation");
    const riskField = document.getElementById("weather-crop-match");

    if (matchingLog) {
      precField.innerText = matchingLog.rain > 0 ? `${matchingLog.rain}mm` : "0mm";
      devField.innerText = `${matchingLog.deviation > 0 ? '+' : ''}${matchingLog.deviation}%`;
      devField.className = `weather-val ${matchingLog.deviation < 0 ? 'text-danger' : 'text-success'}`;
      riskField.innerText = "Correlated";
      riskField.className = "weather-val text-success";

      matchBadge.className = "weather-match-badge matched";
      matchBadge.innerText = "WEATHER MATCH FOUND";
      
      verdictLog.className = "weather-verdict alert-success";
      verdictLog.innerHTML = `<strong>Satellite Record MATCHED:</strong> ${matchingLog.status} verified on ${claim.damageDate}. Correlates with farmer claim of <em>${claim.damageCause}</em>.`;
      
      // Auto pre-fill decision notes
      document.getElementById("insurer-notes").value = `Automated verification: Satellite weather anomalies match. NGO on-site audit logs are consistent. Approved.`;
    } else {
      // No weather record matches the claim details
      precField.innerText = "Normal";
      devField.innerText = "0%";
      devField.className = "weather-val text-warning";
      riskField.innerText = "Unlinked";
      riskField.className = "weather-val text-danger";

      matchBadge.className = "weather-match-badge warning";
      matchBadge.innerText = "NO ANOMALY RECORDED";
      
      verdictLog.className = "weather-verdict alert-danger";
      verdictLog.innerHTML = `<strong>WARNING:</strong> Satellite records show normal conditions on ${claim.damageDate}. Potential high-risk discrepancy. Inspect NGO notes carefully!`;
      
      // Auto prefill note
      document.getElementById("insurer-notes").value = `Flagged: Weather check does not confirm weather event. Review field agent notes.`;
    }
  }

  // Approve claim
  window.processInsurerDecision = function(isApprove) {
    const claimId = state.selectedInsurerClaimId;
    if (!claimId) return;

    const claim = state.claims.find(c => c.id === claimId);
    const notes = document.getElementById("insurer-notes").value.trim();

    if (isApprove) {
      claim.status = "settled";
      claim.insurerNotes = notes || "Approved after weather matching and physical audit verification.";

      // NPCI DBT Payout simulation values
      const policy = state.policies.find(p => p.policyNumber === claim.policyNumber);
      const sum = policy ? policy.sumInsured : 50000;
      const payout = Math.round(sum * (claim.ngoVerifiedLoss / 100));

      document.getElementById("dbt-farmer").innerText = claim.farmerName;
      document.getElementById("dbt-amount").innerText = `₹${payout.toLocaleString('en-IN')}`;

      // Open Modal
      document.getElementById("settlement-modal").style.display = "flex";
      
      // Clear selected state
      state.selectedInsurerClaimId = null;
      document.getElementById("insurer-active-content").style.display = "none";
      document.getElementById("insurer-empty-state").style.display = "flex";

      updateUI();
    }
  };

  // Rejection Modals
  window.openRejectionModal = function() {
    document.getElementById("rejection-modal").style.display = "flex";
  };

  window.closeRejectionModal = function() {
    document.getElementById("rejection-modal").style.display = "none";
    document.getElementById("rejection-select").value = "";
  };

  window.submitClaimRejection = function() {
    const claimId = state.selectedInsurerClaimId;
    if (!claimId) return;

    const reason = document.getElementById("rejection-select").value;
    if (!reason) {
      alert("Please select a reason code.");
      return;
    }

    const notes = document.getElementById("insurer-notes").value.trim();

    const claim = state.claims.find(c => c.id === claimId);
    claim.status = "rejected";
    claim.rejectionReason = reason;
    claim.insurerNotes = notes || `Rejected due to: ${reason}`;

    alert(`Claim ${claimId} successfully rejected. Reason sent to Farmer timeline.`);

    closeRejectionModal();
    state.selectedInsurerClaimId = null;
    document.getElementById("insurer-active-content").style.display = "none";
    document.getElementById("insurer-empty-state").style.display = "flex";

    updateUI();
  };

  window.closeSettlementModal = function() {
    document.getElementById("settlement-modal").style.display = "none";
  };

  // --- MAP & CHARTS DYNAMIC ENGINE ---

  function setupMapListeners() {
    const pins = document.querySelectorAll(".map-pin");
    pins.forEach(pin => {
      const distName = pin.dataset.district;
      
      pin.addEventListener("mouseenter", (e) => {
        const rect = mapContainer.getBoundingClientRect();
        const pinRect = pin.getBoundingClientRect();
        
        const top = pinRect.top - rect.top - 65;
        const left = pinRect.left - rect.left;

        // Count claims for district
        const distClaims = state.claims.filter(c => c.district === distName);
        const activeCount = distClaims.length;
        const primaryRisk = distClaims.length > 0 ? distClaims[0].damageCause : "None";

        mapTooltip.innerHTML = `<strong>${distName} District</strong><br>Active Claims: ${activeCount}<br>Primary Risk: ${primaryRisk}`;
        mapTooltip.style.top = `${top}px`;
        mapTooltip.style.left = `${left}px`;
        mapTooltip.style.display = "block";
      });

      pin.addEventListener("mouseleave", () => {
        mapTooltip.style.display = "none";
      });

      pin.onclick = () => {
        // Find a claim in this district and filter to role
        const distClaims = state.claims.filter(c => c.district === distName);
        if (distClaims.length > 0) {
          const claim = distClaims[0];
          if (claim.status === "submitted") {
            setSimulatedRole("ngo");
            selectNgoClaim(claim.id, false);
          } else if (claim.status === "audited") {
            setSimulatedRole("insurer");
            selectInsurerClaim(claim.id);
          } else {
            setSimulatedRole("farmer");
            toggleFarmerTab("my-claims");
            selectFarmerClaim(claim.id);
          }
        } else {
          alert(`No active claims registered in ${distName} district.`);
        }
      };
    });
  }

  // Redraw map pins to match their real-time statuses
  function updateMapColors() {
    const pins = document.querySelectorAll(".map-pin");
    pins.forEach(pin => {
      const distName = pin.dataset.district;
      const distClaims = state.claims.filter(c => c.district === distName);

      const circle = pin.querySelector(".pin-circle");
      const pulse = pin.querySelector(".pin-pulse");

      if (distClaims.length === 0) {
        circle.className = "pin-circle";
        circle.style.backgroundColor = "var(--text-muted)";
        circle.style.boxShadow = "none";
        if (pulse) pulse.style.display = "none";
        return;
      }

      // Priority status based on latest claim in district
      const latestClaim = distClaims[0];
      const status = latestClaim.status;

      circle.className = `pin-circle ${status}`;
      if (pulse) {
        pulse.className = `pin-pulse ${status}`;
        pulse.style.display = (status === "submitted" || status === "audited") ? "block" : "none";
      }
    });
  }

  // Update Statewide Analytics
  function updateAnalytics() {
    // 1. Calculate resolution times
    const settledClaims = state.claims.filter(c => c.status === "settled");
    const totalProcessed = state.claims.length;
    
    // Evidence Verification rate (anything verified by NGO or matching weather)
    const verifiedCount = state.claims.filter(c => c.ngoVerifiedLoss > 0 || c.status === "settled").length;
    const evidenceRate = totalProcessed > 0 ? ((verifiedCount / totalProcessed) * 100).toFixed(1) : "100";
    
    // Rejection Rate
    const rejectedCount = state.claims.filter(c => c.status === "rejected").length;
    const rejectionRate = totalProcessed > 0 ? ((rejectedCount / totalProcessed) * 100).toFixed(1) : "0";

    // Set DOM Values
    document.getElementById("kpi-total-processed").innerText = totalProcessed;
    document.getElementById("kpi-evidence-rate").innerText = `${evidenceRate}%`;
    document.getElementById("kpi-rejection-rate").innerText = `${rejectionRate}%`;

    // 2. Total Disbursed count
    let totalPayout = 0;
    settledClaims.forEach(claim => {
      const policy = state.policies.find(p => p.policyNumber === claim.policyNumber);
      const sum = policy ? policy.sumInsured : 50000;
      totalPayout += Math.round(sum * (claim.ngoVerifiedLoss / 100));
    });
    globalSettledDisplay.innerText = `₹${(totalPayout / 100000).toFixed(2)} Lakh`;

    // 3. Risk factors chart update
    const causes = { "Excess Rain": 0, "Hailstorm": 0, "Drought": 0 };
    state.claims.forEach(c => {
      if (causes[c.damageCause] !== undefined) causes[c.damageCause]++;
    });

    const totalCauses = Math.max(1, state.claims.length);
    const rainPct = Math.round((causes["Excess Rain"] / totalCauses) * 100);
    const hailPct = Math.round((causes["Hailstorm"] / totalCauses) * 100);
    const droughtPct = Math.round((causes["Drought"] / totalCauses) * 100);

    // Apply widths to custom charts
    const fills = document.querySelectorAll(".chart-bar-fill");
    if (fills.length >= 3) {
      fills[0].style.width = `${rainPct}%`;
      fills[0].parentElement.nextElementSibling.innerText = `${rainPct}%`;
      
      fills[1].style.width = `${hailPct}%`;
      fills[1].parentElement.nextElementSibling.innerText = `${hailPct}%`;
      
      fills[2].style.width = `${droughtPct}%`;
      fills[2].parentElement.nextElementSibling.innerText = `${droughtPct}%`;
    }
  }

  // Core Render loop
  function updateUI() {
    renderFarmerClaims();
    renderNgoQueue();
    renderInsurerQueue();
    updateMapColors();
    updateAnalytics();
  }

  // --- ROLE AND VIEW NAVIGATION SYSTEM ---

  window.switchView = function(viewName) {
    state.currentView = viewName;

    // Toggle active view sections
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.remove("active");
    });
    document.getElementById(`view-${viewName}`).classList.add("active");

    // Toggle sidebar navigation highlighting
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.remove("active");
    });
    document.getElementById(`nav-${viewName}`).classList.add("active");

    // Update Titles
    const titleEl = document.getElementById("portal-title");
    const subEl = document.getElementById("portal-subtitle");

    if (viewName === "public") {
      titleEl.innerText = "Public Analytics Dashboard";
      subEl.innerText = "Statewide Climate Damage & Insurance Claim Insights";
    } else if (viewName === "farmer") {
      titleEl.innerText = "Farmer Claim Portal (Bima Sahayak)";
      subEl.innerText = "Instant Visual Filing & Transparent Evidence Tracking";
      // Populate first policy automatically for convenience if empty
      if (!policySelect.value && state.policies.length > 0) {
        policySelect.value = state.policies[0].policyNumber;
        autoFillPolicyInfo();
      }
    } else if (viewName === "ngo") {
      titleEl.innerText = "NGO Field Verification Workspace";
      subEl.innerText = "Digital Loss Auditing & Coordinate Sync Interface";
    } else if (viewName === "insurer") {
      titleEl.innerText = "Insurance Board Verification Panel";
      subEl.innerText = "Satellite Weather Validation & Direct Payout Disbursal";
    }
  };

  // Switch role simulator (simulate different user logins)
  window.setSimulatedRole = function(role) {
    state.currentRole = role;

    // Toggle active classes on simulator control buttons
    document.querySelectorAll(".role-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    document.getElementById(`role-${role}`).classList.add("active");

    // Route to appropriate view automatically
    switchView(role);
  };

  // Launch application
  init();
});
