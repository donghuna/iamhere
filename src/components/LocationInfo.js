import React from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const InfoCard = styled.div`
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #dee2e6;
  min-width: 140px;
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #212529;
`;

const CoordinatesCard = styled.div`
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #dee2e6;
  min-width: 200px;
  text-align: center;
`;

const CoordinateRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CoordinateLabel = styled.span`
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CoordinateValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  font-family: 'Courier New', monospace;
`;

const TimeInfoCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  text-align: center;
`;

const TimeInfoLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TimeInfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
`;

const TimeInfoSubValue = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
`;

function LocationInfo({ currentLocation, locationHistory }) {
  // 총 거리 계산 (Haversine 공식)
  const calculateTotalDistance = () => {
    if (locationHistory.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < locationHistory.length; i++) {
      const prev = locationHistory[i - 1];
      const curr = locationHistory[i];
      
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

  // 평균 속도 계산 (km/h)
  const calculateAverageSpeed = () => {
    if (locationHistory.length < 2) return 0;
    
    const totalDistance = calculateTotalDistance();
    const firstTime = locationHistory[0].timestamp;
    const lastTime = locationHistory[locationHistory.length - 1].timestamp;
    const totalHours = (lastTime - firstTime) / (1000 * 60 * 60);
    
    return totalHours > 0 ? totalDistance / totalHours : 0;
  };

  // 가장 활발한 시간대 찾기
  const findMostActiveHour = () => {
    if (locationHistory.length === 0) return 'N/A';
    
    const hourCounts = new Array(24).fill(0);
    locationHistory.forEach(loc => {
      const hour = loc.timestamp.getHours();
      hourCounts[hour]++;
    });
    
    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    return `${maxHour.toString().padStart(2, '0')}:00`;
  };

  // 현재 위치의 시간대 정보 가져오기
  const getCurrentTimeInfo = () => {
    if (!currentLocation?.timestamp) return null;
    
    const now = new Date();
    const locationTime = new Date(currentLocation.timestamp);
    
    // 한국 시간대로 변환 (UTC+9)
    const koreaTime = new Date(locationTime.getTime() + (9 * 60 * 60 * 1000));
    
    // 시간대 정보
    const hour = koreaTime.getHours();
    let timeOfDay = '';
    let emoji = '';
    
    if (hour >= 5 && hour < 12) {
      timeOfDay = '아침';
      emoji = '🌅';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = '오후';
      emoji = '☀️';
    } else if (hour >= 17 && hour < 20) {
      timeOfDay = '저녁';
      emoji = '🌆';
    } else {
      timeOfDay = '밤';
      emoji = '🌙';
    }
    
    return {
      date: koreaTime.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      time: koreaTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      timeOfDay: `${emoji} ${timeOfDay}`,
      timezone: 'KST (UTC+9)'
    };
  };

  // 위치 기록이 없을 때의 기본값
  if (locationHistory.length === 0) {
    const timeInfo = getCurrentTimeInfo();
    
    return (
      <InfoContainer>
        <InfoCard>
          <InfoLabel>📍 기록된 위치</InfoLabel>
          <InfoValue>0개</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>📏 총 거리</InfoLabel>
          <InfoValue>0.00km</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>🚀 평균 속도</InfoLabel>
          <InfoValue>0.0km/h</InfoValue>
        </InfoCard>
        
        <InfoCard>
          <InfoLabel>⏰ 활발한 시간</InfoLabel>
          <InfoValue>N/A</InfoValue>
        </InfoCard>

        <CoordinatesCard>
          <InfoLabel>🌍 현재 좌표</InfoLabel>
          <CoordinateRow>
            <CoordinateLabel>위도:</CoordinateLabel>
            <CoordinateValue>{currentLocation?.lat?.toFixed(6) || '0.000000'}</CoordinateValue>
          </CoordinateRow>
          <CoordinateRow>
            <CoordinateLabel>경도:</CoordinateLabel>
            <CoordinateValue>{currentLocation?.lng?.toFixed(6) || '0.000000'}</CoordinateValue>
          </CoordinateRow>
        </CoordinatesCard>

        {timeInfo && (
          <TimeInfoCard>
            <TimeInfoLabel>🕐 위치 기록 시간</TimeInfoLabel>
            <TimeInfoValue>{timeInfo.date}</TimeInfoValue>
            <TimeInfoValue>{timeInfo.time}</TimeInfoValue>
            <TimeInfoSubValue>{timeInfo.timeOfDay}</TimeInfoSubValue>
            <TimeInfoSubValue>{timeInfo.timezone}</TimeInfoSubValue>
          </TimeInfoCard>
        )}
      </InfoContainer>
    );
  }

  return (
    <InfoContainer>
      <InfoCard>
        <InfoLabel>📍 기록된 위치</InfoLabel>
        <InfoValue>{locationHistory.length}개</InfoValue>
      </InfoCard>
      
      <InfoCard>
        <InfoLabel>📏 총 거리</InfoLabel>
        <InfoValue>{calculateTotalDistance().toFixed(2)}km</InfoValue>
      </InfoCard>
      
      <InfoCard>
        <InfoLabel>🚀 평균 속도</InfoLabel>
        <InfoValue>{calculateAverageSpeed().toFixed(1)}km/h</InfoValue>
      </InfoCard>
      
      <InfoCard>
        <InfoLabel>⏰ 활발한 시간</InfoLabel>
        <InfoValue>{findMostActiveHour()}</InfoValue>
      </InfoCard>

      <CoordinatesCard>
        <InfoLabel>🌍 현재 좌표</InfoLabel>
        <CoordinateRow>
          <CoordinateLabel>위도:</CoordinateLabel>
          <CoordinateValue>{currentLocation?.lat?.toFixed(6) || '0.000000'}</CoordinateValue>
        </CoordinateRow>
        <CoordinateRow>
          <CoordinateLabel>경도:</CoordinateLabel>
          <CoordinateValue>{currentLocation?.lng?.toFixed(6) || '0.000000'}</CoordinateValue>
        </CoordinateRow>
      </CoordinatesCard>

      {getCurrentTimeInfo() && (
        <TimeInfoCard>
          <TimeInfoLabel>🕐 위치 기록 시간</TimeInfoLabel>
          <TimeInfoValue>{getCurrentTimeInfo().date}</TimeInfoValue>
          <TimeInfoValue>{getCurrentTimeInfo().time}</TimeInfoValue>
          <TimeInfoSubValue>{getCurrentTimeInfo().timeOfDay}</TimeInfoSubValue>
          <TimeInfoSubValue>{getCurrentTimeInfo().timezone}</TimeInfoSubValue>
        </TimeInfoCard>
      )}
    </InfoContainer>
  );
}

export default LocationInfo;
