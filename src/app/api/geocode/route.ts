import { NextRequest, NextResponse } from "next/server";

// 한국 주요 지역 좌표 데이터
const KOREA_REGIONS = {
  // 서울특별시
  서울: { lat: 37.5665, lng: 126.978, name: "서울특별시" },
  강남구: { lat: 37.5172, lng: 127.0473, name: "서울특별시 강남구" },
  강동구: { lat: 37.5301, lng: 127.1238, name: "서울특별시 강동구" },
  강북구: { lat: 37.6398, lng: 127.0256, name: "서울특별시 강북구" },
  강서구: { lat: 37.5509, lng: 126.8495, name: "서울특별시 강서구" },
  관악구: { lat: 37.4781, lng: 126.9515, name: "서울특별시 관악구" },
  광진구: { lat: 37.5385, lng: 127.0823, name: "서울특별시 광진구" },
  구로구: { lat: 37.4954, lng: 126.8874, name: "서울특별시 구로구" },
  금천구: { lat: 37.4567, lng: 126.8956, name: "서울특별시 금천구" },
  노원구: { lat: 37.6542, lng: 127.0568, name: "서울특별시 노원구" },
  도봉구: { lat: 37.6688, lng: 127.0471, name: "서울특별시 도봉구" },
  동대문구: { lat: 37.5744, lng: 127.0396, name: "서울특별시 동대문구" },
  동작구: { lat: 37.5124, lng: 126.9393, name: "서울특별시 동작구" },
  마포구: { lat: 37.5638, lng: 126.9084, name: "서울특별시 마포구" },
  서대문구: { lat: 37.5794, lng: 126.9368, name: "서울특별시 서대문구" },
  서초구: { lat: 37.4837, lng: 127.0324, name: "서울특별시 서초구" },
  성동구: { lat: 37.5634, lng: 127.0367, name: "서울특별시 성동구" },
  성북구: { lat: 37.5894, lng: 127.0167, name: "서울특별시 성북구" },
  송파구: { lat: 37.5145, lng: 127.1066, name: "서울특별시 송파구" },
  양천구: { lat: 37.5168, lng: 126.8665, name: "서울특별시 양천구" },
  영등포구: { lat: 37.5264, lng: 126.8963, name: "서울특별시 영등포구" },
  용산구: { lat: 37.5386, lng: 126.961, name: "서울특별시 용산구" },
  은평구: { lat: 37.6176, lng: 126.9227, name: "서울특별시 은평구" },
  종로구: { lat: 37.5735, lng: 126.9788, name: "서울특별시 종로구" },
  중구: { lat: 37.5608, lng: 126.9888, name: "서울특별시 중구" },
  중랑구: { lat: 37.6063, lng: 127.0925, name: "서울특별시 중랑구" },

  // 경기도
  경기: { lat: 37.4138, lng: 127.5183, name: "경기도" },
  수원: { lat: 37.2636, lng: 127.0286, name: "경기도 수원시" },
  성남: { lat: 37.4201, lng: 127.1262, name: "경기도 성남시" },
  고양: { lat: 37.6584, lng: 126.832, name: "경기도 고양시" },
  용인: { lat: 37.2411, lng: 127.1776, name: "경기도 용인시" },
  부천: { lat: 37.5035, lng: 126.766, name: "경기도 부천시" },
  안산: { lat: 37.3236, lng: 126.8219, name: "경기도 안산시" },
  안양: { lat: 37.3943, lng: 126.9568, name: "경기도 안양시" },
  남양주: { lat: 37.6364, lng: 127.2145, name: "경기도 남양주시" },
  화성: { lat: 37.1993, lng: 126.831, name: "경기도 화성시" },
  평택: { lat: 36.9921, lng: 127.1126, name: "경기도 평택시" },
  의정부: { lat: 37.7388, lng: 127.0338, name: "경기도 의정부시" },
  시흥: { lat: 37.3799, lng: 126.803, name: "경기도 시흥시" },
  파주: { lat: 37.7599, lng: 126.78, name: "경기도 파주시" },
  광명: { lat: 37.4786, lng: 126.8644, name: "경기도 광명시" },
  김포: { lat: 37.6149, lng: 126.7158, name: "경기도 김포시" },
  군포: { lat: 37.3614, lng: 126.9352, name: "경기도 군포시" },
  광주: { lat: 37.4291, lng: 127.255, name: "경기도 광주시" },
  이천: { lat: 37.2792, lng: 127.443, name: "경기도 이천시" },
  양주: { lat: 37.7851, lng: 127.0456, name: "경기도 양주시" },
  오산: { lat: 37.1499, lng: 127.0777, name: "경기도 오산시" },
  구리: { lat: 37.5943, lng: 127.1296, name: "경기도 구리시" },
  안성: { lat: 37.0079, lng: 127.2719, name: "경기도 안성시" },
  포천: { lat: 37.8947, lng: 127.2002, name: "경기도 포천시" },
  의왕: { lat: 37.3448, lng: 126.9687, name: "경기도 의왕시" },
  하남: { lat: 37.5394, lng: 127.2145, name: "경기도 하남시" },
  여주: { lat: 37.2982, lng: 127.6376, name: "경기도 여주시" },
  양평: { lat: 37.4914, lng: 127.4874, name: "경기도 양평군" },
  동두천: { lat: 37.9034, lng: 127.0606, name: "경기도 동두천시" },
  과천: { lat: 37.4292, lng: 126.9875, name: "경기도 과천시" },
  가평: { lat: 37.8315, lng: 127.5109, name: "경기도 가평군" },
  연천: { lat: 38.0963, lng: 127.0746, name: "경기도 연천군" },

  // 인천광역시
  인천: { lat: 37.4563, lng: 126.7052, name: "인천광역시" },
  중구인천: { lat: 37.4734, lng: 126.6214, name: "인천광역시 중구" },
  동구인천: { lat: 37.4739, lng: 126.6431, name: "인천광역시 동구" },
  미추홀구: { lat: 37.4637, lng: 126.6505, name: "인천광역시 미추홀구" },
  연수구: { lat: 37.4106, lng: 126.6783, name: "인천광역시 연수구" },
  남동구: { lat: 37.4469, lng: 126.7314, name: "인천광역시 남동구" },
  부평구: { lat: 37.507, lng: 126.7218, name: "인천광역시 부평구" },
  계양구: { lat: 37.5373, lng: 126.7378, name: "인천광역시 계양구" },
  서구인천: { lat: 37.5456, lng: 126.6756, name: "인천광역시 서구" },
  강화군: { lat: 37.7469, lng: 126.4881, name: "인천광역시 강화군" },
  옹진군: { lat: 37.4466, lng: 126.637, name: "인천광역시 옹진군" },

  // 부산광역시
  부산: { lat: 35.1796, lng: 129.0756, name: "부산광역시" },
  해운대구: { lat: 35.1631, lng: 129.1631, name: "부산광역시 해운대구" },
  수영구: { lat: 35.1456, lng: 129.1136, name: "부산광역시 수영구" },
  금정구: { lat: 35.2428, lng: 129.0929, name: "부산광역시 금정구" },
  동래구: { lat: 35.2048, lng: 129.0837, name: "부산광역시 동래구" },
  연제구: { lat: 35.1762, lng: 129.0784, name: "부산광역시 연제구" },
  부산진구: { lat: 35.1628, lng: 129.0532, name: "부산광역시 부산진구" },
  동구부산: { lat: 35.1369, lng: 129.0452, name: "부산광역시 동구" },
  남구부산: { lat: 35.1364, lng: 129.0841, name: "부산광역시 남구" },
  북구부산: { lat: 35.1978, lng: 128.9895, name: "부산광역시 북구" },
  강서구부산: { lat: 35.2123, lng: 128.9804, name: "부산광역시 강서구" },
  사상구: { lat: 35.1549, lng: 128.9919, name: "부산광역시 사상구" },
  사하구: { lat: 35.1045, lng: 128.9743, name: "부산광역시 사하구" },
  서구부산: { lat: 35.0971, lng: 129.0243, name: "부산광역시 서구" },
  영도구: { lat: 35.0912, lng: 129.0678, name: "부산광역시 영도구" },
  중구부산: { lat: 35.1061, lng: 129.0326, name: "부산광역시 중구" },
  기장군: { lat: 35.2446, lng: 129.2224, name: "부산광역시 기장군" },

  // 대구광역시
  대구: { lat: 35.8714, lng: 128.6014, name: "대구광역시" },
  중구대구: { lat: 35.8663, lng: 128.595, name: "대구광역시 중구" },
  동구대구: { lat: 35.8867, lng: 128.6355, name: "대구광역시 동구" },
  서구대구: { lat: 35.8719, lng: 128.5593, name: "대구광역시 서구" },
  남구대구: { lat: 35.8461, lng: 128.5973, name: "대구광역시 남구" },
  북구대구: { lat: 35.8858, lng: 128.5828, name: "대구광역시 북구" },
  수성구: { lat: 35.8581, lng: 128.6311, name: "대구광역시 수성구" },
  달서구: { lat: 35.8327, lng: 128.5326, name: "대구광역시 달서구" },
  달성군: { lat: 35.7749, lng: 128.4315, name: "대구광역시 달성군" },

  // 광주광역시
  광주: { lat: 35.1595, lng: 126.8526, name: "광주광역시" },
  동구광주: { lat: 35.1463, lng: 126.9227, name: "광주광역시 동구" },
  서구광주: { lat: 35.1521, lng: 126.8895, name: "광주광역시 서구" },
  남구광주: { lat: 35.133, lng: 126.9026, name: "광주광역시 남구" },
  북구광주: { lat: 35.1739, lng: 126.9123, name: "광주광역시 북구" },
  광산구: { lat: 35.1398, lng: 126.7934, name: "광주광역시 광산구" },

  // 대전광역시
  대전: { lat: 36.3504, lng: 127.3845, name: "대전광역시" },
  중구대전: { lat: 36.3256, lng: 127.4212, name: "대전광역시 중구" },
  동구대전: { lat: 36.3507, lng: 127.4545, name: "대전광역시 동구" },
  서구대전: { lat: 36.3552, lng: 127.3831, name: "대전광역시 서구" },
  유성구: { lat: 36.3622, lng: 127.3564, name: "대전광역시 유성구" },
  대덕구: { lat: 36.3469, lng: 127.4151, name: "대전광역시 대덕구" },

  // 울산광역시
  울산: { lat: 35.5384, lng: 129.3114, name: "울산광역시" },
  중구울산: { lat: 35.569, lng: 129.3328, name: "울산광역시 중구" },
  남구울산: { lat: 35.5461, lng: 129.3297, name: "울산광역시 남구" },
  동구울산: { lat: 35.5049, lng: 129.4167, name: "울산광역시 동구" },
  북구울산: { lat: 35.5823, lng: 129.3611, name: "울산광역시 북구" },
  울주군: { lat: 35.5219, lng: 129.2427, name: "울산광역시 울주군" },

  // 세종특별자치시
  세종: { lat: 36.48, lng: 127.289, name: "세종특별자치시" },

  // 강원도
  강원: { lat: 37.8228, lng: 128.1555, name: "강원도" },
  춘천: { lat: 37.8813, lng: 127.7298, name: "강원도 춘천시" },
  원주: { lat: 37.3422, lng: 127.9202, name: "강원도 원주시" },
  강릉: { lat: 37.7519, lng: 128.8761, name: "강원도 강릉시" },
  동해: { lat: 37.5244, lng: 129.1144, name: "강원도 동해시" },
  태백: { lat: 37.164, lng: 128.9856, name: "강원도 태백시" },
  속초: { lat: 38.207, lng: 128.5918, name: "강원도 속초시" },
  삼척: { lat: 37.4499, lng: 129.1656, name: "강원도 삼척시" },

  // 충청북도
  충북: { lat: 36.8, lng: 127.7, name: "충청북도" },
  청주: { lat: 36.6424, lng: 127.489, name: "충청북도 청주시" },
  충주: { lat: 36.991, lng: 127.9258, name: "충청북도 충주시" },
  제천: { lat: 37.1326, lng: 128.1906, name: "충청북도 제천시" },

  // 충청남도
  충남: { lat: 36.5, lng: 126.8, name: "충청남도" },
  천안: { lat: 36.8151, lng: 127.1139, name: "충청남도 천안시" },
  공주: { lat: 36.4465, lng: 127.1188, name: "충청남도 공주시" },
  보령: { lat: 36.3331, lng: 126.6128, name: "충청남도 보령시" },
  아산: { lat: 36.7898, lng: 127.002, name: "충청남도 아산시" },
  서산: { lat: 36.7848, lng: 126.4503, name: "충청남도 서산시" },
  논산: { lat: 36.1872, lng: 127.0989, name: "충청남도 논산시" },
  계룡: { lat: 36.2742, lng: 127.2479, name: "충청남도 계룡시" },
  당진: { lat: 36.8946, lng: 126.6314, name: "충청남도 당진시" },

  // 전라북도
  전북: { lat: 35.7175, lng: 127.153, name: "전라북도" },
  전주: { lat: 35.8242, lng: 127.148, name: "전라북도 전주시" },
  군산: { lat: 35.9676, lng: 126.7369, name: "전라북도 군산시" },
  익산: { lat: 35.9483, lng: 126.9576, name: "전라북도 익산시" },
  정읍: { lat: 35.5697, lng: 126.856, name: "전라북도 정읍시" },
  남원: { lat: 35.4163, lng: 127.3906, name: "전라북도 남원시" },
  김제: { lat: 35.8035, lng: 126.8805, name: "전라북도 김제시" },

  // 전라남도
  전남: { lat: 34.8679, lng: 126.991, name: "전라남도" },
  목포: { lat: 34.8118, lng: 126.3922, name: "전라남도 목포시" },
  여수: { lat: 34.7604, lng: 127.6622, name: "전라남도 여수시" },
  순천: { lat: 34.9506, lng: 127.4872, name: "전라남도 순천시" },
  나주: { lat: 35.016, lng: 126.7108, name: "전라남도 나주시" },
  광양: { lat: 34.9407, lng: 127.5958, name: "전라남도 광양시" },

  // 경상북도
  경북: { lat: 36.4919, lng: 128.8889, name: "경상북도" },
  포항: { lat: 36.019, lng: 129.3435, name: "경상북도 포항시" },
  경주: { lat: 35.8562, lng: 129.2249, name: "경상북도 경주시" },
  김천: { lat: 36.1396, lng: 128.1136, name: "경상북도 김천시" },
  안동: { lat: 36.5684, lng: 128.7294, name: "경상북도 안동시" },
  구미: { lat: 36.1195, lng: 128.3441, name: "경상북도 구미시" },
  영주: { lat: 36.8056, lng: 128.6244, name: "경상북도 영주시" },
  영천: { lat: 35.9733, lng: 128.9386, name: "경상북도 영천시" },
  상주: { lat: 36.4109, lng: 128.159, name: "경상북도 상주시" },
  문경: { lat: 36.5868, lng: 128.1871, name: "경상북도 문경시" },
  경산: { lat: 35.8256, lng: 128.7415, name: "경상북도 경산시" },

  // 경상남도
  경남: { lat: 35.4606, lng: 128.2132, name: "경상남도" },
  창원: { lat: 35.228, lng: 128.6811, name: "경상남도 창원시" },
  진주: { lat: 35.18, lng: 128.1076, name: "경상남도 진주시" },
  통영: { lat: 34.8544, lng: 128.4332, name: "경상남도 통영시" },
  사천: { lat: 35.0037, lng: 128.0645, name: "경상남도 사천시" },
  김해: { lat: 35.2285, lng: 128.889, name: "경상남도 김해시" },
  밀양: { lat: 35.504, lng: 128.7469, name: "경상남도 밀양시" },
  거제: { lat: 34.8806, lng: 128.6212, name: "경상남도 거제시" },
  양산: { lat: 35.335, lng: 129.0378, name: "경상남도 양산시" },

  // 제주특별자치도
  제주: { lat: 33.4996, lng: 126.5312, name: "제주특별자치도" },
  제주시: { lat: 33.5097, lng: 126.5219, name: "제주특별자치도 제주시" },
  서귀포: { lat: 33.2542, lng: 126.5603, name: "제주특별자치도 서귀포시" },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "검색어를 입력해주세요." },
      { status: 400 },
    );
  }

  // 검색어를 소문자로 변환하여 키워드 검색
  const searchTerm = query.toLowerCase().trim();
  const results = [];

  // 정확한 매칭 먼저 찾기
  for (const [key, value] of Object.entries(KOREA_REGIONS)) {
    if (key.toLowerCase() === searchTerm) {
      results.unshift({
        // 정확한 매칭은 앞에 추가
        key,
        ...value,
        matchType: "exact",
      });
    } else if (
      key.toLowerCase().includes(searchTerm) ||
      value.name.toLowerCase().includes(searchTerm)
    ) {
      results.push({
        key,
        ...value,
        matchType: "partial",
      });
    }
  }

  // 결과가 없으면 더 유연한 검색
  if (results.length === 0) {
    for (const [key, value] of Object.entries(KOREA_REGIONS)) {
      if (value.name.includes(query) || key.includes(query)) {
        results.push({
          key,
          ...value,
          matchType: "flexible",
        });
      }
    }
  }

  // 최대 10개 결과만 반환
  return NextResponse.json({
    query,
    results: results.slice(0, 10),
    total: results.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { regionName } = await request.json();

    if (!regionName) {
      return NextResponse.json(
        { error: "지역명을 입력해주세요." },
        { status: 400 },
      );
    }

    // 지역명으로 좌표 찾기
    const searchTerm = regionName.toLowerCase().trim();
    let foundRegion = null;

    // 정확한 매칭 먼저 찾기
    for (const [key, value] of Object.entries(KOREA_REGIONS)) {
      if (key.toLowerCase() === searchTerm) {
        foundRegion = { key, ...value };
        break;
      }
    }

    // 정확한 매칭이 없으면 부분 매칭
    if (!foundRegion) {
      for (const [key, value] of Object.entries(KOREA_REGIONS)) {
        if (
          key.toLowerCase().includes(searchTerm) ||
          value.name.toLowerCase().includes(searchTerm)
        ) {
          foundRegion = { key, ...value };
          break;
        }
      }
    }

    if (!foundRegion) {
      return NextResponse.json(
        {
          error: "해당 지역을 찾을 수 없습니다.",
          suggestion:
            "서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주 등으로 검색해보세요.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      region: foundRegion,
      coordinates: {
        lat: foundRegion.lat,
        lng: foundRegion.lng,
        name: foundRegion.name,
      },
    });
  } catch (error) {
    console.error("지역 검색 오류:", error);
    return NextResponse.json(
      { error: "지역 검색 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
