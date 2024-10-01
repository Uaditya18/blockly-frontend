import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';

const Map = () => {
    const [coordinates, setCoordinates] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const mapRef = useRef(null);
    const intervalRef = useRef(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        const loadRoute = async () => {
            try {
                const response = await fetch('https://blockly-backend-production.up.railway.app/api/route');  // Use the proxy path
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setCoordinates(data.coordinates);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        };

        loadRoute();
    }, []);

    useEffect(() => {
        if (coordinates.length > 0) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    if (prevIndex < coordinates.length - 1) {
                        return prevIndex + 1;
                    } else {
                        clearInterval(intervalRef.current);
                        return prevIndex;
                    }
                });
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [coordinates]);

    useEffect(() => {
        if (mapRef.current && coordinates[currentIndex]) {
            mapRef.current.panTo(coordinates[currentIndex]);
            mapRef.current.setZoom(14);
        }
    }, [currentIndex, coordinates]);

    const center = coordinates.length > 0 ? coordinates[0] : { lat: 22.9737, lng: 72.5879 };

    return isLoaded ? (
        <GoogleMap
            center={center}
            zoom={14}
            mapContainerStyle={{ height: '500px', width: '100%' }}
            onLoad={(map) => (mapRef.current = map)}
        >
            {coordinates.length > 0 && (
                <Polyline
                    path={coordinates.slice(0, currentIndex + 1)}
                    geodesic={true}
                    options={{
                        strokeColor: '#FF0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 2,
                    }}
                />
            )}

            {coordinates.length > 0 && (
                <Marker
                    position={coordinates[currentIndex]}
                    title="Current Position"
                   icon={{
                        url: 'https://img.icons8.com/ios-filled/50/000000/car.png',
                        scaledSize: new window.google.maps.Size(32, 32),
                        origin: new window.google.maps.Point(0, 0),
                        anchor: new window.google.maps.Point(16, 32),
                    }}
                />
            )}
        </GoogleMap>
    ) : (
        <div>Loading...</div>
    );
};

export default Map;
