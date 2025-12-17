const HF_TOKEN = "YOUR_HUGGINGFACE_TOKEN";

const labels = [
  "beach", "mountains", "city nightlife", "aesthetic cafe",
  "historic monument", "nature landscape",
  "luxury resort", "street photography",
  "urban aesthetic", "sunset view"
];

async function analyze() {
  const file = document.getElementById("imageInput").files[0];
  if (!file) return alert("Upload an image");

  const imageBlob = await file.arrayBuffer();

  // 1️⃣ CLIP Image → Vibe detection
  const response = await fetch(
    "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
    {
      method: "POST",
      headers: {"Content-Type": "application/octet-stream"}
      },
      body: imageBlob
    }
  );

  const result = await response.json();

  // Fake similarity scoring
  const detected = labels
    .map(label => ({
      label,
      score: Math.random().toFixed(2)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  document.getElementById("tags").innerHTML =
    `<h3>Detected Ambience</h3>` +
    detected.map(d => `🌍 ${d.label}`).join("<br>");

  // 2️⃣ Search location
  searchLocation(detected[0].label);
}

async function searchLocation(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
  );
  const data = await res.json();
  if (!data.length) return;

  const place = data[0];

  showMap(place.lat, place.lon, place.display_name);
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

