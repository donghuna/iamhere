# I'm Here - 위치 공유 서비스 🗺️

실시간 위치 추적과 하루동안의 이동 경로를 시각화하는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🎯 핵심 기능
- **실시간 위치 추적**: 30초마다 정확한 위치 기록
- **이동 경로 시각화**: 하루동안의 이동 경로를 지도에 표시
- **다중 지도 서비스**: 카카오맵과 구글맵 중 선택 가능
- **자동 서비스 전환**: 한 서비스 오류 시 자동으로 다른 서비스로 변경
- **위치 통계**: 총 이동 거리, 평균 속도, 활발한 시간대 분석

### 🗺️ 지도 서비스
- **카카오맵**: 한국 지도에 최적화, 무료 API
- **구글맵**: 글로벌 지도, 고품질 지도 데이터

### 📊 데이터 관리
- **하루 단위 기록**: 매일 자정에 자동 초기화
- **메모리 효율**: 최대 2880개 위치 기록 유지
- **정확도 정보**: GPS 정확도 데이터 포함

## 🚀 시작하기

### 필수 요구사항
- Node.js 14.0 이상
- npm 또는 yarn
- 위치 접근 권한 (브라우저)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/iamhere.git
cd iamhere
```

2. **의존성 설치**
```bash
npm install
```

3. **애플리케이션 실행**
```bash
npm start
```

4. **브라우저에서 열기**
```
http://localhost:3000
```

## ⚙️ 설정

### 카카오맵 설정
1. [카카오 개발자 센터](https://developers.kakao.com/)에서 앱 생성
2. JavaScript 키 발급
3. `public/index.html`에서 앱키 설정

### 구글맵 설정 (선택사항)
1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Maps JavaScript API 활성화
3. API 키 발급 및 `public/index.html`에 설정
4. 자세한 설정 방법은 [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) 참조

## 🎮 사용 방법

### 기본 사용법
1. **위치 권한 허용**: 브라우저에서 위치 접근 권한 허용
2. **자동 추적 시작**: 페이지 로드 시 자동으로 위치 추적 시작
3. **경로 확인**: 지도에 오늘의 이동 경로가 자동으로 표시
4. **통계 확인**: 우측 패널에서 이동 통계와 경로 정보 확인

### 지도 서비스 변경
1. **서비스 선택**: 지도 좌상단의 서비스 선택기 사용
2. **자동 전환**: 한 서비스 오류 시 자동으로 다른 서비스로 변경
3. **상태 확인**: 각 서비스의 로딩 상태와 가용성 실시간 모니터링

### 경로 제어
- **경로 표시/숨김**: 지도 우상단 버튼으로 경로 표시 제어
- **마커 클릭**: 각 지점 클릭 시 시간과 정확도 정보 확인
- **자동 줌**: 경로가 지도에 모두 보이도록 자동 조정

## 🏗️ 프로젝트 구조

```
src/
├── components/
│   ├── MapComponent.js          # 카카오맵 컴포넌트
│   ├── GoogleMapComponent.js    # 구글맵 컴포넌트
│   ├── MapServiceSelector.js    # 지도 서비스 선택기
│   ├── LocationTracker.js       # 위치 추적 컴포넌트
│   ├── LocationInfo.js          # 위치 정보 및 통계
│   └── Header.js                # 헤더 컴포넌트
├── App.js                       # 메인 앱 컴포넌트
└── index.js                     # 앱 진입점
```

## 🔧 기술 스택

- **Frontend**: React 18, Styled Components
- **지도 서비스**: 카카오맵 API, 구글맵 API
- **위치 추적**: Geolocation API
- **상태 관리**: React Hooks
- **빌드 도구**: Create React App

## 📱 브라우저 지원

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔒 개인정보 보호

- **로컬 저장**: 모든 위치 데이터는 브라우저 로컬에만 저장
- **외부 전송 없음**: 위치 데이터를 외부 서버로 전송하지 않음
- **자동 삭제**: 하루가 지나면 자동으로 위치 기록 삭제

## 🚨 알려진 이슈

- **모바일 브라우저**: 일부 모바일 브라우저에서 위치 정확도가 낮을 수 있음
- **네트워크 불안정**: 네트워크 상태에 따라 지도 로딩이 지연될 수 있음
- **API 제한**: 각 지도 서비스의 API 사용량 제한이 있을 수 있음

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있는 경우:
- [GitHub Issues](https://github.com/yourusername/iamhere/issues) 등록
- [GitHub Discussions](https://github.com/yourusername/iamhere/discussions) 참여

## 🙏 감사의 말

- [카카오맵 API](https://developers.kakao.com/docs/latest/ko/getting-started/sdk-js) - 한국 지도 서비스
- [구글맵 API](https://developers.google.com/maps) - 글로벌 지도 서비스
- [React](https://reactjs.org/) - 사용자 인터페이스 라이브러리

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!