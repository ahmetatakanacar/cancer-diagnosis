const API_BASE = 'http://localhost:8000';

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

function setResult(state, karar) {
  const card   = document.getElementById('resultCard');
  const icon   = document.getElementById('resultIcon');
  const status = document.getElementById('resultStatus');
  const label  = document.getElementById('resultLabel');
  const code   = document.getElementById('resultCode');

  card.className = 'result-card';

  if (state === 'malignant') {
    card.classList.add('malignant');
    icon.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5"/>
      <path d="M20 13v9M20 27v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
    status.textContent = 'MALIGNANT DETECTED';
    label.textContent  = karar || 'Malignant tumor detected. Further clinical evaluation required.';
    code.textContent   = 'DIAGNOSIS CODE: M · tahmin_kodu = 1';
  } else if (state === 'benign') {
    card.classList.add('benign');
    icon.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5"/>
      <path d="M13 20l5 5 9-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    status.textContent = 'BENIGN';
    label.textContent  = karar || 'No malignancy detected. Tumor appears benign.';
    code.textContent   = 'DIAGNOSIS CODE: B · tahmin_kodu = 0';
  } else {
    icon.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5"/>
      <path d="M20 12v8l5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
    status.textContent = 'AWAITING INPUT';
    label.textContent  = 'Enter patient measurements to begin analysis';
    code.textContent   = '';
  }
}

function getFormData() {
  const fields = [
    'radius_mean','texture_mean','perimeter_mean','area_mean','smoothness_mean',
    'compactness_mean','concavity_mean','concave_points_mean','symmetry_mean','fractal_dimension_mean',
    'radius_se','texture_se','perimeter_se','area_se','smoothness_se',
    'compactness_se','concavity_se','concave_points_se','symmetry_se','fractal_dimension_se',
    'radius_worst','texture_worst','perimeter_worst','area_worst','smoothness_worst',
    'compactness_worst','concavity_worst','concave_points_worst','symmetry_worst','fractal_dimension_worst'
  ];
  const data = {};
  for (const f of fields) {
    const val = parseFloat(document.getElementById(f).value);
    if (isNaN(val)) return null;
    data[f] = val;
  }
  return data;
}

async function submitForm() {
  const data = getFormData();
  if (!data) {
    showToast('Please fill in all fields');
    return;
  }

  const btn     = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('spinner');

  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline';

  try {
    const res = await fetch(`${API_BASE}/tahmin-et`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Server error');
    }

    const result = await res.json();
    const state  = result.tahmin_kodu === 1 ? 'malignant' : 'benign';
    setResult(state, result.karar);
    showToast(state === 'malignant' ? 'Malignant tumor detected' : 'Benign — no malignancy');

  } catch (e) {
    showToast('API connection failed — demo mode');
    const demo = Math.random() > 0.5 ? 'malignant' : 'benign';
    setTimeout(() => setResult(demo, null), 400);
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
  }
}

function fillDemo(type) {
  const demos = {
    malignant: {
      radius_mean: 17.99, texture_mean: 10.38, perimeter_mean: 122.8, area_mean: 1001.0,
      smoothness_mean: 0.1184, compactness_mean: 0.2776, concavity_mean: 0.3001,
      concave_points_mean: 0.1471, symmetry_mean: 0.2419, fractal_dimension_mean: 0.07871,
      radius_se: 1.095, texture_se: 0.9053, perimeter_se: 8.589, area_se: 153.4,
      smoothness_se: 0.006399, compactness_se: 0.04904, concavity_se: 0.05373,
      concave_points_se: 0.01587, symmetry_se: 0.03003, fractal_dimension_se: 0.006193,
      radius_worst: 25.38, texture_worst: 17.33, perimeter_worst: 184.6, area_worst: 2019.0,
      smoothness_worst: 0.1622, compactness_worst: 0.6656, concavity_worst: 0.7119,
      concave_points_worst: 0.2654, symmetry_worst: 0.4601, fractal_dimension_worst: 0.1189
    },
    benign: {
      radius_mean: 13.54, texture_mean: 14.36, perimeter_mean: 87.46, area_mean: 566.3,
      smoothness_mean: 0.09779, compactness_mean: 0.08129, concavity_mean: 0.06664,
      concave_points_mean: 0.04781, symmetry_mean: 0.1885, fractal_dimension_mean: 0.05766,
      radius_se: 0.2699, texture_se: 0.7886, perimeter_se: 2.058, area_se: 23.56,
      smoothness_se: 0.008462, compactness_se: 0.0146, concavity_se: 0.02387,
      concave_points_se: 0.01315, symmetry_se: 0.0198, fractal_dimension_se: 0.0023,
      radius_worst: 15.11, texture_worst: 19.26, perimeter_worst: 99.7, area_worst: 711.2,
      smoothness_worst: 0.144, compactness_worst: 0.1773, concavity_worst: 0.239,
      concave_points_worst: 0.1288, symmetry_worst: 0.2977, fractal_dimension_worst: 0.07259
    }
  };

  Object.entries(demos[type]).forEach(([k, v]) => {
    const el = document.getElementById(k);
    if (el) el.value = v;
  });
  showToast(type === 'malignant' ? 'Malignant sample loaded' : 'Benign sample loaded');
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelector(`[onclick="switchTab('${name}')"]`).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}
