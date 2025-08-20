import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TrackerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TrackerButton = styled.button`
  background: ${props => props.$isTracking 
    ? '#dc3545' 
    : '#495057'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isTracking ? '#c82333' : '#343a40'};
  }
  
  &:active {
    transform: none;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.$isTracking ? '#dc3545' : '#28a745'};
    animation: ${props => props.$isTracking ? 'pulse 1.5s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const InfoText = styled.div`
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
`;

function LocationTracker({ onLocationUpdate, isTracking, setIsTracking }) {
  const [lastLocation, setLastLocation] = useState(null);
  const [locationCount, setLocationCount] = useState(0);

  // 위치 추적 시작/중지
  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation이 지원되지 않습니다');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = new Date();
        
        const locationData = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          timestamp: timestamp
        };

        setLastLocation(locationData);
        setLocationCount(prev => prev + 1);
        
        // 부모 컴포넌트에 위치 업데이트 전달
        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }
      },
      (error) => {
        console.error('위치를 가져올 수 없습니다:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // 추적 상태가 변경될 때마다 위치 가져오기
  useEffect(() => {
    if (isTracking) {
      // 즉시 첫 번째 위치 가져오기
      getCurrentLocation();
      
      // 30초마다 위치 업데이트
      const interval = setInterval(getCurrentLocation, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isTracking]);

  return (
    <TrackerContainer>
      <TrackerButton $isTracking={isTracking} onClick={toggleTracking}>
        {isTracking ? '🛑 추적 중지' : '📍 위치 추적 시작'}
      </TrackerButton>
      
      <StatusIndicator $isTracking={isTracking}>
        {isTracking ? '실시간 추적 중' : '대기 중'}
      </StatusIndicator>
      
      <InfoText>
        📊 {isTracking ? `${locationCount}개 기록됨` : '30초마다 위치 기록'}
      </InfoText>
      
      {lastLocation && (
        <InfoText>
          🕐 마지막: {lastLocation.timestamp.toLocaleTimeString()}
        </InfoText>
      )}
    </TrackerContainer>
  );
}

export default LocationTracker;
