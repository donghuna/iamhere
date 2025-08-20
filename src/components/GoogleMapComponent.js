import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import LocationTracker from './LocationTracker';

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const MapElement = styled.div`
  width: 100%;
  height: 100%;
`;

const PathToggleButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1002;
  background: ${props => props.$showPath ? '#28a745' : '#6c757d'};
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$showPath ? '#218838' : '#5a6268'};
  }
`;

const TrackerOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1002;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px 32px;
  border-radius: 8px;
  text-align: center;
  z-index: 1001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
`;

const LoadingText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #212529;
  margin-bottom: 8px;
`;

const LoadingSubtext = styled.div`
  font-size: 14px;
  color: #6c757d;
`;

function GoogleMapComponent({ currentLocation, setCurrentLocation, locationHistory = [], isTracking, setIsTracking, onLocationUpdate }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showPath, setShowPath] = useState(true);
  const [pathPolyline, setPathPolyline] = useState(null);
  const [markers, setMarkers] = useState([]);

  // 구글맵 SDK 로딩 확인
  const waitForGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      console.log('구글맵 SDK 로딩 상태 확인 중...');
      console.log('window.google:', window.google);
      console.log('window.google?.maps:', window.google?.maps);
      
      if (window.google && window.google.maps) {
        console.log('구글맵 SDK가 이미 로드되어 있습니다.');
        resolve();
        return;
      }
      
      // 로딩 대기 (최대 10초)
      console.log('구글맵 SDK 로딩 대기 중...');
      let attempts = 0;
      const maxAttempts = 100; // 10초
      
      const checkGoogleMaps = () => {
        attempts++;
        console.log(`구글맵 SDK 확인 시도 ${attempts}/${maxAttempts}`);
        
        if (window.google && window.google.maps) {
          console.log('구글맵 SDK 로딩 완료!');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('구글맵 SDK 로딩 시간 초과!');
          reject(new Error('구글맵 SDK 로딩 시간 초과'));
        } else {
          console.log('구글맵 SDK 아직 로딩 중... 재시도');
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
    });
  };

  // 지도 초기화
  useEffect(() => {
    const initializeMap = async () => {
      try {
        console.log('구글맵 초기화 시작...');
        
        // 구글맵 SDK가 로드될 때까지 대기
        await waitForGoogleMaps();
        
        console.log('구글맵 로딩 완료, 지도 생성 시작...');
        
        if (!mapRef.current) {
          console.error('지도 컨테이너 요소를 찾을 수 없습니다.');
          return;
        }

        try {
          console.log('지도 옵션 설정 중...');
          const options = {
            center: { lat: currentLocation.lat, lng: currentLocation.lng },
            zoom: 16,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            // 현재 위치 버튼 활성화
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          };

          console.log('구글맵 인스턴스 생성 중...');
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, options);

                    // 현재 위치 마커 생성 (기본 Marker 사용 - 더 안정적)
          currentMarkerRef.current = new window.google.maps.Marker({
            position: { lat: currentLocation.lat, lng: currentLocation.lng },
            map: mapInstanceRef.current,
            title: '현재 위치',
            icon: {
              url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmZjQ3NTciLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
              scaledSize: new window.google.maps.Size(40, 40)
            },
            zIndex: 1000
          });

          // 현재 위치 인포윈도우는 생성하지 않음 (마커만 표시)
          
          // 마커 생성 확인 로그
          console.log('현재 위치 마커 생성 완료:', {
            position: { lat: currentLocation.lat, lng: currentLocation.lng },
            marker: currentMarkerRef.current,
            map: mapInstanceRef.current
          });
          
          setIsMapLoaded(true);
          console.log('구글맵이 성공적으로 초기화되었습니다.');
          
        } catch (mapError) {
          console.error('지도 생성 중 오류:', mapError);
        }

      } catch (error) {
        console.error('구글맵 초기화 오류:', error);
      }
    };

    initializeMap();
  }, []);

  // 경로 그리기 함수 (현재 위치만 표시)
  const drawPath = useCallback(() => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps || !showPath) return;

    // 기존 경로 제거
    if (pathPolyline) {
      pathPolyline.setMap(null);
    }

    // 기존 마커들 제거
    markers.forEach(marker => marker.setMap(null));

    if (locationHistory.length < 2) return;

    // 경로 좌표 생성
    const pathCoordinates = locationHistory.map(loc => ({
      lat: loc.lat,
      lng: loc.lng
    }));

    // 경로 그리기 (선만 표시)
    const polyline = new window.google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#FF6B6B',
      strokeOpacity: 0.8,
      strokeWeight: 5
    });

    polyline.setMap(mapInstanceRef.current);
    setPathPolyline(polyline);

    // 마커는 생성하지 않음 (현재 위치 마커만 유지)
    setMarkers([]);

    // 경로가 지도에 모두 보이도록 조정
    const bounds = new window.google.maps.LatLngBounds();
    pathCoordinates.forEach(coord => bounds.extend(coord));
    mapInstanceRef.current.fitBounds(bounds);

  }, [locationHistory, pathPolyline, markers, showPath]);

  // 현재 위치가 변경될 때마다 마커와 지도 중심 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && currentMarkerRef.current && currentLocation.lat && currentLocation.lng) {
      const newPosition = { lat: currentLocation.lat, lng: currentLocation.lng };
      
      // 마커 위치 업데이트
      currentMarkerRef.current.setPosition(newPosition);
      
      // 지도 중심을 현재 위치로 이동
      mapInstanceRef.current.panTo(newPosition);
      
      console.log('현재 위치 마커 업데이트:', newPosition);
    }
  }, [currentLocation.lat, currentLocation.lng]);

  // 위치 기록이 변경될 때마다 경로 다시 그리기
  useEffect(() => {
    if (isMapLoaded && locationHistory.length > 0) {
      drawPath();
    }
  }, [locationHistory, isMapLoaded, drawPath]);

  // 경로 표시/숨김 토글
  const togglePath = () => {
    const newShowPath = !showPath;
    setShowPath(newShowPath);
    
    if (pathPolyline) {
      pathPolyline.setMap(newShowPath ? mapInstanceRef.current : null);
    }
    
    markers.forEach(marker => {
      marker.setMap(newShowPath ? mapInstanceRef.current : null);
    });
  };

  return (
    <MapContainer>
      <MapElement ref={mapRef} />
      
      {/* 위치 추적 오버레이 */}
      <TrackerOverlay>
        <LocationTracker 
          onLocationUpdate={onLocationUpdate}
          isTracking={isTracking}
          setIsTracking={setIsTracking}
        />
      </TrackerOverlay>
      
      {/* 경로 표시 토글 버튼 */}
      {isMapLoaded && locationHistory.length > 1 && (
        <PathToggleButton $showPath={showPath} onClick={togglePath}>
          {showPath ? '🛤️ 경로 숨기기' : '🛤️ 경로 표시'}
        </PathToggleButton>
      )}
      
      {!isMapLoaded && (
        <LoadingOverlay>
          <LoadingText>🗺️ 구글맵을 불러오는 중...</LoadingText>
          <LoadingSubtext>
            구글맵 SDK를 확인하고 있습니다
          </LoadingSubtext>
        </LoadingOverlay>
      )}
      
    </MapContainer>
  );
}

export default GoogleMapComponent;
