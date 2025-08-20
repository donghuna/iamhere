# 구글맵 API 키 설정 가이드

## 🚀 구글맵 API 키 발급 방법

### 1. Google Cloud Console 접속
- [Google Cloud Console](https://console.cloud.google.com/)에 접속
- Google 계정으로 로그인

### 2. 프로젝트 생성 또는 선택
- 새 프로젝트 생성 또는 기존 프로젝트 선택
- 프로젝트 이름: `iamhere-maps` (권장)

### 3. Maps JavaScript API 활성화
- 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 선택
- "Maps JavaScript API" 검색 후 클릭
- "사용" 버튼 클릭하여 API 활성화

### 4. 사용자 인증 정보 생성
- 왼쪽 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 선택
- "사용자 인증 정보 만들기" > "API 키" 클릭
- API 키가 생성됨

### 5. API 키 제한 설정 (보안 권장)
- 생성된 API 키 클릭
- "애플리케이션 제한사항"에서 "HTTP 리퍼러(웹사이트)" 선택
- "웹사이트 제한사항"에 다음 도메인 추가:
  - `localhost`
  - `127.0.0.1`
  - 실제 배포 도메인 (예: `yourdomain.com`)

### 6. API 키를 코드에 적용
`public/index.html` 파일에서 다음 줄을 찾아 API 키를 교체:

```html
<!-- 구글맵 SDK -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry"></script>
```

`YOUR_GOOGLE_MAPS_API_KEY`를 실제 발급받은 API 키로 교체:

```html
<!-- 구글맵 SDK -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&libraries=geometry"></script>
```

## 🔑 API 키 보안 주의사항

### ❌ 하지 말아야 할 것들
- API 키를 공개 저장소에 커밋하지 마세요
- API 키를 클라이언트 사이드 코드에 하드코딩하지 마세요
- API 키를 공개적으로 공유하지 마세요

### ✅ 권장 보안 방법
- 환경 변수 사용
- API 키 제한 설정 (도메인, IP 제한)
- 정기적인 API 키 순환
- 사용량 모니터링 설정

## 💰 비용 정보

### Maps JavaScript API 요금
- **무료 할당량**: 월 28,500회 로드
- **초과 요금**: $7.00 per 1,000 additional loads
- **예상 월 비용**: 일반적인 사용 시 월 $0-10

### 비용 최적화 팁
- 불필요한 지도 로드 방지
- 사용량 모니터링 설정
- 적절한 줌 레벨 사용

## 🛠️ 문제 해결

### 일반적인 오류들

#### 1. "Google Maps JavaScript API error: RefererNotAllowedMapError"
- API 키의 도메인 제한 확인
- localhost가 허용되어 있는지 확인

#### 2. "Google Maps JavaScript API error: ApiNotActivatedMapError"
- Maps JavaScript API가 활성화되어 있는지 확인
- 프로젝트에서 API 상태 확인

#### 3. "Google Maps JavaScript API error: OverQuotaMapError"
- API 할당량 초과
- 사용량 대시보드에서 확인

### 디버깅 방법
1. 브라우저 개발자 도구 콘솔 확인
2. 네트워크 탭에서 API 요청 상태 확인
3. Google Cloud Console에서 API 사용량 확인

## 📱 추가 기능

### 지원되는 지도 타입
- Roadmap (기본)
- Satellite
- Hybrid
- Terrain

### 추가 라이브러리
- Geometry (거리 계산, 경로 그리기)
- Places (장소 검색)
- Geocoding (주소 변환)

## 🔄 카카오맵과 구글맵 비교

| 기능 | 카카오맵 | 구글맵 |
|------|----------|--------|
| 한국 지도 정확도 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 글로벌 지도 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| API 제한 | 하루 300,000회 | 월 28,500회 |
| 비용 | 무료 | 초과 시 유료 |
| 한국어 지원 | 완벽 | 양호 |

## 📞 지원

문제가 발생하거나 추가 도움이 필요한 경우:
1. Google Cloud Console 도움말 문서 확인
2. Google Cloud 지원팀 문의
3. 프로젝트 GitHub 이슈 등록
