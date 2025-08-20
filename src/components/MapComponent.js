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

const LocationMarker = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
`;

const MarkerIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #495057;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    50% {
      transform: scale(1.1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  }
`;

function MapComponent({ currentLocation, setCurrentLocation, locationHistory = [], isTracking, setIsTracking, onLocationUpdate }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [pathPolyline, setPathPolyline] = useState(null);
  const [historyMarkers, setHistoryMarkers] = useState([]);
  const [showPath, setShowPath] = useState(true);

  // 좌표를 주소로 변환하는 함수
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
        {
          headers: {
            'Authorization': `KakaoAK e02777961eea49050199a6e358812376`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('주소 변환에 실패했습니다');
      }
      
      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        const address = data.documents[0].address;
        return `${address.address_name}`;
      }
      
      return '주소를 찾을 수 없습니다';
    } catch (error) {
      console.error('주소 변환 오류:', error);
      return '주소 변환 중 오류가 발생했습니다';
    }
  };

  // 카카오맵 SDK 로딩 확인
  const waitForKakaoMap = () => {
    return new Promise((resolve, reject) => {
      console.log('카카오맵 SDK 로딩 상태 확인 중...');
      
      // 이미 로드된 경우
      if (window.kakao && window.kakao.maps && window.kakaoMapLoaded) {
        console.log('카카오맵 SDK가 이미 로드되어 있습니다.');
        resolve();
        return;
      }
      
      // 로딩 대기 (최대 10초)
      console.log('카카오맵 SDK 로딩 대기 중...');
      let attempts = 0;
      const maxAttempts = 100; // 10초
      
      const checkKakaoMap = () => {
        attempts++;
        console.log(`카카오맵 SDK 확인 시도 ${attempts}/${maxAttempts}`);
        
        if (window.kakao && window.kakao.maps && window.kakaoMapLoaded) {
          console.log('카카오맵 SDK 로딩 완료!');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('카카오맵 SDK 로딩 시간 초과!');
          reject(new Error('카카오맵 SDK 로딩 시간 초과'));
        } else {
          console.log('카카오맵 SDK 아직 로딩 중... 재시도');
          setTimeout(checkKakaoMap, 100);
        }
      };
      checkKakaoMap();
    });
  };

  // 지도 초기화
  useEffect(() => {
    const initializeMap = async () => {
      try {
        console.log('지도 초기화 시작...');
        
        // 카카오맵 SDK가 로드될 때까지 대기
        await waitForKakaoMap();
        
        console.log('카카오맵 로딩 완료, 지도 생성 시작...');
        
        // 이미 로드된 상태이므로 직접 지도 생성
        if (!mapRef.current) {
          console.error('지도 컨테이너 요소를 찾을 수 없습니다.');
          return;
        }

        try {
          console.log('지도 옵션 설정 중...');
          const options = {
            center: new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng),
            level: 3
          };

          console.log('카카오맵 인스턴스 생성 중...');
          mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, options);

          console.log('마커 생성 중...');
          // 마커 생성
          const markerPosition = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
          
          markerRef.current = new window.kakao.maps.Marker({
            position: markerPosition,
            map: mapInstanceRef.current
          });

          console.log('마커만 생성 (인포윈도우 없음)');
          // 인포윈도우는 생성하지 않음
          
          setIsMapLoaded(true);
          console.log('카카오맵이 성공적으로 초기화되었습니다.');
          
        } catch (mapError) {
          console.error('지도 생성 중 오류:', mapError);
          console.error('지도 생성 에러 상세 정보:', {
            message: mapError.message,
            stack: mapError.stack,
            kakaoLoaded: !!window.kakao,
            mapsLoaded: !!(window.kakao && window.kakao.maps),
            mapRefExists: !!mapRef.current
          });
        }

      } catch (error) {
        console.error('카카오맵 초기화 오류:', error);
        console.error('에러 상세 정보:', {
          message: error.message,
          stack: error.stack,
          kakaoLoaded: !!window.kakao,
          mapsLoaded: !!(window.kakao && window.kakao.maps),
          mapRefExists: !!mapRef.current
        });
        
        // SDK 로딩 실패 시 사용자에게 알림
        if (error.message.includes('시간 초과')) {
          console.error('카카오맵 SDK 로딩에 실패했습니다. 네트워크 연결과 앱키를 확인해주세요.');
        }
      }
    };

    initializeMap();
  }, []);

  // 위치가 변경될 때마다 지도와 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const newPosition = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
    
    // 지도 중심 이동
    mapInstanceRef.current.panTo(newPosition);
    
    // 마커 위치 업데이트
    markerRef.current.setPosition(newPosition);

            // 주소 가져오기 (인포윈도우는 표시하지 않음)
        if (currentLocation.lat && currentLocation.lng) {
          getAddressFromCoords(currentLocation.lat, currentLocation.lng)
            .then(address => {
              setCurrentLocation(prev => ({ ...prev, address }));
            });
        }

  }, [currentLocation.lat, currentLocation.lng]);

  // 경로 그리기 함수
  const drawPath = useCallback(() => {
    console.log('경로 그리기 시작:', {
      mapLoaded: !!mapInstanceRef.current,
      kakaoLoaded: !!(window.kakao && window.kakao.maps),
      showPath,
      historyLength: locationHistory.length
    });

    if (!mapInstanceRef.current || !window.kakao || !window.kakao.maps || !showPath) {
      console.log('경로 그리기 조건 불충족');
      return;
    }

    // 기존 경로 제거
    if (pathPolyline) {
      pathPolyline.setMap(null);
    }

    // 기존 마커들 제거
    historyMarkers.forEach(marker => marker.setMap(null));

    if (locationHistory.length < 2) {
      console.log('위치 기록이 부족합니다:', locationHistory.length);
      return;
    }

    console.log('경로 그리기 진행 중...', locationHistory.length, '개 위치');

    // 경로 좌표 생성
    const pathCoordinates = locationHistory.map(loc => 
      new window.kakao.maps.LatLng(loc.lat, loc.lng)
    );

    // 경로 그리기
    const polyline = new window.kakao.maps.Polyline({
      path: pathCoordinates,
      strokeWeight: 5,
      strokeColor: '#FF6B6B',
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    });

    polyline.setMap(mapInstanceRef.current);
    setPathPolyline(polyline);

    // 시작점과 끝점에 특별한 마커 추가
    const startMarker = new window.kakao.maps.Marker({
      position: pathCoordinates[0],
      map: mapInstanceRef.current,
      icon: new window.kakao.maps.MarkerImage(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiM0Q0FGNTAiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDE5LjUyIDQuNDggMjIgOCAyMkMxMS41MiAyMiAxNCAxOS41MiAxNCAxNkMxNCAxMC40OCAxMS41MiA2IDggNlYyQzEyIDIgMTYgNiAxNiAxMEMxNiAxNCAxMiAxOCAxMiAyMkMxMiAyNiA4IDMwIDQgMzBWMjZDNiAyNiA4IDI0IDggMjJDNCAyMiAwIDE4IDAgMTRDMCAxMCA0IDYgOCA2VjJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
        new window.kakao.maps.Size(24, 24)
      )
    });

    const endMarker = new window.kakao.maps.Marker({
      position: pathCoordinates[pathCoordinates.length - 1],
      map: mapInstanceRef.current,
      icon: new window.kakao.maps.MarkerImage(
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiNGNDQzMzYiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDE5LjUyIDQuNDggMjIgOCAyMkMxMS41MiAyMiAxNCAxOS41MiAxNCAxNkMxNCAxMC40OCAxMS41MiA2IDggNlYyQzEyIDIgMTYgNiAxNiAxMEMxNiAxNCAxMiAxOCAxMiAyMkMxMiAyNiA4IDMwIDQgMzBWMjZDNiAyNiA4IDI0IDggMjJDNCAyMiAwIDE4IDAgMTRDMCAxMCA0IDYgOCA2VjJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
        new window.kakao.maps.Size(24, 24)
      )
    });

    // 중간 지점들에 작은 마커 추가
    const middleMarkers = locationHistory.slice(1, -1).map((loc, index) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(loc.lat, loc.lng),
        map: mapInstanceRef.current,
        icon: new window.kakao.maps.MarkerImage(
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQiIGZpbGw9IiMyMTk2RjMiLz4KPC9zdmc+',
          new window.kakao.maps.Size(12, 12)
        )
      });

      // 마커 클릭 시 시간 정보 표시
      const infoContent = `
        <div style="padding: 8px; text-align: center; font-size: 12px;">
          <div style="font-weight: bold; margin-bottom: 4px;">📍 경유지 ${index + 1}</div>
          <div>시간: ${loc.timestamp.toLocaleTimeString()}</div>
          <div>정확도: ${Math.round(loc.accuracy)}m</div>
        </div>
      `;

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: infoContent,
        position: new window.kakao.maps.LatLng(loc.lat, loc.lng)
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      return marker;
    });

    setHistoryMarkers([startMarker, endMarker, ...middleMarkers]);

         // 시작점과 끝점에 인포윈도우는 생성하지만 자동으로 열지 않음 (클릭 시에만 표시)
     const startInfo = new window.kakao.maps.InfoWindow({
       content: `
         <div style="padding: 8px; text-align: center; font-size: 12px;">
           <div style="font-weight: bold; margin-bottom: 4px;">🚀 시작점</div>
           <div>시간: ${locationHistory[0].timestamp.toLocaleTimeString()}</div>
           <div>정확도: ${Math.round(locationHistory[0].accuracy)}m</div>
         </div>
       `,
       position: pathCoordinates[0]
     });

     const endInfo = new window.kakao.maps.InfoWindow({
       content: `
         <div style="padding: 8px; text-align: center; font-size: 12px;">
           <div style="font-weight: bold; margin-bottom: 4px;">🎯 도착점</div>
           <div>시간: ${locationHistory[locationHistory.length - 1].timestamp.toLocaleTimeString()}</div>
           <div>정확도: ${Math.round(locationHistory[locationHistory.length - 1].accuracy)}m</div>
         </div>
       `,
       position: pathCoordinates[pathCoordinates.length - 1]
     });

     // 시작점과 끝점 마커 클릭 시에만 인포윈도우 표시
     startMarker.addListener('click', () => {
       startInfo.open(mapInstanceRef.current, startMarker);
     });

     endMarker.addListener('click', () => {
       endInfo.open(mapInstanceRef.current, endMarker);
     });

    // 경로가 지도에 모두 보이도록 조정
    const bounds = new window.kakao.maps.LatLngBounds();
    pathCoordinates.forEach(coord => bounds.extend(coord));
    mapInstanceRef.current.setBounds(bounds);

    console.log('경로 그리기 완료:', {
      경로_좌표_수: pathCoordinates.length,
      시작점: `${pathCoordinates[0].getLat()}, ${pathCoordinates[0].getLng()}`,
      끝점: `${pathCoordinates[pathCoordinates.length - 1].getLat()}, ${pathCoordinates[pathCoordinates.length - 1].getLng()}`,
      마커_수: historyMarkers.length
    });

  }, [locationHistory, pathPolyline, historyMarkers, showPath]);

  // 위치 기록이 변경될 때마다 경로 다시 그리기
  useEffect(() => {
    if (isMapLoaded && locationHistory.length > 0) {
      drawPath();
    }
  }, [locationHistory, isMapLoaded, drawPath]);

  // 경로 표시/숨김 토글
  const togglePath = () => {
    setShowPath(!showPath);
    
    if (pathPolyline) {
      pathPolyline.setMap(showPath ? null : mapInstanceRef.current);
    }
    
    historyMarkers.forEach(marker => {
      marker.setMap(showPath ? null : mapInstanceRef.current);
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
        <PathToggleButton
          $showPath={showPath}
          onClick={togglePath}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          }}
        >
          {showPath ? '🛤️ 경로 숨기기' : '🛤️ 경로 표시'}
        </PathToggleButton>
      )}
      
      {!isMapLoaded && (
        <LoadingOverlay>
          <LoadingText>🗺️ 지도를 불러오는 중...</LoadingText>
          <LoadingSubtext>
            카카오맵 SDK를 확인하고 있습니다
          </LoadingSubtext>
        </LoadingOverlay>
      )}
      
      <LocationMarker>
        <MarkerIcon>📍</MarkerIcon>
      </LocationMarker>
    </MapContainer>
  );
}

export default MapComponent;
