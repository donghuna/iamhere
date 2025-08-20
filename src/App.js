import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import MapComponent from './components/MapComponent';
import GoogleMapComponent from './components/GoogleMapComponent';
import LocationInfo from './components/LocationInfo';
import LocationTracker from './components/LocationTracker';
import MapServiceSelector from './components/MapServiceSelector';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa;
  overflow: hidden;
`;

const TopSection = styled.div`
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const MapSection = styled.div`
  flex: 1;
  position: relative;
  margin: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: white;
`;

const BottomSection = styled.div`
  padding: 20px;
  background: white;
  border-top: 1px solid #e9ecef;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
`;

const TopControls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const TestDataButton = styled.button`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BottomInfo = styled.div`
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
`;

function App() {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 37.2038,
    lng: 127.0909,
    address: '',
    timestamp: new Date()
  });
  const [isTracking, setIsTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [selectedMapService, setSelectedMapService] = useState('google'); // 'kakao' 또는 'google'
  const [kakaoStatus, setKakaoStatus] = useState('checking');
  const [googleStatus, setGoogleStatus] = useState('checking');

  // 지도 서비스 상태 모니터링
  useEffect(() => {
    const checkMapServices = () => {
      // 카카오맵 상태 확인
      if (window.kakao && window.kakao.maps && window.kakaoMapLoaded) {
        setKakaoStatus('available');
      } else if (window.kakaoMapError) {
        setKakaoStatus('error');
      } else {
        setKakaoStatus('loading');
      }

      // 구글맵 상태 확인
      if (window.google && window.google.maps && window.googleMapsLoaded) {
        setGoogleStatus('available');
      } else if (window.googleMapsError) {
        setGoogleStatus('error');
      } else {
        setGoogleStatus('loading');
      }
    };

    // 초기 상태 확인
    checkMapServices();

    // 주기적으로 상태 확인
    const interval = setInterval(checkMapServices, 1000);

    return () => clearInterval(interval);
  }, []);

  // 선택된 지도 서비스가 사용 불가능한 경우 자동으로 다른 서비스로 변경
  useEffect(() => {
    if (selectedMapService === 'kakao' && kakaoStatus === 'error') {
      if (googleStatus === 'available') {
        console.log('카카오맵 오류로 구글맵으로 자동 변경');
        setSelectedMapService('google');
      }
    } else if (selectedMapService === 'google' && googleStatus === 'error') {
      if (kakaoStatus === 'available') {
        console.log('구글맵 오류로 카카오맵으로 자동 변경');
        setSelectedMapService('kakao');
      }
    }
    
    // 구글맵이 사용 가능하면 자동으로 구글맵으로 변경 (우선순위)
    if (googleStatus === 'available' && selectedMapService === 'kakao') {
      console.log('구글맵 사용 가능, 자동으로 구글맵으로 변경');
      setSelectedMapService('google');
    }
  }, [selectedMapService, kakaoStatus, googleStatus]);

  // 초기 위치 추적 시작
  useEffect(() => {
    // 페이지 로드 시 자동으로 위치 추적 시작
    setIsTracking(true);
  }, []);

  // 하루가 지나면 위치 기록 초기화
  useEffect(() => {
    const checkNewDay = () => {
      const now = new Date();
      const today = now.toDateString();
      
      if (locationHistory.length > 0) {
        const firstLocation = locationHistory[0];
        const firstDate = firstLocation.timestamp.toDateString();
        
        if (today !== firstDate) {
          console.log('새로운 하루가 시작되어 위치 기록을 초기화합니다.');
          setLocationHistory([]);
        }
      }
    };

    // 매일 자정에 체크
    const interval = setInterval(checkNewDay, 60000); // 1분마다 체크
    checkNewDay(); // 초기 체크

    return () => clearInterval(interval);
  }, [locationHistory]);

  // 위치 기록 업데이트
  const handleLocationUpdate = (locationData) => {
    // 현재 위치도 업데이트
    setCurrentLocation(prev => ({
      ...prev,
      lat: locationData.lat,
      lng: locationData.lng,
      timestamp: locationData.timestamp
    }));

    setLocationHistory(prev => {
      const newHistory = [...prev, locationData];
      
      // 하루치 기록만 유지 (최대 2880개 - 30초마다 24시간)
      if (newHistory.length > 2880) {
        return newHistory.slice(-2880);
      }
      
      return newHistory;
    });
  };

  // 테스트 데이터 생성 함수
  const generateTestData = () => {
    const testData = [];
    const baseLat = 37.2038; // 기본 위도
    const baseLng = 127.0909; // 기본 경도
    const now = new Date();
    
    // 시작점 설정
    let currentLat = baseLat;
    let currentLng = baseLng;
    
    // 20개의 테스트 위치 데이터 생성 (실제 이동 경로 시뮬레이션)
    for (let i = 0; i < 20; i++) {
      const timestamp = new Date(now.getTime() - (19 - i) * 30 * 60 * 1000); // 30분씩 차이나게
      
      // 이전 위치에서 약간씩 이동 (연속된 경로 생성)
      const latChange = (Math.random() - 0.5) * 0.002; // ±0.001도 범위
      const lngChange = (Math.random() - 0.5) * 0.002; // ±0.001도 범위
      
      currentLat += latChange;
      currentLng += lngChange;
      
      testData.push({
        lat: parseFloat(currentLat.toFixed(6)),
        lng: parseFloat(currentLng.toFixed(6)),
        accuracy: Math.random() * 10 + 5, // 5-15m 정확도
        timestamp: timestamp
      });
    }
    
    // 시간순으로 정렬
    testData.sort((a, b) => a.timestamp - b.timestamp);
    
    // 위치 기록에 추가
    setLocationHistory(testData);
    
    // 마지막 위치를 현재 위치로 설정
    if (testData.length > 0) {
      const lastLocation = testData[testData.length - 1];
      setCurrentLocation(prev => ({
        ...prev,
        lat: lastLocation.lat,
        lng: lastLocation.lng,
        timestamp: lastLocation.timestamp
      }));
    }
    
    console.log('테스트 데이터가 생성되었습니다:', testData);
    console.log('총 이동 거리:', calculateTotalDistance(testData), 'km');
  };

  // 총 거리 계산 함수 (테스트용)
  const calculateTotalDistance = (locations) => {
    if (locations.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      
      const R = 6371; // 지구 반지름 (km)
      const dLat = (curr.lat - prev.lat) * Math.PI / 180;
      const dLon = (curr.lng - prev.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(prev.lat * Math.PI / 180) * Math.cos(curr.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      totalDistance += R * c;
    }
    
    return totalDistance;
  };

  // 시놀로지 NAS DB에서 위치 정보 가져오기 (향후 구현 예정)
  useEffect(() => {
    // TODO: 시놀로지 NAS DB에서 위치 정보를 가져오는 로직 구현
    // 현재는 기본값 사용
    console.log('시놀로지 NAS DB에서 위치 정보를 가져오는 기능은 향후 구현 예정입니다.');
  }, []);

  return (
    <AppContainer>
      <TopSection>
        <TopControls>
          <MapServiceSelector
            selectedService={selectedMapService}
            onServiceChange={setSelectedMapService}
            kakaoStatus={kakaoStatus}
            googleStatus={googleStatus}
          />
          <TestDataButton onClick={generateTestData}>
            🧪 테스트 데이터 생성 (20개)
          </TestDataButton>
        </TopControls>
      </TopSection>
      <MapSection>
        {/* 선택된 지도 서비스에 따라 컴포넌트 렌더링 */}
        {selectedMapService === 'google' ? (
          <GoogleMapComponent 
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
            locationHistory={locationHistory}
            isTracking={isTracking}
            setIsTracking={setIsTracking}
            onLocationUpdate={handleLocationUpdate}
          />
        ) : (
          <MapComponent 
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
            locationHistory={locationHistory}
            isTracking={isTracking}
            setIsTracking={setIsTracking}
            onLocationUpdate={handleLocationUpdate}
          />
        )}
      </MapSection>
      <BottomSection>
        <BottomInfo>
          <LocationInfo 
            currentLocation={currentLocation}
            locationHistory={locationHistory}
          />
        </BottomInfo>
      </BottomSection>
    </AppContainer>
  );
}

export default App;
