# 네이버 부동산 크롤링 프로젝트

이 프로젝트는 Playwright MCP를 사용하여 네이버 부동산 사이트에서 부동산 정보를 크롤링하는 방법을 보여줍니다.

## 🎯 프로젝트 목적

네이버 부동산 사이트에서 다음과 같은 정보를 수집할 수 있습니다:

- 아파트/오피스텔 분양 정보
- 분양가 및 면적 정보
- 지역별 부동산 단지 정보
- 개발계획 정보
- 행정구역 정보

## 📁 파일 구조

```
naver-crawl/
├── naver_real_estate_crawler.py  # Playwright 기반 브라우저 크롤링
├── naver_api_crawler.py          # API 직접 호출 크롤링
├── requirements.txt              # 필요한 패키지 목록
└── README.md                     # 프로젝트 설명서
```

## 🛠 설치 및 설정

### 1. 필요한 패키지 설치

```bash
pip install -r requirements.txt
```

### 2. Playwright 브라우저 설치

```bash
playwright install chromium
```

## 🚀 사용 방법

### 방법 1: Playwright 브라우저 크롤링

이 방법은 실제 브라우저를 사용하여 페이지를 로드하고 상호작용합니다.

```bash
python naver_real_estate_crawler.py
```

**특징:**

- 실제 브라우저 환경에서 실행
- JavaScript 렌더링 지원
- 사용자 인터랙션 시뮬레이션 가능
- 네트워크 요청 모니터링

### 방법 2: API 직접 호출

이 방법은 네트워크 탭에서 확인한 API 엔드포인트를 직접 호출합니다.

```bash
python naver_api_crawler.py
```

**특징:**

- 빠른 실행 속도
- 리소스 효율적
- 구조화된 JSON 데이터 수집
- 대량 데이터 처리에 적합

## 📊 수집되는 데이터

### 단지 정보

- 단지명
- 위치 (위도/경도)
- 주소
- 분양가 정보
- 면적 정보
- 세대수
- 분양 상태
- 건설사
- 분양일/입주일

### 개발계획 정보

- 도로 개발계획
- 철도/역사 개발계획
- 지구 개발계획

### 행정구역 정보

- 시/도/구/동 정보

## 📄 출력 파일

실행 후 다음과 같은 파일들이 생성됩니다:

```
naver_real_estate_api_YYYYMMDD_HHMMSS.json  # 전체 데이터 (JSON)
naver_real_estate_api_YYYYMMDD_HHMMSS.csv   # 전체 데이터 (CSV)
naver_complexes_YYYYMMDD_HHMMSS.json        # 단지 정보만 (JSON)
naver_complexes_YYYYMMDD_HHMMSS.csv         # 단지 정보만 (CSV)
```

## 🔧 커스터마이징

### 위치 변경

`naver_api_crawler.py`의 `main()` 함수에서 좌표를 수정하세요:

```python
data = client.crawl_real_estate_data(
    lat=37.5608493,  # 위도 (변경 가능)
    lon=126.9888325,  # 경도 (변경 가능)
    zoom=15          # 줌 레벨 (변경 가능)
)
```

### 검색 조건 변경

`get_complex_markers()` 함수의 params에서 다음 항목들을 수정할 수 있습니다:

```python
params = {
    'realEstateType': 'APT:PRE:ABYG:JGC',  # 부동산 타입
    'priceMin': '0',                       # 최소 가격
    'priceMax': '900000000',               # 최대 가격
    'areaMin': '0',                        # 최소 면적
    'areaMax': '900000000',                # 최대 면적
    # ... 기타 옵션들
}
```

## ⚠️ 주의사항

1. **로봇 배제 표준 준수**: robots.txt를 확인하고 준수하세요.
2. **요청 간격**: API 호출 간 적절한 간격을 두어 서버 부하를 방지하세요.
3. **이용약관**: 네이버 서비스 이용약관을 반드시 준수하세요.
4. **상업적 이용**: 상업적 목적으로 사용 시 별도 허가가 필요할 수 있습니다.
5. **데이터 사용**: 수집된 데이터는 개인적 용도로만 사용하세요.

## 🐛 문제 해결

### 브라우저 실행 오류

```bash
# Playwright 재설치
pip uninstall playwright
pip install playwright
playwright install chromium
```

### API 호출 실패

- User-Agent나 Referer 헤더를 최신 브라우저 정보로 업데이트
- 요청 간격을 늘려서 재시도

### 권한 오류

- 실행 권한 확인: `chmod +x *.py`
- 관리자 권한으로 실행

## 📝 라이선스

이 프로젝트는 교육 목적으로만 제공되며, 네이버의 서비스 이용약관을 준수해야 합니다.

## 🤝 기여

버그 리포트나 기능 개선 제안은 Issues를 통해 제출해 주세요.

---

**면책 조항**: 이 코드는 교육 목적으로만 제공됩니다. 실제 사용 시에는 해당 웹사이트의 이용약관과 법적 규정을 반드시 준수하시기 바랍니다.
