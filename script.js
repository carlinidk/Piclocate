import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.8.0";

// Ambience / aesthetic labels
const LABELS = [
  "beach",
  "mountains",
  "forest nature",
  "city skyline",
  "urban nightlife",
  "aesthetic cafe",
  "historic monument",
  "luxury resort",
  "street photography",
  "sunset landscape"
];

const statusEl = document.getElementById("status");
const tagsEl = document.getElementById("tags");
const analyzeBtn = document.getElementById("analyzeBtn");

let classifier;

// Load model once
async function loadModel() {
  statusEl.textContent = "Loading AI model (first time may take ~30s)...";
  classifier = await pipeline(
    "zero-shot-image-classification",
    "Xenova/clip-vit-base-patch32"
  );
  statusEl.textContent = "AI model ready ✅";
}

loadModel();

analyzeBtn.onclick = async () => {
  const file = document.getElementById("imageInput").files[0];
  if (!file) {
    alert("Upload an image");
    return;
  }

  statusEl.textContent = "Analyzing image...";
  tagsEl.innerHTML = "";

  // Run CLIP zero-shot classification
  const results = await classifier(file, LABELS);

  // Take top 3
  const top = results.slice(0, 3);

  tagsEl.innerHTML =
    "<h3>Detected Ambience</h3>" +
    top.map(r =>
      `🌍 ${r.label} (${(r.score * 100).toFixed(1)}%)`
    ).join("<br>");

  // Use strongest label to search place
  searchLocation(top[0].label);
};

async function searchLocation(query) {
  statusEl.textContent = "Finding similar places...";

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
  );

  const data = await res.json();
  if (!data.length) {
    statusEl.textContent = "No matching locations found";
    return;
  }

  const place = data[0];
  showMap(place.lat, place.lon, place.display_name);
  statusEl.textContent = "Done ✅";
}

function showMap(lat, lon, name) {
  document.getElementById("map").innerHTML = "";

  const map = L.map("map").setView([lat, lon], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(name)
    .openPopup();
}
