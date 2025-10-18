import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const sampleDataPath = path.join(
      process.cwd(),
      "logic",
      "naver_complexes_20250611_213830.json"
    );

    const rawData = fs.readFileSync(sampleDataPath, "utf-8");
    const sampleComplexes = JSON.parse(rawData);

    // 원본 데이터 파싱 및 재구성
    const processedComplexes = sampleComplexes
      .map((item: any) => {
        try {
          const originalData = JSON.parse(item.원본데이터);
          return {
            수집시간: item.수집시간,
            단지명: originalData.complexName || originalData.preSaleComplexName,
            단지번호: originalData.markerId,
            위도: originalData.latitude || originalData.yCoordinate,
            경도: originalData.longitude || originalData.xCoordinate,
            주소: originalData.preSaleAddress || "",
            가격정보:
              originalData.minPreSalePrice && originalData.maxPreSalePrice
                ? `${(originalData.minPreSalePrice / 10000).toFixed(1)}억 ~ ${(originalData.maxPreSalePrice / 10000).toFixed(1)}억원`
                : "",
            면적정보:
              originalData.minPreSaleArea && originalData.maxPreSaleArea
                ? `${originalData.minPreSaleArea}㎡ ~ ${originalData.maxPreSaleArea}㎡`
                : "",
            세대수: originalData.totalHouseholdsNumber || "",
            분양상태:
              originalData.preSaleStageCode === "C11"
                ? "분양예정"
                : originalData.preSaleStageCode === "C12"
                ? "분양중"
                : "분양",
            건설사: originalData.buildCompany || "",
            분양일: originalData.preSaleStageDetails || "",
            입주일: originalData.occupancyYearMonth || "",
          };
        } catch (e) {
          return null;
        }
      })
      .filter((item: any) => item !== null);

    return NextResponse.json({
      complexes: processedComplexes,
      summary: {
        totalCount: processedComplexes.length,
        timestamp: new Date().toISOString(),
        location: { lat: 37.5608493, lon: 126.9888325, zoom: 15 },
        isSampleData: true,
      },
    });
  } catch (error) {
    console.error("샘플 데이터 로드 중 오류:", error);
    return NextResponse.json(
      { error: "샘플 데이터를 로드할 수 없습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
