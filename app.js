const roadsFeature = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Broadway', class: 'arterial' },
      geometry: {
        type: 'LineString',
        coordinates: [[-74.008, 40.712], [-73.995, 40.72], [-73.98, 40.735], [-73.955, 40.75]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Third Avenue', class: 'primary' },
      geometry: {
        type: 'LineString',
        coordinates: [[-74.02, 40.69], [-74.01, 40.71], [-73.99, 40.73], [-73.97, 40.75]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Canal Street', class: 'collector' },
      geometry: {
        type: 'LineString',
        coordinates: [[-74.02, 40.72], [-74.005, 40.715], [-73.995, 40.705]]
      }
    }
  ]
};

const parcelsFeature = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Parcel 01', area: '4.2 acres', zone: 'Mixed Use' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-74.012, 40.708], [-74.002, 40.707], [-74.001, 40.714], [-74.01, 40.716], [-74.012, 40.708]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Parcel 02', area: '3.7 acres', zone: 'Residential' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-73.999, 40.71], [-73.988, 40.71], [-73.988, 40.718], [-73.998, 40.719], [-73.999, 40.71]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Parcel 03', area: '2.9 acres', zone: 'Commercial' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-74.011, 40.718], [-74.005, 40.717], [-74.003, 40.724], [-74.01, 40.725], [-74.011, 40.718]]]
      }
    }
  ]
};

const sitesFeature = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Hudson Point', status: 'Active', type: 'Commercial', owner: 'CityWorks' },
      geometry: { type: 'Point', coordinates: [-74.006, 40.712] }
    },
    {
      type: 'Feature',
      properties: { name: 'South Transit Hub', status: 'Planning', type: 'Transit', owner: 'Metropolitan Dept.' },
      geometry: { type: 'Point', coordinates: [-73.997, 40.719] }
    },
    {
      type: 'Feature',
      properties: { name: 'Waterfront Terrace', status: 'Active', type: 'Residential', owner: 'Harbor Group' },
      geometry: { type: 'Point', coordinates: [-74.016, 40.705] }
    },
    {
      type: 'Feature',
      properties: { name: 'Old Rail Depot', status: 'Inactive', type: 'Industrial', owner: 'Legacy Assets' },
      geometry: { type: 'Point', coordinates: [-73.98, 40.736] }
    }
  ]
};

const mapBounds = L.latLngBounds([
  [40.65, -74.1],
  [40.85, -73.88]
]);

const map = L.map('map', {
  zoomControl: true,
  attributionControl: true,
  preferCanvas: true
}).fitBounds(mapBounds);

const basemapLayers = {
  topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM',
    maxZoom: 18
  }),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 20
  }),
  satellite: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      maxZoom: 19
    }
  ),
  offline: L.gridLayer({ attribution: 'Offline coordinate grid', maxZoom: 19 })
};

basemapLayers.offline.createTile = (coords, done) => {
  const size = 256;
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const context = tile.getContext('2d');
  context.fillStyle = '#e8eff4';
  context.fillRect(0, 0, size, size);
  context.strokeStyle = 'rgba(42, 73, 93, 0.16)';
  context.lineWidth = 1;
  for (let offset = 0; offset <= size; offset += 64) {
    context.beginPath();
    context.moveTo(offset, 0);
    context.lineTo(offset, size);
    context.moveTo(0, offset);
    context.lineTo(size, offset);
    context.stroke();
  }
  const center = map.unproject(L.point(coords.x * size + size / 2, coords.y * size + size / 2), coords.z);
  context.fillStyle = '#526b7b';
  context.font = '12px sans-serif';
  context.fillText(`${center.lat.toFixed(3)}°, ${center.lng.toFixed(3)}°`, 10, 20);
  done(null, tile);
  return tile;
};

const initialBasemapKey = navigator.onLine ? 'satellite' : 'offline';

const connectionStatus = document.getElementById('connectionStatus');
const updateConnectionStatus = () => {
  const online = navigator.onLine;
  connectionStatus.textContent = location.protocol === 'file:'
    ? (online ? 'Online · offline needs localhost' : 'Offline mode')
    : (online ? 'Online · offline-ready' : 'Offline mode');
  connectionStatus.classList.toggle('offline', !online);
  if (!online) setBasemap('offline');
};

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => {
      connectionStatus.textContent = navigator.onLine ? 'Online · offline-ready' : 'Offline mode';
    })
    .catch(error => {
      connectionStatus.textContent = navigator.onLine ? 'Online · offline cache unavailable' : 'Offline · cache unavailable';
      console.error('Service worker registration failed:', error);
    });
}

const roadLayer = L.geoJSON(roadsFeature, {
  style: {
    color: '#ff9f43',
    weight: 4,
    opacity: 0.9
  }
});

const parcelsLayer = L.geoJSON(parcelsFeature, {
  style: {
    color: '#2fbf71',
    fillColor: '#77dd77',
    fillOpacity: 0.35,
    weight: 1.5
  },
  onEachFeature: (feature, layer) => {
    const props = feature.properties || {};
    layer.bindPopup(`
      <div class="custom-popup">
        <div class="popup-title">${props.name || 'Parcel'}</div>
        <div class="popup-meta">
          <span>Area: ${props.area || 'N/A'}</span>
          <span>Zone: ${props.zone || 'Commercial'}</span>
        </div>
      </div>
    `);
  }
});

const siteLayer = L.geoJSON(sitesFeature, {
  pointToLayer: (feature, latlng) => {
    const status = feature.properties?.status || 'Active';
    const color = status === 'Active' ? '#42d6a4' : '#ff6b6b';
    return L.circleMarker(latlng, {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: color,
      fillOpacity: 0.9
    });
  },
  onEachFeature: (feature, layer) => {
    const props = feature.properties || {};
    layer.bindPopup(`
      <div class="custom-popup">
        <div class="popup-title">${props.name}</div>
        <div class="popup-meta">
          <span>Status: ${props.status}</span>
          <span>Type: ${props.type}</span>
          <span>Owner: ${props.owner}</span>
        </div>
      </div>
    `);
  }
});

const uploadedDataLayer = L.layerGroup();
const layers = {
  basemap: basemapLayers.satellite,
  parcels: parcelsLayer,
  roads: roadLayer,
  sites: siteLayer,
  uploads: uploadedDataLayer
};

const activeBasemapLabel = document.getElementById('basemapName');
const basemapSelect = document.getElementById('basemapSelect');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const siteCount = document.getElementById('siteCount');
const parcelCount = document.getElementById('parcelCount');
const roadLength = document.getElementById('roadLength');
const activeParcels = document.getElementById('activeParcels');
const planningSites = document.getElementById('planningSites');
const locateBtn = document.getElementById('locateBtn');
const measureBtn = document.getElementById('measureBtn');
const resetViewBtn = document.getElementById('resetViewBtn');
const geojsonUploadBtn = document.getElementById('geojsonUploadBtn');
const geojsonInput = document.getElementById('geojsonInput');
const exportGeojsonBtn = document.getElementById('exportGeojsonBtn');
const saveProjectBtn = document.getElementById('saveProjectBtn');
const appStatus = document.getElementById('appStatus');
const basemapNames = {
  topo: 'Topographic',
  dark: 'Dark',
  satellite: 'Satellite imagery',
  offline: 'Offline grid'
};
const projectStorageKey = 'geovista-project-v1';
let activeBasemapKey = initialBasemapKey;
let statusTimeout;

const showStatus = (message, isError = false) => {
  window.clearTimeout(statusTimeout);
  appStatus.textContent = message;
  appStatus.classList.toggle('error', isError);
  appStatus.classList.add('visible');
  statusTimeout = window.setTimeout(() => appStatus.classList.remove('visible'), 3600);
};

basemapLayers[activeBasemapKey].addTo(map);
roadLayer.addTo(map);
parcelsLayer.addTo(map);
siteLayer.addTo(map);

const updateStats = () => {
  siteCount.textContent = sitesFeature.features.length;
  parcelCount.textContent = parcelsFeature.features.length;
  roadLength.textContent = `${(roadsFeature.features.length * 1.8).toFixed(1)} km`;
  activeParcels.textContent = parcelsFeature.features.length;
  planningSites.textContent = sitesFeature.features.filter(feature => feature.properties?.status === 'Planning').length;
  activeBasemapLabel.textContent = basemapNames[activeBasemapKey];
  basemapSelect.value = activeBasemapKey;
};

updateStats();

const searchIndex = [
  { label: 'Hudson Terminal', coords: [40.709, -74.013] },
  { label: 'Central Park', coords: [40.7829, -73.9654] },
  { label: 'Brooklyn Bridge', coords: [40.7061, -73.9967] },
  { label: 'South Street', coords: [40.7044, -74.0102] },
  { label: 'Harbor Point', coords: [40.7196, -74.027] }
];

const flyToSearchResult = (query) => {
  const cleaned = query.trim();
  if (!cleaned) return;

  const target = searchIndex.find(item => item.label.toLowerCase().includes(cleaned.toLowerCase()));
  if (target) {
    map.flyTo(target.coords, 14, { duration: 1.5 });
    L.popup().setLatLng(target.coords).setContent(`<div class="custom-popup"><div class="popup-title">${target.label}</div></div>`).openOn(map);
    return;
  }

  const siteMatch = sitesFeature.features.find(feature =>
    feature.properties?.name.toLowerCase().includes(cleaned.toLowerCase())
  );

  if (siteMatch) {
    const [lng, lat] = siteMatch.geometry.coordinates;
    map.flyTo([lat, lng], 15, { duration: 1.5 });
    const matchLayer = siteLayer.getLayers().find(layer => layer.feature === siteMatch);
    if (matchLayer) matchLayer.openPopup();
    return;
  }
  showStatus(`No results found for “${cleaned}”.`, true);
};

searchBtn.addEventListener('click', () => flyToSearchResult(searchInput.value));
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') flyToSearchResult(searchInput.value);
});

const toolButtons = document.querySelectorAll('.tool-btn');
const layerCheckboxes = document.querySelectorAll('[data-layer]');
let activeTool = 'pan';
let identifyModeEnabled = false;

const setToolState = (toolName) => {
  activeTool = toolName;
  identifyModeEnabled = toolName === 'identify';
  toolButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tool === toolName));
  measureBtn.classList.toggle('active', toolName === 'measure');
  map.getContainer().classList.toggle('map-add-point', toolName === 'add-point');
};

let measureModeEnabled = false;
let measurePoints = [];
const measureLayer = L.layerGroup().addTo(map);

const clearMeasurement = () => {
  measurePoints = [];
  measureLayer.clearLayers();
};

const startMeasurement = () => {
  measureModeEnabled = !measureModeEnabled;
  setToolState(measureModeEnabled ? 'measure' : 'pan');
  clearMeasurement();
  showStatus(measureModeEnabled ? 'Click two points on the map to measure a distance.' : 'Measurement mode closed.');
};

measureBtn.addEventListener('click', startMeasurement);

const identifyPopup = L.popup();
map.on('click', event => {
  if (activeTool === 'add-point') {
    const feature = {
      type: 'Feature',
      properties: {
        name: `New site ${uploadedDataLayer.getLayers().length + 1}`,
        createdAt: new Date().toISOString()
      },
      geometry: {
        type: 'Point',
        coordinates: [event.latlng.lng, event.latlng.lat]
      }
    };
    const markerLayer = L.geoJSON(feature, {
      pointToLayer: (_, latlng) => L.circleMarker(latlng, {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#4ea1ff',
        fillOpacity: 0.95
      }),
      onEachFeature: (item, layer) => {
        const popup = document.createElement('div');
        popup.className = 'custom-popup';
        const title = document.createElement('div');
        title.className = 'popup-title';
        title.textContent = item.properties.name;
        const meta = document.createElement('div');
        meta.className = 'popup-meta';
        meta.textContent = `Lat ${event.latlng.lat.toFixed(5)}, Lng ${event.latlng.lng.toFixed(5)}`;
        popup.append(title, meta);
        layer.bindPopup(popup);
      }
    });
    uploadedDataLayer.addLayer(markerLayer);
    if (!map.hasLayer(uploadedDataLayer)) map.addLayer(uploadedDataLayer);
    markerLayer.openPopup();
    showStatus('Point added. Save the project to keep your changes.');
    return;
  }

  if (identifyModeEnabled) {
    const content = document.createElement('div');
    content.className = 'custom-popup';
    const title = document.createElement('div');
    title.className = 'popup-title';
    title.textContent = 'Map location';
    const coordinates = document.createElement('div');
    coordinates.className = 'popup-meta';
    coordinates.textContent = `Latitude ${event.latlng.lat.toFixed(5)} · Longitude ${event.latlng.lng.toFixed(5)}`;
    content.append(title, coordinates);
    identifyPopup.setLatLng(event.latlng).setContent(content).openOn(map);
    return;
  }

  if (!measureModeEnabled) return;

  measurePoints.push(event.latlng);
  L.circleMarker(event.latlng, {
    radius: 6,
    color: '#ffffff',
    weight: 2,
    fillColor: '#ffb703',
    fillOpacity: 0.9
  }).addTo(measureLayer);

  if (measurePoints.length >= 2) {
    const line = L.polyline(measurePoints, { color: '#ffb703', weight: 4 }).addTo(measureLayer);
    const distanceKm = measurePoints[0].distanceTo(measurePoints[1]) / 1000;
    L.popup()
      .setLatLng(event.latlng)
      .setContent(`<div class="custom-popup"><div class="popup-title">Distance</div><div class="popup-meta"><span>${distanceKm.toFixed(2)} km</span></div></div>`)
      .openOn(map);
    line.bindPopup(`<div class="custom-popup"><div class="popup-title">Measured segment</div><div class="popup-meta"><span>${distanceKm.toFixed(2)} km</span></div></div>`);
    measurePoints = [];
  }
});

layerCheckboxes.forEach(input => {
  input.addEventListener('change', event => {
    const key = event.target.dataset.layer;
    const targetLayer = layers[key];
    if (!targetLayer || key === 'basemap') return;

    if (event.target.checked) {
      map.addLayer(targetLayer);
    } else {
      map.removeLayer(targetLayer);
    }
  });
});

const basemapToggle = document.querySelector('[data-layer="basemap"]');
const setBasemap = (key) => {
  if (!basemapLayers[key]) {
    showStatus('That basemap is not available.', true);
    return;
  }
  Object.values(basemapLayers).forEach(layer => map.removeLayer(layer));
  activeBasemapKey = key;
  basemapSelect.value = key;
  activeBasemapLabel.textContent = basemapNames[key];
  if (basemapToggle.checked) basemapLayers[key].addTo(map);
};

basemapSelect.addEventListener('change', event => setBasemap(event.target.value));
basemapToggle.addEventListener('change', event => {
  const selectedLayer = basemapLayers[activeBasemapKey];
  if (event.target.checked) selectedLayer.addTo(map);
  else map.removeLayer(selectedLayer);
});

basemapLayers.satellite.on('tileerror', () => {
  if (activeBasemapKey !== 'satellite') return;
  setBasemap('offline');
  showStatus('Satellite tiles are unavailable. Switched to the offline map.');
});

geojsonUploadBtn.addEventListener('click', () => geojsonInput.click());
geojsonInput.addEventListener('change', event => {
  const [file] = event.target.files || [];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    showStatus('GeoJSON files must be 10 MB or smaller.', true);
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const geojson = JSON.parse(String(reader.result));
      if (!geojson || !['Feature', 'FeatureCollection', 'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'].includes(geojson.type)) {
        throw new Error('The file does not contain a GeoJSON feature or geometry.');
      }
      const newLayer = createGeojsonLayer(geojson);
      const bounds = newLayer.getBounds();
      if (!bounds.isValid()) throw new Error('The GeoJSON file contains no mappable features.');

      uploadedDataLayer.addLayer(newLayer);
      map.addLayer(uploadedDataLayer);
      map.fitBounds(bounds);
      showStatus(`Loaded ${file.name}. Save the project to keep it.`);
      event.target.value = '';
    } catch (error) {
      showStatus(error instanceof Error ? error.message : 'Could not read this GeoJSON file.', true);
      event.target.value = '';
    }
  };
  reader.onerror = () => {
    showStatus('Could not read the selected file.', true);
    event.target.value = '';
  };
  reader.readAsText(file);
});

const createGeojsonLayer = geojson => L.geoJSON(geojson, {
  style: () => ({ color: '#4ea1ff', weight: 2, fillColor: '#4ea1ff', fillOpacity: 0.25 }),
  pointToLayer: (_, latlng) => L.circleMarker(latlng, {
    radius: 7,
    color: '#ffffff',
    fillColor: '#4ea1ff',
    fillOpacity: 0.9,
    weight: 2
  }),
  onEachFeature: (feature, layer) => {
    const popup = document.createElement('div');
    popup.className = 'custom-popup';
    const title = document.createElement('div');
    title.className = 'popup-title';
    title.textContent = feature.properties?.name || 'Imported feature';
    popup.append(title);

    const properties = Object.entries(feature.properties || {});
    if (properties.length) {
      const list = document.createElement('div');
      list.className = 'popup-meta';
      properties.forEach(([key, value]) => {
        const row = document.createElement('div');
        row.textContent = `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`;
        list.append(row);
      });
      popup.append(list);
    }
    layer.bindPopup(popup);
  }
});

const exportFeatureCollection = () => ({
  type: 'FeatureCollection',
  features: [
    ...roadsFeature.features,
    ...parcelsFeature.features,
    ...sitesFeature.features,
    ...(uploadedDataLayer.toGeoJSON().features || [])
  ]
});

exportGeojsonBtn.addEventListener('click', () => {
  const data = new Blob([JSON.stringify(exportFeatureCollection(), null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'geovista-project.geojson';
  link.click();
  URL.revokeObjectURL(url);
  showStatus('GeoJSON export downloaded.');
});

const readProjectState = () => {
  try {
    const saved = localStorage.getItem(projectStorageKey);
    if (!saved) return null;
    const state = JSON.parse(saved);
    if (state?.version !== 1) throw new Error('Unsupported saved project version.');
    return state;
  } catch (error) {
    showStatus(error instanceof Error ? `Could not restore saved project: ${error.message}` : 'Could not restore saved project.', true);
    return null;
  }
};

const saveProject = () => {
  try {
    const state = {
      version: 1,
      center: [map.getCenter().lat, map.getCenter().lng],
      zoom: map.getZoom(),
      basemap: activeBasemapKey,
      basemapVisible: basemapToggle.checked,
      layers: Object.fromEntries(
        [...layerCheckboxes].map(input => [input.dataset.layer, input.checked])
      ),
      uploaded: uploadedDataLayer.toGeoJSON()
    };
    localStorage.setItem(projectStorageKey, JSON.stringify(state));
    showStatus('Project saved in this browser.');
  } catch (error) {
    showStatus(error instanceof Error ? `Could not save project: ${error.message}` : 'Could not save project.', true);
  }
};

saveProjectBtn.addEventListener('click', saveProject);

const restoreProject = () => {
  const state = readProjectState();
  if (!state) return;

  if (Array.isArray(state.center) && state.center.length === 2 &&
      state.center.every(Number.isFinite) && Number.isFinite(state.zoom)) {
    map.setView(state.center, state.zoom);
  }
  if (typeof state.basemap === 'string' && basemapLayers[state.basemap]) {
    setBasemap(state.basemap);
  } else if (state.basemap === 'osm') {
    setBasemap(navigator.onLine ? 'satellite' : 'offline');
  }

  if (state.layers && typeof state.layers === 'object') {
    layerCheckboxes.forEach(input => {
      const visible = state.layers[input.dataset.layer];
      if (typeof visible !== 'boolean') return;
      input.checked = visible;
      if (input.dataset.layer !== 'basemap') {
        if (visible) map.addLayer(layers[input.dataset.layer]);
        else map.removeLayer(layers[input.dataset.layer]);
      }
    });
  }

  basemapToggle.checked = state.basemapVisible !== false;
  if (basemapToggle.checked) basemapLayers[activeBasemapKey].addTo(map);
  else map.removeLayer(basemapLayers[activeBasemapKey]);

  if (state.uploaded?.type === 'FeatureCollection' && Array.isArray(state.uploaded.features)) {
    const restoredLayer = createGeojsonLayer(state.uploaded);
    if (restoredLayer.getBounds().isValid()) uploadedDataLayer.addLayer(restoredLayer);
  }
  updateStats();
};

restoreProject();

const legend = L.control({ position: 'bottomright' });
legend.onAdd = () => {
  const div = L.DomUtil.create('div', 'leaflet-legend');
  div.innerHTML = `
    <div style="background: rgba(16,27,43,0.9); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 12px; color: #edf6ff; font-size: 12px;">
      <div style="font-weight:700; margin-bottom: 8px;">Legend</div>
      <div style="display:flex; align-items:center; gap:8px; margin:4px 0;"><span style="width:12px; height:12px; border-radius:50%; background:#42d6a4; display:inline-block;"></span> Active site</div>
      <div style="display:flex; align-items:center; gap:8px; margin:4px 0;"><span style="width:12px; height:12px; border-radius:50%; background:#ff6b6b; display:inline-block;"></span> Inactive site</div>
      <div style="display:flex; align-items:center; gap:8px; margin:4px 0;"><span style="width:18px; height:4px; background:#ff9f43; display:inline-block; border-radius:99px;"></span> Road</div>
      <div style="display:flex; align-items:center; gap:8px; margin:4px 0;"><span style="width:18px; height:12px; background:#77dd77; display:inline-block; border-radius:4px; opacity:0.8;"></span> Parcel</div>
    </div>
  `;
  return div;
};
legend.addTo(map);

const defaultFeaturePanelText = document.getElementById('featurePanel').querySelector('p');
defaultFeaturePanelText.textContent = 'Ready for site analysis and advanced planning workflows.';

toolButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tool = button.dataset.tool;
    if (tool === 'measure') {
      if (!measureModeEnabled) startMeasurement();
      return;
    }
    measureModeEnabled = false;
    clearMeasurement();
    setToolState(tool);
    if (tool === 'identify') showStatus('Click the map to inspect coordinates.');
    else if (tool === 'add-point') showStatus('Click the map to add a point feature.');
    else showStatus('Pan mode enabled.');
  });
});

updateConnectionStatus();

resetViewBtn.addEventListener('click', () => {
  map.fitBounds(mapBounds);
});

locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showStatus('Geolocation is not supported in this browser.', true);
    return;
  }

  locateBtn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      map.flyTo([latitude, longitude], 14, { duration: 1.2 });
      L.marker([latitude, longitude]).addTo(map).bindPopup('You are here').openPopup();
      locateBtn.disabled = false;
      showStatus('Centered on your location.');
    },
    error => {
      locateBtn.disabled = false;
      showStatus(error.message || 'Could not get your location.', true);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});
