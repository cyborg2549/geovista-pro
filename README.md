# GeoVista Pro

GeoVista Pro is a browser-based GIS prototype with editable point features, GeoJSON import/export, saved project state, and switchable basemaps.

## Run it

Serve this folder over HTTP on `localhost` (service workers do not work from `file://` URLs):

```sh
python -m http.server 8765
```

Open `http://localhost:8765` and wait for the connection badge to show **Online · offline-ready**. The service worker caches the app shell and local Leaflet assets. After that first successful load, the app shell, sample layers, uploaded/saved project data, and the **Offline grid** basemap work without a network connection. Open the same URL in the same browser profile to use its offline cache.

Topographic, Dark, and Satellite imagery basemaps require internet access. Satellite imagery uses Esri World Imagery and is not cached for offline use; switch to **Offline grid** when disconnected. Geolocation also depends on browser support and permission.

Project state is stored in the current browser's local storage. Use **Save project** before closing to preserve the map view, layer visibility, basemap selection, and uploaded/created features. **Export data** downloads the working GeoJSON features.
