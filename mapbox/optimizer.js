import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmxvcmlhbmJydW5lbCIsImEiOiJjbWloeGN3YjYwanRmM2ZxeHA1cmc2ZTIzIn0.NCC2xwUW96hFs8lJCFz3eA";

// Depot location (starting point)
const depot = [7.2619, 43.7102]; // Nice

// Example stops for 3 vehicles
const routes = {
  1: {
    color: "#007AFF",
    stops: [
      [7.2886, 43.7328], // Villefranche
      [7.325, 43.7447], // Beaulieu
      [7.3653, 43.7536], // Cap d'Ail
      [7.4246, 43.7384], // Monaco
    ],
  },
  2: {
    color: "#FF453A",
    stops: [
      [7.0167, 43.5528], // Cannes
      [6.937, 43.5282], // Théoule
      [6.8453, 43.4917], // Saint-Raphaël
    ],
  },
  3: {
    color: "#FF9F0A",
    stops: [
      [7.1, 43.65], // Antibes
      [7.05, 43.6], // Grasse direction
      [6.95, 43.55], // Mougins
      [7.02, 43.58], // Vallauris
    ],
  },
};

class RouteOptimizer {
  constructor() {
    this.map = null;
    this.selectedVehicle = null;
    this.init();
  }

  init() {
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v11",
      center: [7.1, 43.6],
      zoom: 10,
      pitch: 45,
      bearing: 0,
    });

    this.map.on("load", () => {
      this.setupControls();
      this.drawAllRoutes();
    });
  }

  setupControls() {
    // Route selection
    document.querySelectorAll(".route-row").forEach((row) => {
      row.addEventListener("click", () => {
        const vehicleId = row.dataset.vehicle;
        this.selectVehicle(vehicleId);
      });
    });

    this.map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    this.map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
  }

  async drawAllRoutes() {
    // Add depot marker
    const depotEl = document.createElement("div");
    depotEl.className = "depot-marker";
    depotEl.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
      </div>
    `;

    new mapboxgl.Marker({ element: depotEl, anchor: "center" })
      .setLngLat(depot)
      .addTo(this.map);

    // Draw each vehicle route
    for (const [vehicleId, route] of Object.entries(routes)) {
      await this.drawRoute(vehicleId, route);
    }
  }

  async drawRoute(vehicleId, route) {
    // Create waypoints: depot → stops → depot
    const waypoints = [depot, ...route.stops, depot];
    const coordsString = waypoints.map((c) => c.join(",")).join(";");

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
      );

      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const routeGeom = data.routes[0].geometry;

        // Add source
        this.map.addSource(`route-${vehicleId}`, {
          type: "geojson",
          data: routeGeom,
          lineMetrics: true,
        });

        // Add line layer
        this.map.addLayer({
          id: `route-line-${vehicleId}`,
          type: "line",
          source: `route-${vehicleId}`,
          paint: {
            "line-color": route.color,
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });

        // Add stop markers
        route.stops.forEach((stop, idx) => {
          const el = document.createElement("div");
          el.innerHTML = `
            <div style="
              width: 30px;
              height: 30px;
              background: ${route.color};
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 3px solid rgba(255,255,255,0.3);
            ">${idx + 1}</div>`;

          new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat(stop)
            .addTo(this.map);
        });
      }
    } catch (error) {
      console.error(`Error drawing route ${vehicleId}:`, error);
    }
  }

  selectVehicle(vehicleId) {
    this.selectedVehicle = vehicleId;

    // Update opacity - highlight selected
    for (const id of Object.keys(routes)) {
      const opacity = id === vehicleId ? 1 : 0.3;
      if (this.map.getLayer(`route-line-${id}`)) {
        this.map.setPaintProperty(`route-line-${id}`, "line-opacity", opacity);
      }
    }
  }
}

new RouteOptimizer();
