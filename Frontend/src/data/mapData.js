// ─────────────────────────────────────────────
// FOUNDER OS v3.0 — Map Data
// ─────────────────────────────────────────────












export const locations = [
  {
    name: "Kolkata",
    lat: 22.5726,
    lng: 88.3639,
    story: "Where it all began — started coding journey from a laptop and limitless curiosity. This city taught me that constraints breed creativity.",
    layer: "journey",
    year: "2024",
    connections: ["Delhi", "Mumbai"],
    population: 15,
  },
  {
    name: "Delhi",
    lat: 28.6139,
    lng: 77.2090,
    story: "Future expansion target — India's capital with a thriving tech community and massive SMB market.",
    layer: "expansion",
    year: "2027",
    connections: ["Kolkata", "Bangalore"],
  },
  {
    name: "Mumbai",
    lat: 19.0760,
    lng: 72.8777,
    story: "SkillBridge users here — 25+ freelancers and 10+ businesses using the platform.",
    layer: "reach",
    connections: ["Kolkata", "Bangalore"],
    population: 35,
  },
  {
    name: "Bangalore",
    lat: 12.9716,
    lng: 77.5946,
    story: "India's tech capital — potential for partnerships with tech communities and coworking spaces.",
    layer: "expansion",
    year: "2027",
    connections: ["Delhi", "Mumbai", "Hyderabad"],
  },
  {
    name: "Hyderabad",
    lat: 17.3850,
    lng: 78.4867,
    story: "Growing tech scene — evaluating for SkillBridge expansion in 2027.",
    layer: "expansion",
    year: "2027",
    connections: ["Bangalore"],
  },
  {
    name: "Chennai",
    lat: 13.0827,
    lng: 80.2707,
    story: "SkillBridge has 8+ users from Chennai — organic growth from word-of-mouth.",
    layer: "reach",
    connections: ["Bangalore", "Kolkata"],
    population: 8,
  },
];

export const mapLayers = [
  { id: "journey" , label: "Journey", color: "#7C6AFF" },
  { id: "reach" , label: "Reach", color: "#00D4FF" },
  { id: "expansion" , label: "Expansion", color: "#FFB800" },
];
