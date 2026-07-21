# KrishiSetu: Bridging the "Climate Casualty" Crop Insurance Gap

**KrishiSetu** is a high-fidelity web application simulator designed to solve the crop insurance claim bottleneck faced by farmers in Maharashtra and other agrarian states. 

Traditional crop insurance schemes (like PMFBY) suffer from a broken claim process: farmers struggle with complex paperwork, local NGOs record damage surveys on paper (taking months to digitize), and claims are ultimately rejected due to "insufficient evidence" or "late filing." **KrishiSetu** bridges this gap by introducing a real-time, digital, and scientific workflow connecting Farmers, NGOs, and Insurers.

---

## 💡 The Solution

KrishiSetu demonstrates a closed-loop digital solution through three interconnected portals:

1. **Farmer Portal ("Bima Sahayak")**:
   - **Simplified Declarations**: Farmers file visual crop claims in seconds.
   - **Smart Geotagged Evidence**: The simulated camera captures crop photos and automatically embeds GPS coordinates (Latitude/Longitude), timestamps, and device signatures. This provides foolproof, tamper-proof evidence matching the farmer's registered land registry.
   - **Live Progress Timeline**: Visual tracking (Filed -> NGO Audited -> Weather Validated -> Settled) removes opacity from the system.

2. **NGO Auditor Portal ("Krishi Mitra")**:
   - **Paperless Physical Inspections**: Replaces months of paperwork delay with digital verification forms.
   - **Offline-First Sync Caching**: Agents working in remote fields with poor network connectivity can cache inspection reports locally on their devices. Once connection is restored, the application auto-syncs the queue to the insurer servers.

3. **Insurer Portal ("Bima Officer")**:
   - **Automated Weather Check Engine**: Cross-references claim dates/coordinates with historical satellite weather data (rainfall deficit, hailstorms, flooding) to verify climate anomalies instantly.
   - **One-Click Disbursal**: Triggers Direct Benefit Transfer (DBT) payouts via the National Payments Corporation of India (NPCI) Aadhaar bridge with instant transaction logging.

4. **Public Insights Dashboard**:
   - Live Maharashtra map plotting hotspots (Nashik, Beed, Latur, Yavatmal, Jalgaon) based on claims.
   - Comparative charts demonstrating claim resolution times (3.5 days digitized vs. 145 days traditional).

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+).
* **Design System**: Fully custom, responsive, earthy dark-theme CSS with glassmorphic cards, custom KPI widgets, and timeline components.
* **Database**: Local in-memory state engine preloaded with realistic farmer policies and satellite weather records.

---

## 📁 Repository Structure

```bash
krishisetu/
├── index.html         # Main dashboard shell & simulated viewports
├── style.css          # Glassmorphism design system & styles
├── app.js             # State engine, role switches, and validation logic
├── mockData.js        # Mock database (policies, weather logs, claims)
├── soybean_drought.jpg# Simulated visual evidence (generated asset)
├── onion_hail.jpg     # Simulated visual evidence (generated asset)
├── cotton_rain.jpg    # Simulated visual evidence (generated asset)
└── README.md          # Project documentation (this file)
```

---

## 📸 Crop Damage Visual Evidence (Simulated)

The application embeds realistic geotagged mock photos representing regional climate catastrophes:

* **Soybean Drought (Beed)**: Dry, cracked soil and wilted crops.
* **Onion Hailstorm (Nashik)**: Shredded shoots and scattered ice stones.
* **Cotton Flooding (Latur)**: Waterlogged soils with rotting roots.

---

## 🚀 How to Run Locally

Since the application is built using standard, modern web technologies, it runs directly in any browser with **zero dependencies**:

1. Clone or download this repository.
2. Double-click `index.html` to open it in your browser, or run a simple local server in the project directory:
   ```bash
   # Using Node.js
   npx serve .
   
   # Or using Python
   python -m http.server 8000
   ```
3. Use the **Simulator Control** at the bottom of the sidebar to experience the claim workflow from different roles:
   - File a claim as the **Farmer**.
   - Audit the claim as the **NGO Agent** (try enabling Offline Mode!).
   - Verify weather records and settle the payout as the **Bima Claims Officer**.
