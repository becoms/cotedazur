import { useCallback, useEffect, useRef, useState } from "react";

import {
  APIProvider,
  Map3D,
  Map3DCameraChangedEvent,
  Map3DSteadyChangeEvent,
  Marker3D,
} from "@vis.gl/react-google-maps";
import ControlPanel from "@/components/google-maps/control-panel";

import "./style.css";
import { Map3DCameraProps } from "@/types/google-maps-3d-camera-props";

const EUROPE_VIEW: Map3DCameraProps = {
  center: { lat: 43.69717100763474, lng: 7.25658566601723, altitude: 0 },
  range: 2_500_000,
  heading: 0,
  tilt: 0,
  roll: 0,
};

const COTE_AZUR_VIEW: Map3DCameraProps = {
  center: { lat: 43.2, lng: 6.7, altitude: 500 },
  range: 130_000,
  heading: 0,
  tilt: 55,
  roll: 0,
};

const CHAGALL_POSITION = { lat: 43.70951152511342, lng: 7.270183568498879 };
const CHAGALL_VIEW: Map3DCameraProps = {
  center: { ...CHAGALL_POSITION, altitude: 40 },
  range: 350,
  heading: 20,
  tilt: 65,
  roll: 0,
};

const MIMOSA_POSITION = { lat: 43.585, lng: 6.895 };
const MIMOSA_VIEW: Map3DCameraProps = {
  center: { ...MIMOSA_POSITION, altitude: 300 },
  range: 2500,
  heading: 340,
  tilt: 62,
  roll: 0,
};

const MERCANTOUR_POSITION = { lat: 44.05, lng: 7.47 };
const MERCANTOUR_VIEW: Map3DCameraProps = {
  center: { ...MERCANTOUR_POSITION, altitude: 1800 },
  range: 18000,
  heading: 10,
  tilt: 72,
  roll: 0,
};

const ANIMATION_DURATION = 6000;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const Map3DExample = () => {
  const [viewProps, setViewProps] = useState<Map3DCameraProps>(EUROPE_VIEW);
  const isAnimating = useRef(true);
  const animationStarted = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleCameraChange = useCallback((ev: Map3DCameraChangedEvent) => {
    if (!isAnimating.current) {
      setViewProps((prev) => ({ ...prev, ...ev.detail }));
    }
  }, []);

  const animateTo = useCallback(
    (from: Map3DCameraProps, to: Map3DCameraProps, duration: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      isAnimating.current = true;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);
        const t = easeInOutCubic(rawProgress);

        setViewProps({
          center: {
            lat: lerp(from.center.lat, to.center.lat, t),
            lng: lerp(from.center.lng, to.center.lng, t),
            altitude: lerp(from.center.altitude, to.center.altitude, t),
          },
          range: Math.exp(lerp(Math.log(from.range), Math.log(to.range), t)),
          heading: lerp(from.heading, to.heading, t),
          tilt: lerp(from.tilt, to.tilt, t),
          roll: 0,
        });

        if (rawProgress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          isAnimating.current = false;
          setViewProps(to);
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [],
  );

  const handleSteadyChange = useCallback(
    (ev: Map3DSteadyChangeEvent) => {
      if (!ev.detail.isSteady || animationStarted.current) return;
      animationStarted.current = true;
      animateTo(EUROPE_VIEW, COTE_AZUR_VIEW, ANIMATION_DURATION);
    },
    [animateTo],
  );

  const handleChagallClick = useCallback(() => {
    animateTo(viewProps, CHAGALL_VIEW, 2500);
  }, [animateTo, viewProps]);

  const handleMimosaClick = useCallback(() => {
    animateTo(viewProps, MIMOSA_VIEW, 2500);
  }, [animateTo, viewProps]);

  const handleMercantourClick = useCallback(() => {
    animateTo(viewProps, MERCANTOUR_VIEW, 2500);
  }, [animateTo, viewProps]);

  return (
    <Map3D
      {...viewProps}
      onCameraChanged={handleCameraChange}
      onSteadyChange={handleSteadyChange}
      defaultLabelsDisabled
      mode="SATELLITE"
      style={{ width: "100vw", height: "100vh" }}
    >
      <Marker3D
        position={{ ...CHAGALL_POSITION, altitude: 0 }}
        title="Musée National Marc Chagall"
        label="Musée Chagall"
        onClick={handleChagallClick}
      />
      <Marker3D
        position={{ ...MIMOSA_POSITION, altitude: 0 }}
        title="Forêt de mimosa – Massif du Tanneron"
        label="Forêt de mimosa"
        onClick={handleMimosaClick}
      />
      <Marker3D
        position={{ ...MERCANTOUR_POSITION, altitude: 0 }}
        title="Parc national du Mercantour"
        label="Mercantour"
        onClick={handleMercantourClick}
      />
    </Map3D>
  );
};

export const HomePage = () => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map3DExample />
      <ControlPanel />
    </APIProvider>
  );
};
