import {useCallback, useState} from 'react';

import {
  APIProvider,
  Map3D,
  Map3DCameraChangedEvent,
} from '@vis.gl/react-google-maps';
import ControlPanel from '@/components/google-maps/control-panel';

import './style.css';
import { Map3DCameraProps } from '@/types/google-maps-3d-camera-props';
import { Chat } from '@/components/chat/Chat';

const INITIAL_VIEW_PROPS: Map3DCameraProps = {
  center: {lat: 43.69717100763474, lng: 7.25658566601723, altitude: 300},
  range: 5000,
  heading: 61,
  tilt: 69,
  roll: 0
};

const Map3DExample = () => {
  const [viewProps, setViewProps] = useState(INITIAL_VIEW_PROPS);

  const handleCameraChange = useCallback((ev: Map3DCameraChangedEvent) => {
    setViewProps(oldProps => ({...oldProps, ...ev.detail}));
  }, []);

  return (
    <>
      <Map3D
        {...viewProps}
        onCameraChanged={handleCameraChange}
        defaultLabelsDisabled
        mode="SATELLITE"
        style={{width: '100vw', height: '100vh'}}
      />

      <Chat isOpen={true} handleClose={() => {}} />
    </>
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
