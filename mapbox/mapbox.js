import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// IMPORTANT: Replace with your actual Mapbox token
mapboxgl.accessToken =
  "pk.eyJ1IjoiZmxvcmlhbmJydW5lbCIsImEiOiJjbWloeGN3YjYwanRmM2ZxeHA1cmc2ZTIzIn0.NCC2xwUW96hFs8lJCFz3eA";

// Côte d'Azur coordinates with detailed info
const locations = {
  nice: {
    coordinates: [7.2619, 43.7102],
    name: "Nice",
    zoom: 13,
    region: "Alpes-Maritimes",
    population: "340K",
    attractions: "15+",
    avgTemp: "16°C",
    description:
      "Capitale de la Côte d'Azur, Nice séduit par sa Promenade des Anglais, son Vieux-Nice pittoresque et ses musées de renommée mondiale.",
    image: "https://picsum.photos/seed/nice/1600/900",
  },
  cannes: {
    coordinates: [7.0167, 43.5528],
    name: "Cannes",
    zoom: 13,
    region: "Alpes-Maritimes",
    population: "74K",
    attractions: "12+",
    avgTemp: "16°C",
    description:
      "Ville glamour connue pour son Festival de Cannes, sa Croisette légendaire et ses plages de sable fin bordées de palmiers.",
    image: "https://picsum.photos/seed/cannes/1600/900",
  },
  monaco: {
    coordinates: [7.4246, 43.7384],
    name: "Monaco",
    zoom: 14,
    region: "Principauté",
    population: "39K",
    attractions: "18+",
    avgTemp: "17°C",
    description:
      "Principauté légendaire entre mer et montagne, Monaco fascine par son Casino, son Grand Prix de Formule 1 et son palais princier.",
    image: "https://picsum.photos/seed/monaco/1600/900",
  },
  "saint-tropez": {
    coordinates: [6.6407, 43.2677],
    name: "Saint-Tropez",
    zoom: 13,
    region: "Var",
    population: "4.3K",
    attractions: "10+",
    avgTemp: "15°C",
    description:
      "Village mythique de pêcheurs devenu haut lieu du jet-set, Saint-Tropez charme par son port coloré et ses plages emblématiques.",
    image: "https://picsum.photos/seed/saint-tropez/1600/900",
  },
};

// Premium route configurations
const routes = {
  "nice-monaco": {
    coordinates: [
      [7.2619, 43.7102], // Nice
      [7.2886, 43.7328], // Villefranche-sur-Mer
      [7.325, 43.7447], // Beaulieu-sur-Mer
      [7.3653, 43.7536], // Cap d'Ail
      [7.4246, 43.7384], // Monaco
    ],
    color: "#007aff",
    name: "Nice → Monaco",
  },
  "cannes-tropez": {
    coordinates: [
      [7.0167, 43.5528], // Cannes
      [6.937, 43.5282], // Théoule-sur-Mer
      [6.8453, 43.4917], // Saint-Raphaël
      [6.7684, 43.4209], // Sainte-Maxime
      [6.6407, 43.2677], // Saint-Tropez
    ],
    color: "#ff2d55",
    name: "Cannes → Saint-Tropez",
  },
  coastal: {
    coordinates: [
      [7.2634, 43.6974], // Promenade du Paillon
      [7.2758, 43.6959], // Colline du château
      [7.2837, 43.6967], // Port Lympia
      [7.2968, 43.6965], // Parc du Mt Boron
      [7.2952, 43.6865], // Cap de Nice
    ],
    color: "#34c759",
    name: "Parcours Côtier Complet",
  },
  riquierCathedral: {
    coordinates: [
      [7.2901, 43.7061], // Riquier
      [7.2538, 43.7040], // Cathédrale St-Nicolas
    ],
    color: "#34c759",
    name: "Riquier - Cath. St-Nicolas",
  },
};

class PremiumMapbox {
  constructor() {
    this.map = null;
    this.animationFrameId = null;
    this.currentRoute = null;
    this.currentCityCard = null;
    this.init();
  }

  init() {
    // Initialize map with premium style
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/standard",
      center: [7.0167, 43.5528], // Centered on Côte d'Azur
      zoom: 10,
      pitch: 60,
      bearing: 0,
      antialias: true,
      projection: "globe",
    });

    this.map.on("load", () => {
      this.setupMap();
      this.setupControls();
      this.updateElevationInfo();
    });

    // Update elevation on mouse move
    this.map.on("mousemove", (e) => {
      this.updateElevationInfo(e.lngLat);
    });
  }

  setupMap() {
    // Configure for premium visual quality
    this.map.setConfigProperty("basemap", "lightPreset", "dusk");
    this.map.setFog({
      range: [0.8, 8],
      color: "#d4e6f1",
      "horizon-blend": 0.1,
      "high-color": "#e8f4f8",
      "space-color": "#b8d4e6",
      "star-intensity": 0.15,
    });

    // Add 3D terrain
    this.map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });

    this.map.setTerrain({
      source: "mapbox-dem",
      exaggeration: 1.5,
    });

    // Note: Mapbox Standard style handles 3D buildings automatically
    // However, to show them from further away (lower zoom), we add a custom layer
    
    const addCustom3DLayer = () => {
      if (!this.map.getLayer('custom-3d-buildings')) {
        this.map.addLayer({
          'id': 'custom-3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 12, // Revert to zoom 12
          'paint': {
            'fill-extrusion-color': '#e0e0e0',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12,
              0,
              12.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12,
              0,
              12.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.8
          }
        });
      }
    };

    if (this.map.isStyleLoaded()) {
      addCustom3DLayer();
    } else {
      this.map.on('style.load', addCustom3DLayer);
    }

    // Add navigation controls with premium styling
    this.map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
      }),
      "bottom-right"
    );
    this.map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
  }

  setupControls() {
    // Sidebar toggle - Two buttons approach
    const closeBtn = document.getElementById("sidebar-toggle-close");
    const openBtn = document.getElementById("sidebar-toggle-open");
    
    closeBtn.addEventListener("click", () => {
      document.body.classList.add("sidebar-collapsed");
    });
    
    openBtn.addEventListener("click", () => {
      document.body.classList.remove("sidebar-collapsed");
    });

    // City navigation buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Update active state
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Fly to city and show card
        const cityKey = btn.dataset.city;
        this.flyToLocation(cityKey);
        this.showCityCard(cityKey);
      });
    });

    // Route buttons
    document
      .getElementById("route-nice-monaco")
      .addEventListener("click", () => {
        this.drawAnimatedRoute("nice-monaco");
      });

    document
      .getElementById("route-cannes-tropez")
      .addEventListener("click", () => {
        this.drawAnimatedRoute("cannes-tropez");
      });

    document.getElementById("route-coastal").addEventListener("click", () => {
      this.drawAnimatedRoute("coastal", "walking");
    });

    document.getElementById("route-riquierCathedral").addEventListener("click", () => {
      this.drawAnimatedRoute("riquierCathedral", "walking");
    });

    document.getElementById("clear-route").addEventListener("click", () => {
      this.clearRoute();
    });
  }

  flyToLocation(cityKey) {
    const location = locations[cityKey];
    if (!location) return;

    // Remove existing marker if any
    this.removeCurrentMarker();

    // Create and add new marker
    const el = document.createElement("div");
    el.className = "city-marker";
    el.innerHTML = `
      <div class="city-marker-pulse"></div>
      <div class="city-marker-dot"></div>
      <div class="city-marker-label">${location.name}</div>
    `;

    // Add click listener to reopen card if closed
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showCityCard(cityKey);
    });

    this.currentMarker = new mapboxgl.Marker({
      element: el,
      anchor: "center",
    })
      .setLngLat(location.coordinates)
      .addTo(this.map);

    this.map.flyTo({
      center: location.coordinates,
      zoom: location.zoom,
      pitch: 60,
      bearing: 0,
      essential: true,
      duration: 2000,
      easing: (t) => t * (2 - t), // easeOutQuad
    });
  }

  removeCurrentMarker() {
    if (this.currentMarker) {
      this.currentMarker.remove();
      this.currentMarker = null;
    }
  }

  async drawAnimatedRoute(routeKey, mode = "driving") {
    const route = routes[routeKey];
    if (!route) return;

    this.clearRoute();
    this.currentRoute = routeKey;

    // Get waypoints from route config
    const waypoints = route.coordinates;
    const coordsString = waypoints.map((coord) => coord.join(",")).join(";");

    try {
      // Call Mapbox Directions API for real routing
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/${coordsString}?geometries=geojson&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
      );

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        console.error("No route found");
        return;
      }

      const routeData = data.routes[0];
      const routeGeoJSON = {
        type: "Feature",
        properties: {
          distance: routeData.distance,
          duration: routeData.duration,
        },
        geometry: routeData.geometry,
      };

      // Add route source with EMPTY geometry (prevents flash)
    this.map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [] // EMPTY at start!
        }
      },
      lineMetrics: true, // Required for line-progress gradient
    });

    // Bright golden/orange style from Mapbox reference
    const routeColors = {
      primary: '#FFB74D',    // Bright golden yellow
      secondary: '#FF9800',  // Vivid orange
      glow: '#FB8C00'        // Deep orange glow
    };

    // Outer glow for depth (HIDDEN initially)
    this.map.addLayer({
      id: "route-glow-outer",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": routeColors.glow,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8, 16,
          12, 24,
          16, 32
        ],
        "line-blur": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8, 14,
          12, 18,
          16, 22
        ],
        "line-opacity": 0, // HIDDEN at start!
      },
    });

    // Main line with emissive strength (HIDDEN initially)
    this.map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": routeColors.primary,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8, 6,
          12, 8,
          16, 12
        ],
        "line-opacity": 0, // Already at 0, good!
        "line-gradient": [
          "interpolate",
          ["linear"],
          ["line-progress"],
          0, routeColors.primary,
          0.5, routeColors.secondary,
          1, routeColors.glow
        ],
        // Only officially documented property for glow in web
        "line-emissive-strength": 5.0
      },
    });



    // Small delay to ensure everything is loaded, then animate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Animate route drawing
    await this.animateRouteDraw(routeData);

    // Update distance and duration with better formatting
    const distanceKm = (routeData.distance / 1000).toFixed(1);
    const durationMin = Math.round(routeData.duration / 60);
    
    // Format duration as hours and minutes
    let durationText;
    if (durationMin >= 60) {
      const hours = Math.floor(durationMin / 60);
      const minutes = durationMin % 60;
      durationText = `${hours}h ${minutes}min`;
    } else {
      durationText = `${durationMin} min`;
    }
    
    document.getElementById("distance").textContent = `${distanceKm} km • ${durationText}`;
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  }


  async animateRouteDraw(routeData) {
    const isHelicopterMode = document.getElementById("camera-mode-toggle").checked;

    if (isHelicopterMode) {
      return this.animateHelicopterMode(routeData);
    } else {
      return this.animateOverviewMode(routeData);
    }
  }

  async animateOverviewMode(routeData) {
    return new Promise((resolve) => {
      const coordinates = routeData.geometry.coordinates;
      
      // 1. Fit camera to the whole route first
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      this.map.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 400, right: 100 },
        pitch: 40,
        bearing: 0,
        duration: 1500,
        essential: true
      });

      // Wait for fly animation to mostly finish before starting to draw
      setTimeout(() => {
        const line = turf.lineString(coordinates);
        const lineLength = turf.length(line, { units: "kilometers" });
        
        // Even Slower animation for overview: 3s + 0.3s per km, capped at 12s
        const duration = Math.min(12000, 3000 + (lineLength * 300)); 
        const startTime = performance.now();

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Smooth easing
          const easeProgress = 1 - Math.pow(1 - progress, 3);

          try {
            const currentDistance = lineLength * easeProgress;
            
            if (currentDistance > 0) {
               const sliced = turf.lineSliceAlong(line, 0, currentDistance, { units: "kilometers" });
               const source = this.map.getSource("route");
               if (source) {
                 source.setData(sliced);
               }
            }

            this.map.setPaintProperty("route-line", "line-opacity", 1);

            if (progress < 1) {
              this.animationFrameId = requestAnimationFrame(animate);
            } else {
              // Ensure full line is drawn at the end
              const source = this.map.getSource("route");
              if (source) {
                source.setData(routeData.geometry);
              }
              resolve();
            }
          } catch (error) {
            console.error("Animation error:", error);
            this.finishAnimation(routeData, resolve);
          }
        };

        this.animationFrameId = requestAnimationFrame(animate);
      }, 1500); // Match the flyTo duration
    });
  }

  async animateHelicopterMode(routeData) {
    return new Promise((resolve) => {
      const coordinates = routeData.geometry.coordinates;
      const line = turf.lineString(coordinates);
      const lineLength = turf.length(line, { units: "kilometers" });
      
      // Helicopter view settings
      const duration = Math.max(8000, Math.min(30000, lineLength * 500)); 
      const startTime = performance.now();

      // Initial camera setup
      const startBearing = turf.bearing(
        turf.point(coordinates[0]), 
        turf.point(coordinates[Math.min(10, coordinates.length - 1)])
      );
      
      this.map.flyTo({
        center: coordinates[0],
        zoom: 13,
        pitch: 50,
        bearing: startBearing,
        duration: 1500, // Faster so camera arrives before line starts
        essential: true
      });

      // Rolling average for bearing to smooth out jitters
      let smoothedBearing = startBearing;

      // Wait for camera to arrive, then start drawing
      setTimeout(() => {
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          try {
            const currentDistance = lineLength * progress;
            const currentPoint = turf.along(line, currentDistance, { units: "kilometers" });
            const currentCoord = currentPoint.geometry.coordinates;

            const sliced = turf.lineSliceAlong(line, 0, currentDistance, { units: "kilometers" });
       const source = this.map.getSource("route");
       if (source) {
         source.setData(sliced);
       }
       // Fade in both layers progressively
       this.map.setPaintProperty("route-line", "line-opacity", 0.95);
       this.map.setPaintProperty("route-glow-outer", "line-opacity", Math.min(progress * 0.6, 0.5));

            if (progress < 1) {
              // Look ahead further to stabilize direction (0.2km instead of 0.1km)
              const targetDistance = Math.min(currentDistance + 0.2, lineLength);
              const targetPoint = turf.along(line, targetDistance, { units: "kilometers" });
              
              const bearingToTarget = turf.bearing(currentPoint, targetPoint);
              
              // Smooth rotation logic
              let diff = bearingToTarget - smoothedBearing;
              while (diff > 180) diff -= 360;
              while (diff < -180) diff += 360;
              
              // Apply very soft smoothing factor (0.05)
              smoothedBearing += diff * 0.05;

              this.map.easeTo({
                center: currentCoord,
                bearing: smoothedBearing,
                zoom: 13.2, // Slightly higher up to avoid terrain clipping
                pitch: 50, // Slightly less steep to reduce horizon jumping
                duration: 100, // Keep short for responsiveness
                easing: t => t // Linear
              });

              this.animationFrameId = requestAnimationFrame(animate);
            } else {
              this.finishAnimation(routeData, resolve);
            }
          } catch (error) {
            console.error("Animation error:", error);
            this.finishAnimation(routeData, resolve);
          }
        };

        this.animationFrameId = requestAnimationFrame(animate);
      }); // Match flyTo duration
    });
  }

  finishAnimation(routeData, resolve) {
    // Zoom out to show the full route
    this.map.easeTo({
      padding: { top: 100, bottom: 100, left: 400, right: 100 },
      pitch: 40,
      bearing: 0,
      duration: 2000,
      zoom: 10.5
    });
    
    // Ensure full line is drawn
    const source = this.map.getSource("route");
    if (source) {
      source.setData(routeData.geometry);
    }
    
    resolve();
  }

  clearRoute() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove route layers
    if (this.map.getLayer("route-line")) this.map.removeLayer("route-line");
    if (this.map.getLayer("route-glow-outer")) this.map.removeLayer("route-glow-outer");
    
    // Remove old layers if they exist
    if (this.map.getLayer("route-background")) this.map.removeLayer("route-background");
    if (this.map.getLayer("route-dashes")) this.map.removeLayer("route-dashes");
    
    // Remove source
    if (this.map.getSource("route")) this.map.removeSource("route");

    this.currentRoute = null;
    document.getElementById("distance").textContent = "--";
  }

  updateElevationInfo(lngLat) {
    if (!lngLat) {
      document.getElementById("elevation").textContent = "--";
      return;
    }

    // Query terrain elevation
    const elevation = this.map.queryTerrainElevation(lngLat);
    
    if (elevation !== null) {
      document.getElementById("elevation").textContent = `${Math.round(
        elevation
      )} m`;
    }
  }

  showCityCard(cityKey) {
    const city = locations[cityKey];
    if (!city) return;

    // Remove existing card
    if (this.currentCityCard) {
      this.currentCityCard.remove();
    }

    // Create card element
    const card = document.createElement("div");
    card.className = "city-card";

    // Create image with gradient fallback
    const img = document.createElement("div");
    img.className = "city-card-image";

    // Try to load actual image
    const bgImg = new Image();
    bgImg.src = city.image;
    bgImg.onload = () => {
      img.style.backgroundImage = `url(${city.image})`;
    };
    bgImg.onerror = () => {
      // Fallback to gradient if image fails
      img.style.backgroundImage =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    };

    // Set initial gradient while loading
    img.style.backgroundImage =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    img.style.backgroundSize = "cover";
    img.style.backgroundPosition = "center";

    // Create close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "city-card-close";
    closeBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    // Create content
    const content = document.createElement("div");
    content.className = "city-card-content";
    content.innerHTML = `
      <div class="city-card-header">
        <h2 class="city-card-title">${city.name}</h2>
      </div>
      <div class="city-card-meta">${city.region}</div>
      <div class="city-card-stats">
        <div class="city-stat">
          <span class="city-stat-value">${city.population}</span>
          <span class="city-stat-label">Population</span>
        </div>
        <div class="city-stat">
          <span class="city-stat-value">${city.attractions}</span>
          <span class="city-stat-label">Attractions</span>
        </div>
      <div class="city-stat">
          <span class="city-stat-value">${city.avgTemp}</span>
          <span class="city-stat-label">Temp. moy.</span>
        </div>
      </div>
      <p class="city-card-description">${city.description}</p>
      <button class="city-card-action">Explorer la ville</button>
    `;

    card.appendChild(img);
    card.appendChild(closeBtn); // Add close button directly to card
    card.appendChild(content);

    // Add event listeners
    closeBtn.addEventListener("click", () => {
      this.closeCityCard();
    });

    const actionBtn = content.querySelector(".city-card-action");
    actionBtn.addEventListener("click", () => {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(
          city.name + " Côte d'Azur"
        )}`,
        "_blank"
      );
    });

    document.body.appendChild(card);
    this.currentCityCard = card;

    // Fly to city
    this.flyToLocation(cityKey);
  }

  closeCityCard() {
    if (this.currentCityCard) {
      this.currentCityCard.remove();
      this.currentCityCard = null;
    }
    // Also remove the marker when closing the card
    this.removeCurrentMarker();
  }
}

// Initialize the app
new PremiumMapbox();
