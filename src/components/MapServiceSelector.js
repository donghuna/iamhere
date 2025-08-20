import React from 'react';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SelectLabel = styled.label`
  font-size: 14px;
  color: #495057;
  font-weight: 500;
`;

const ServiceSelect = styled.select`
  background: white;
  color: #495057;
  border: 2px solid #dee2e6;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 140px;
  
  &:hover {
    border-color: #adb5bd;
  }
  
  &:focus {
    outline: none;
    border-color: #495057;
    box-shadow: 0 0 0 2px rgba(73, 80, 87, 0.1);
  }
`;

const ServiceOption = styled.option`
  background: white;
  color: #495057;
  padding: 8px;
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
    background: ${props => {
      switch (props.$status) {
        case 'available': return '#28a745';
        case 'loading': return '#ffc107';
        case 'error': return '#dc3545';
        default: return '#adb5bd';
      }
    }};
    animation: ${props => props.$status === 'loading' ? 'pulse 1.5s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

function MapServiceSelector({ selectedService, onServiceChange, kakaoStatus, googleStatus }) {
  return (
    <SelectorContainer>
      <SelectLabel>지도 서비스:</SelectLabel>
      <ServiceSelect 
        value={selectedService} 
        onChange={(e) => onServiceChange(e.target.value)}
      >
        <ServiceOption value="google">
          🌍 구글맵
        </ServiceOption>
        <ServiceOption value="kakao">
          🗺️ 카카오맵
        </ServiceOption>
      </ServiceSelect>
      
      <StatusIndicator 
        $status={selectedService === 'kakao' ? kakaoStatus : googleStatus} 
      />
    </SelectorContainer>
  );
}

export default MapServiceSelector;
