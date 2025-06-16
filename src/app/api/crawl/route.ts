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
    } catch (error) {
      console.log(`단지 마커 조회 중 오류: ${error}`);
      return [];
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

    // 단지 마커 정보 조회
    const complexData = await this.getComplexMarkers(lat, lon, zoom);

    if (complexData.length === 0) {
      console.log("조회된 단지 정보가 없습니다.");
      return {
        complexes: [],
        summary: { totalCount: 0, timestamp: new Date().toISOString() },
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
  } catch (error) {
    console.error("크롤링 중 오류:", error);
    return NextResponse.json(
      { error: "크롤링 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
