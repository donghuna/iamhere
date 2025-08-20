import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LocationIcon = styled.span`
  font-size: 1.5rem;
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function Header({ onRefreshLocation, isLoading }) {
  return (
    <HeaderContainer>
      <Title>
        <LocationIcon>📍</LocationIcon>
        I'm Here
      </Title>
      <RefreshButton 
        onClick={onRefreshLocation} 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner />
            위치 확인 중...
          </>
        ) : (
          <>
            🔄
            위치 새로고침
          </>
        )}
      </RefreshButton>
    </HeaderContainer>
  );
}

export default Header;
