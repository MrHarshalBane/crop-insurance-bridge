// KrishiSetu Mock Database
// Pre-populated data for crop insurance claims, policies, and weather records in Maharashtra

const initialClaims = [
  {
    id: "KS-2026-101",
    farmerName: "Ananda Rao Patil",
    farmerAadhaar: "XXXX-XXXX-4321",
    policyNumber: "PMFBY-MH-98432",
    district: "Beed",
    village: "Wadwani",
    cropType: "Soybean",
    damageDate: "2026-07-12",
    damageCause: "Drought",
    estimatedLoss: 85,
    gpsCoords: { lat: 18.9892, lng: 75.7601 },
    timestamp: "2026-07-13T10:30:00Z",
    evidencePhoto: "soybean_drought.jpg",
    status: "submitted", // Pending NGO verification
    ngoNotes: "",
    ngoVerifiedLoss: 0,
    insurerNotes: "",
    rejectionReason: ""
  },
  {
    id: "KS-2026-102",
    farmerName: "Sanjay Namdeo Shinde",
    farmerAadhaar: "XXXX-XXXX-8765",
    policyNumber: "PMFBY-MH-12345",
    district: "Nashik",
    village: "Niphad",
    cropType: "Onion",
    damageDate: "2026-07-15",
    damageCause: "Hailstorm",
    estimatedLoss: 90,
    gpsCoords: { lat: 20.0812, lng: 74.1105 },
    timestamp: "2026-07-16T08:15:00Z",
    evidencePhoto: "onion_hail.jpg",
    status: "audited", // NGO verified, pending insurer review
    ngoNotes: "Audited on-site. Severe hailstorm damage. Onion bulbs completely bruised.",
    ngoVerifiedLoss: 90,
    insurerNotes: "",
    rejectionReason: ""
  },
  {
    id: "KS-2026-103",
    farmerName: "Meena Vitthal Tokre",
    farmerAadhaar: "XXXX-XXXX-9876",
    policyNumber: "PMFBY-MH-76543",
    district: "Latur",
    village: "Ausa",
    cropType: "Cotton",
    damageDate: "2026-07-08",
    damageCause: "Excess Rain",
    estimatedLoss: 75,
    gpsCoords: { lat: 18.2514, lng: 76.5123 },
    timestamp: "2026-07-09T14:45:00Z",
    evidencePhoto: "cotton_rain.jpg",
    status: "settled", // Fully approved
    ngoNotes: "Inspected waterlogged fields. Roots starting to rot.",
    ngoVerifiedLoss: 70,
    insurerNotes: "Automated weather check verified 180mm excess rainfall. Claim approved for payout.",
    rejectionReason: ""
  },
  {
    id: "KS-2026-104",
    farmerName: "Ramesh Tukaram Kale",
    farmerAadhaar: "XXXX-XXXX-1122",
    policyNumber: "PMFBY-MH-33445",
    district: "Yavatmal",
    village: "Pusad",
    cropType: "Soybean",
    damageDate: "2026-07-02",
    damageCause: "Excess Rain",
    estimatedLoss: 95,
    gpsCoords: { lat: 20.4578, lng: 77.5689 },
    timestamp: "2026-07-03T11:00:00Z",
    evidencePhoto: "soybean_rain.jpg",
    status: "rejected",
    ngoNotes: "Field shows moderate pest damage, not excess rain. Inconsistent with claim.",
    ngoVerifiedLoss: 20,
    insurerNotes: "NGO audit and weather check do not support excess rain. Rejected due to inconsistent evidence.",
    rejectionReason: "Inconsistent Evidence"
  }
];

const mockPolicies = [
  {
    policyNumber: "PMFBY-MH-98432",
    farmerName: "Ananda Rao Patil",
    aadhaar: "XXXX-XXXX-4321",
    district: "Beed",
    crop: "Soybean",
    sumInsured: 45000,
    premiumPaid: 900
  },
  {
    policyNumber: "PMFBY-MH-12345",
    farmerName: "Sanjay Namdeo Shinde",
    aadhaar: "XXXX-XXXX-8765",
    district: "Nashik",
    crop: "Onion",
    sumInsured: 60000,
    premiumPaid: 1200
  },
  {
    policyNumber: "PMFBY-MH-76543",
    farmerName: "Meena Vitthal Tokre",
    aadhaar: "XXXX-XXXX-9876",
    district: "Latur",
    crop: "Cotton",
    sumInsured: 55000,
    premiumPaid: 1100
  },
  {
    policyNumber: "PMFBY-MH-33445",
    farmerName: "Ramesh Tukaram Kale",
    aadhaar: "XXXX-XXXX-1122",
    district: "Yavatmal",
    crop: "Soybean",
    sumInsured: 45000,
    premiumPaid: 900
  },
  {
    policyNumber: "PMFBY-MH-55667",
    farmerName: "Govind Haribhau Jadhav",
    aadhaar: "XXXX-XXXX-5566",
    district: "Jalgaon",
    crop: "Banana",
    sumInsured: 80000,
    premiumPaid: 1600
  }
];

// District-wise historical satellite weather logs (July 2026)
const weatherLogs = {
  "Beed": [
    { date: "2026-07-08", rain: 0, temp: 39, humidity: 30, deviation: -80, status: "Drought Alert" },
    { date: "2026-07-10", rain: 0, temp: 40, humidity: 28, deviation: -85, status: "Drought Alert" },
    { date: "2026-07-12", rain: 0, temp: 41, humidity: 25, deviation: -90, status: "Severe Drought Condition" }
  ],
  "Nashik": [
    { date: "2026-07-14", rain: 12, temp: 28, humidity: 75, deviation: 10, status: "Moderate Rain" },
    { date: "2026-07-15", rain: 52, temp: 21, humidity: 95, deviation: 300, status: "Severe Hailstorm & Gale Winds" },
    { date: "2026-07-16", rain: 8, temp: 27, humidity: 80, deviation: 5, status: "Light Rain" }
  ],
  "Latur": [
    { date: "2026-07-07", rain: 45, temp: 26, humidity: 88, deviation: 120, status: "Heavy Rainfall" },
    { date: "2026-07-08", rain: 88, temp: 24, humidity: 98, deviation: 280, status: "Excess Rain & Flooding" },
    { date: "2026-07-09", rain: 15, temp: 29, humidity: 85, deviation: 20, status: "Cloudy" }
  ],
  "Yavatmal": [
    { date: "2026-07-01", rain: 2, temp: 32, humidity: 60, deviation: -10, status: "Normal" },
    { date: "2026-07-02", rain: 5, temp: 33, humidity: 62, deviation: -5, status: "Normal" },
    { date: "2026-07-03", rain: 8, temp: 31, humidity: 65, deviation: 0, status: "Normal" }
  ],
  "Jalgaon": [
    { date: "2026-07-10", rain: 0, temp: 37, humidity: 45, deviation: -20, status: "Warm" },
    { date: "2026-07-15", rain: 35, temp: 30, humidity: 85, deviation: 150, status: "Unseasonal Rain" }
  ]
};

// Export to window object for ease of use in our Vanilla JS SPA
window.KrishiSetuDB = {
  claims: initialClaims,
  policies: mockPolicies,
  weatherLogs: weatherLogs
};
