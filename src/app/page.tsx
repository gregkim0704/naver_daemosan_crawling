"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";

interface ComplexData {
  수집시간: string;
  단지명: string;
  단지번호: string;
  위도: number | string;
  경도: number | string;
  주소: string;
  가격정보: string;
  면적정보: string;
  세대수: number | string;
  분양상태: string;
  건설사: string;
  분양일: string;
  입주일: string;
}

interface CrawlingResult {
  complexes: ComplexData[];
  summary: {
    totalCount: number;
    timestamp: string;
    location?: {
      lat: number;
      lon: number;
      zoom: number;
    };
  };
}

interface RegionSearchResult {
  key: string;
  lat: number;
  lng: number;
  name: string;
  matchType: "exact" | "partial" | "flexible";
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CrawlingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState("37.5608493");
  const [lon, setLon] = useState("126.9888325");
  const [zoom, setZoom] = useState("15");

  // 지역 검색 관련 상태
  const [regionQuery, setRegionQuery] = useState("");
  const [regionResults, setRegionResults] = useState<RegionSearchResult[]>([]);
  const [showRegionResults, setShowRegionResults] = useState(false);
  const [regionLoading, setRegionLoading] = useState(false);
  const regionSearchRef = useRef<HTMLDivElement>(null);
  const regionInputRef = useRef<HTMLInputElement>(null);

  // 지역 검색 함수
  const searchRegions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setRegionResults([]);
      setShowRegionResults(false);
      return;
    }

    setRegionLoading(true);
    try {
      const response = await axios.get(
        `/api/geocode?query=${encodeURIComponent(query)}`,
      );
      setRegionResults(response.data.results || []);
      setShowRegionResults(true);
    } catch (err) {
      console.error("지역 검색 오류:", err);
      setRegionResults([]);
    } finally {
      setRegionLoading(false);
    }
  }, []);

  // 지역 선택 함수
  const handleRegionSelect = (region: RegionSearchResult) => {
    setLat(region.lat.toString());
    setLon(region.lng.toString());
    setRegionQuery(region.name);
    setShowRegionResults(false);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        regionSearchRef.current &&
        !regionSearchRef.current.contains(event.target as Node)
      ) {
        setShowRegionResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 지역명 입력 핸들러
  const handleRegionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegionQuery(value);

    // 디바운싱을 위한 타이머
    const timer = setTimeout(() => {
      searchRegions(value);
    }, 300);

    return () => clearTimeout(timer);
  };

  const handleCrawl = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post("/api/crawl", {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        zoom: parseInt(zoom),
      });

      setData(response.data);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.details) {
        // 상세한 에러 메시지가 있으면 표시
        setError(`${errorData.error}\n\n${errorData.details}`);
      } else {
        setError(errorData?.error || "크롤링 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadAsJson = () => {
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naver_real_estate_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsCsv = () => {
    if (!data || !data.complexes.length) return;

    const headers = Object.keys(data.complexes[0]).join(",");
    const rows = data.complexes.map((complex) =>
      Object.values(complex)
        .map((value) => `"${value}"`)
        .join(","),
    );

    const csvContent = `${headers}\n${rows.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naver_real_estate_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            네이버 부동산 크롤링
          </h1>
          <p className="text-lg text-gray-600">
            네이버 부동산 API를 통해 부동산 정보를 수집합니다
          </p>
        </div>

        {/* 설정 패널 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">크롤링 설정</h2>

          {/* 지역 검색 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 지역명으로 검색
            </label>
            <div className="relative" ref={regionSearchRef}>
              <input
                ref={regionInputRef}
                type="text"
                value={regionQuery}
                onChange={handleRegionInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="예: 강남구, 부산, 제주시, 수원..."
              />
              {regionLoading && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* 검색 결과 드롭다운 */}
              {showRegionResults && regionResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {regionResults.map((region, index) => (
                    <button
                      key={index}
                      onClick={() => handleRegionSelect(region)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {region.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        위도: {region.lat.toFixed(6)}, 경도:{" "}
                        {region.lng.toFixed(6)}
                        {region.matchType === "exact" && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            정확일치
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 검색 결과 없음 */}
              {showRegionResults &&
                regionResults.length === 0 &&
                regionQuery.trim() &&
                !regionLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                    <div className="text-gray-500 text-center">
                      <div className="mb-2">검색 결과가 없습니다.</div>
                      <div className="text-sm">
                        서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 경기,
                        강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주 등으로
                        검색해보세요.
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              지역명을 입력하면 자동으로 위도/경도가 설정됩니다. 예: 강남구,
              부산시, 제주도
            </p>
          </div>

          {/* 또는 구분선 */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-sm text-gray-500 bg-white">
              또는 직접 좌표 입력
            </div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* 좌표 직접 입력 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위도 (Latitude)
              </label>
              <input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="37.5608493"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                경도 (Longitude)
              </label>
              <input
                type="number"
                step="0.000001"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="126.9888325"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                줌 레벨 (Zoom)
              </label>
              <input
                type="number"
                min="10"
                max="20"
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15"
              />
            </div>
          </div>

          {/* 인기 지역 바로가기 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🏙️ 인기 지역 바로가기
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "서울 강남구", lat: 37.5172, lng: 127.0473 },
                { name: "서울 종로구", lat: 37.5735, lng: 126.9788 },
                { name: "부산 해운대구", lat: 35.1631, lng: 129.1631 },
                { name: "경기 수원시", lat: 37.2636, lng: 127.0286 },
                { name: "경기 성남시", lat: 37.4201, lng: 127.1262 },
                { name: "인천 송도", lat: 37.3914, lng: 126.6406 },
                { name: "대전 유성구", lat: 36.3622, lng: 127.3564 },
                { name: "제주시", lat: 33.5097, lng: 126.5219 },
              ].map((region, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setLat(region.lat.toString());
                    setLon(region.lng.toString());
                    setRegionQuery(region.name);
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCrawl}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "크롤링 중..." : "크롤링 시작"}
          </button>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="flex">
              <div className="text-red-800 whitespace-pre-line">
                <strong>오류:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* 결과 요약 */}
        {data && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">크롤링 결과</h2>
              <div className="space-x-2">
                <button
                  onClick={downloadAsJson}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  JSON 다운로드
                </button>
                <button
                  onClick={downloadAsCsv}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  CSV 다운로드
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data.summary.totalCount}
                </div>
                <div className="text-blue-800">총 단지 수</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {data.summary.location?.lat.toFixed(6)}
                </div>
                <div className="text-green-800">검색 위도</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {data.summary.location?.lon.toFixed(6)}
                </div>
                <div className="text-purple-800">검색 경도</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              수집 시간:{" "}
              {new Date(data.summary.timestamp).toLocaleString("ko-KR")}
            </div>
          </div>
        )}

        {/* 데이터 테이블 */}
        {data && data.complexes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">단지 정보</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      단지명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주소
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가격정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      면적정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      분양상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      세대수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      건설사
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.complexes.map((complex, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {complex.단지명}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complex.주소}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complex.가격정보}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complex.면적정보}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            complex.분양상태 === "분양중"
                              ? "bg-green-100 text-green-800"
                              : complex.분양상태 === "분양예정"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {complex.분양상태}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complex.세대수}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complex.건설사}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="text-yellow-800">
            <h3 className="font-medium mb-2">주의사항</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>이 도구는 교육 목적으로만 사용해야 합니다.</li>
              <li>네이버 서비스 이용약관을 준수해야 합니다.</li>
              <li>과도한 요청은 IP 차단의 원인이 될 수 있습니다.</li>
              <li>수집된 데이터는 개인적 용도로만 사용하세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
