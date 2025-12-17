import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.8.0";

// ✅ Force WASM for mobile stability
env.backends.webgpu.enabled = false;

const LABELS = [
  "beach",
  "mountains",
  "forest",
  "city skyline",
  "urban nightlife",
  "aesthetic cafe",
  "historic monument",
  "luxury resort",
  "street photography",
  "sunset landscape"
];

const statusEl = document.getElementById("status");
const preview = document.getElementById("preview");
const resultsEl = document.getElementById("results");
const galleryEl = document.getElementById("gallery");
const analyzeBtn = document.getElementById("analyzeBtn");

let classifier;

async function loadModel() {
  statusEl.textContent = "⏳ Loading AI model (first time ~30s)...";
  classifier = await pipeline(
    "zero-shot-image-classification",
    "Xenova/clip-vit-base-patch32"
  );
  statusEl.textContent = "✅ AI model ready";
}

loadModel();

analyzeBtn.onclick = async () => {
  const file = document.getElementById("imageInput").files[0];
  if (!file) return alert("Upload an image");

  // Preview image
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";

  statusEl.textContent = "🔍 Analyzing image...";
  resultsEl.innerHTML = "";
  galleryEl.innerHTML = "";

  try {
    const results = await classifier(file, LABELS);
    const top = results.slice(0, 3);

    // Show AI results
    resultsEl.innerHTML =
      "<h3>Detected Ambience</h3>" +
      top.map(r =>
        `🌍 ${r.label} – ${(r.score * 100).toFixed(1)}%`
      ).join("<br>");

    // Show similar place images
    loadGallery(top[0].label);

    // Map
    searchLocation(top[0].label);

    statusEl.textContent = "✅ Done";
  } catch (e) {
    statusEl.textContent = "❌ AI failed on this device";
    console.error(e);
  }
};

function loadGallery(query) {
  // Unsplash source (no key required)
  for (let i = 0; i < 6; i++) {
    const img = document.createElement("img");
    img.src = `https://source.unsplash.com/400x400/?${query}&sig=${i}`;
    galleryEl.appendChild(img);
  }
}

async function searchLocation(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
  );

  const data = await res.json();
  if (!data.length) return;

  showMap(data[0].lat, data[0].lon, data[0].display_name);
}

function showMap(lat, lon, name) {
  document.getElementById("map").innerHTML = "";

  const map = L.map("map").setView([lat, lon], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(name)
    .openPopup();
}

