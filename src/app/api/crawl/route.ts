import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface ComplexData {
  complexName?: string;
  markerId?: string;
  latitude?: number;
  longitude?: number;
  yCoordinate?: number;
  xCoordinate?: number;
  preSaleAddress?: string;
  minPreSalePrice?: number;
  maxPreSalePrice?: number;
  minDealPrice?: number;
  maxDealPrice?: number;
  minPreSaleArea?: number;
  maxPreSaleArea?: number;
  minArea?: number;
  maxArea?: number;
  totalHouseholdsNumber?: number;
  isPresales?: boolean;
  preSaleStageCode?: string;
  constructionCompanyName?: string;
  preSaleDateString?: string;
  moveinDateString?: string;
}

interface ProcessedComplexData {
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

class NaverRealEstateAPIClient {
  private session: any;

  constructor() {
    this.session = axios.create({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        Referer: "https://new.land.naver.com/",
        Origin: "https://new.land.naver.com",
      },
    });
  }

  async getComplexMarkers(
    lat: number = 37.5608493,
    lon: number = 126.9888325,
    zoom: number = 15,
  ): Promise<ComplexData[]> {
    try {
      const latOffset = 0.01;
      const lonOffset = 0.02;

      const params = {
        cortarNo: "1114014100",
        zoom: zoom.toString(),
        priceType: "RETAIL",
        markerId: "",
        markerType: "",
        selectedComplexNo: "",
        selectedComplexBuildingNo: "",
        fakeComplexMarker: "",
        realEstateType: "APT:PRE:ABYG:JGC",
        tradeType: "",
        tag: "::::::::",
        rentPriceMin: "0",
        rentPriceMax: "900000000",
        priceMin: "0",
        priceMax: "900000000",
        areaMin: "0",
        areaMax: "900000000",
        oldBuildYears: "",
        recentlyBuildYears: "",
        minHouseHoldCount: "",
        maxHouseHoldCount: "",
        showArticle: "false",
        sameAddressGroup: "false",
        minMaintenanceCost: "",
        maxMaintenanceCost: "",
        directions: "",
        leftLon: (lon - lonOffset).toString(),
        rightLon: (lon + lonOffset).toString(),
        topLat: (lat + latOffset).toString(),
        bottomLat: (lat - latOffset).toString(),
        isPresale: "true",
      };

      const url = "https://new.land.naver.com/api/complexes/single-markers/2.0";
      const response = await this.session.get(url, { params });

      if (response.status === 200) {
        console.log(`단지 마커 ${response.data.length} 개 조회됨`);
        return response.data;
      } else {
        console.log(`API 호출 실패: ${response.status}`);
        return [];
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.log(`Rate limit 오류 (429): 네이버가 요청을 제한했습니다.`);
        throw new Error('네이버 API Rate Limit 초과: 잠시 후 다시 시도해주세요.');
      }
      console.log(`단지 마커 조회 중 오류: ${error}`);
      throw error;
    }
  }

  // 가격을 억 단위로 변환하는 유틸리티 함수
  formatPrice(priceInManwon: number): string {
    if (priceInManwon >= 10000) {
      const eok = Math.floor(priceInManwon / 10000);
      const remainingManwon = priceInManwon % 10000;

      if (remainingManwon === 0) {
        return `${eok}억원`;
      } else {
        return `${eok}억 ${remainingManwon.toLocaleString()}만원`;
      }
    } else {
      return `${priceInManwon.toLocaleString()}만원`;
    }
  }

  // 면적을 평수와 함께 표시하는 유틸리티 함수
  formatArea(areaInSqm: number): string {
    const pyeong = (areaInSqm / 3.3058).toFixed(1);
    return `${areaInSqm}㎡ (${pyeong}평)`;
  }

  processComplexData(complexData: ComplexData[]): ProcessedComplexData[] {
    const processedData: ProcessedComplexData[] = [];

    for (const complexItem of complexData) {
      try {
        // 가격 정보 처리 (억 단위 변환)
        const minPrice =
          complexItem.minPreSalePrice || complexItem.minDealPrice || 0;
        const maxPrice =
          complexItem.maxPreSalePrice || complexItem.maxDealPrice || 0;
        let priceInfo = "";
        if (minPrice && maxPrice) {
          if (minPrice === maxPrice) {
            priceInfo = this.formatPrice(minPrice);
          } else {
            priceInfo = `${this.formatPrice(minPrice)}~${this.formatPrice(
              maxPrice,
            )}`;
          }
        }

        // 면적 정보 처리 (평수 추가)
        const minArea = complexItem.minPreSaleArea || complexItem.minArea || 0;
        const maxArea = complexItem.maxPreSaleArea || complexItem.maxArea || 0;
        let areaInfo = "";
        if (minArea && maxArea) {
          if (minArea === maxArea) {
            areaInfo = this.formatArea(minArea);
          } else {
            areaInfo = `${this.formatArea(minArea)}~${this.formatArea(
              maxArea,
            )}`;
          }
        }

        // 분양 상태 처리
        let saleStatus = "";
        if (complexItem.isPresales) {
          const stageCode = complexItem.preSaleStageCode || "";
          if (stageCode === "C11") {
            saleStatus = "분양예정";
          } else if (stageCode === "C12") {
            saleStatus = "분양중";
          } else {
            saleStatus = "분양";
          }
        } else {
          saleStatus = "일반매매";
        }

        const processedItem: ProcessedComplexData = {
          수집시간: new Date().toLocaleString("ko-KR"),
          단지명: complexItem.complexName || "",
          단지번호: complexItem.markerId || "",
          위도: complexItem.latitude || complexItem.yCoordinate || "",
          경도: complexItem.longitude || complexItem.xCoordinate || "",
          주소: complexItem.preSaleAddress || "",
          가격정보: priceInfo,
          면적정보: areaInfo,
          세대수: complexItem.totalHouseholdsNumber || "",
          분양상태: saleStatus,
          건설사: complexItem.constructionCompanyName || "",
          분양일: complexItem.preSaleDateString || "",
          입주일: complexItem.moveinDateString || "",
        };

        processedData.push(processedItem);
      } catch (error) {
        console.log(`데이터 처리 중 오류: ${error}`);
      }
    }

    return processedData;
  }

  async crawlRealEstateData(
    lat: number = 37.5608493,
    lon: number = 126.9888325,
    zoom: number = 15,
  ) {
    console.log("네이버 부동산 데이터 크롤링 시작...");
    console.log(`위치: 위도 ${lat}, 경도 ${lon}, 줌 레벨 ${zoom}`);

    try {
      // 단지 마커 정보 조회
      const complexData = await this.getComplexMarkers(lat, lon, zoom);

      if (complexData.length === 0) {
        console.log("조회된 단지 정보가 없습니다.");
        return {
          complexes: [],
          summary: { 
            totalCount: 0, 
            timestamp: new Date().toISOString(),
            location: { lat, lon, zoom },
          },
        };
      }
    } catch (error: any) {
      if (error.message.includes('Rate Limit')) {
        throw error;
      }
      console.log("조회된 단지 정보가 없습니다.");
      return {
        complexes: [],
        summary: { 
          totalCount: 0, 
          timestamp: new Date().toISOString(),
          location: { lat, lon, zoom },
        },
      };
    }

    // 데이터 처리
    const processedComplexes = this.processComplexData(complexData);

    const result = {
      complexes: processedComplexes,
      summary: {
        totalCount: processedComplexes.length,
        timestamp: new Date().toISOString(),
        location: { lat, lon, zoom },
      },
    };

    console.log(
      `크롤링 완료: 총 ${processedComplexes.length}개 단지 정보 수집`,
    );
    return result;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "37.5608493");
    const lon = parseFloat(searchParams.get("lon") || "126.9888325");
    const zoom = parseInt(searchParams.get("zoom") || "15");

    const client = new NaverRealEstateAPIClient();
    const data = await client.crawlRealEstateData(lat, lon, zoom);

    return NextResponse.json(data);
  } catch (error) {
    console.error("크롤링 중 오류:", error);
    return NextResponse.json(
      { error: "크롤링 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat = 37.5608493, lon = 126.9888325, zoom = 15 } = body;

    const client = new NaverRealEstateAPIClient();
    const data = await client.crawlRealEstateData(lat, lon, zoom);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("크롤링 중 오류:", error);
    
    if (error.message && error.message.includes('Rate Limit')) {
      return NextResponse.json(
        { 
          error: "⚠️ 네이버 API 요청 제한이 발생했습니다.",
          details: "네이버 부동산이 일시적으로 API 요청을 제한하고 있습니다. 이는 다음과 같은 이유로 발생할 수 있습니다:\n\n" +
                   "1. 짧은 시간 내 너무 많은 요청\n" +
                   "2. 네이버의 봇 감지 시스템\n" +
                   "3. API 인증 토큰 부족\n\n" +
                   "💡 해결 방법:\n" +
                   "- 5-10분 후 다시 시도해주세요\n" +
                   "- 또는 브라우저에서 직접 네이버 부동산(new.land.naver.com)을 방문하여 확인하세요\n" +
                   "- Python 로컬 크롤러를 사용하면 더 안정적으로 수집 가능합니다 (logic/naver_api_crawler.py)",
          suggestion: "네이버 부동산 웹사이트를 직접 방문하거나 잠시 후 다시 시도해주세요."
        },
        { status: 429 },
      );
    }
    
    return NextResponse.json(
      { error: "크롤링 중 오류가 발생했습니다. 네이버 API가 응답하지 않거나 데이터가 없을 수 있습니다." },
      { status: 500 },
    );
  }
}
