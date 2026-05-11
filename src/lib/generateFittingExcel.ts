import * as XLSX from "xlsx";

interface FittingRecord {
  date: string;
  day: number;
  hours: number;
}

interface ModelData {
  name: string;
  hourly_rate: number | null;
  records: FittingRecord[];
}

interface ExportData {
  year: number;
  month: number;
  models: ModelData[];
}

function fmtDate(month: number, day: number): string {
  return `${month}/${day}`;
}

export function generateFittingExcel(data: ExportData): void {
  const { year, month, models } = data;
  const wb = XLSX.utils.book_new();

  // 합계 시트
  const sumRows: (string | number)[][] = [
    [`${year}년 ${month}월 피팅 업무 확인서 - 합계`],
    [],
    ["사업부", "분류", "모델", "근무일수", "착장수", "급여(원)", "시급(원)"],
  ];

  const dept = "DISCOVERY\nQM팀";
  let prevGender = "";

  for (const m of models) {
    const rate = m.hourly_rate ?? 0;
    const workDays = m.records.length;
    const totalFit = m.records.reduce((a, r) => a + Math.round(r.hours * 10), 0);
    const totalAmt = m.records.reduce((a, r) => a + Math.round(r.hours * rate), 0);
    // 분류는 gender 미보유이므로 일단 "-"
    const gender = "-";
    const showDept = sumRows.length === 3 ? dept : "";
    const showGender = gender !== prevGender ? gender : "";
    prevGender = gender;
    sumRows.push([showDept, showGender, m.name, workDays, totalFit, totalAmt, rate]);
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(sumRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "합계");

  // 표 시트
  const pyo: (string | number)[][] = [
    [],
    [],
    [],
    ["", "사업부", "분류", "모델", "근무일수", "착장수", "급여(원)", "시급(원)"],
  ];
  for (const m of models) {
    const rate = m.hourly_rate ?? 0;
    const workDays = m.records.length;
    const totalFit = m.records.reduce((a, r) => a + Math.round(r.hours * 10), 0);
    const totalAmt = m.records.reduce((a, r) => a + Math.round(r.hours * rate), 0);
    pyo.push(["", dept, "-", m.name, workDays, totalFit, totalAmt, rate]);
  }
  const wsPyo = XLSX.utils.aoa_to_sheet(pyo);
  XLSX.utils.book_append_sheet(wb, wsPyo, "표");

  // 모델별 시트
  for (const m of models) {
    const rate = m.hourly_rate ?? 0;
    const sheetData: (string | number)[][] = [
      // Row 1: 제목 행
      [`${year}년 ${month}월 피팅 업무 확인서`, "", "", "", m.name, "", "", "", `시급 ${rate.toLocaleString("ko-KR")}원`],
      // Row 2: 빈 행
      [],
      // Row 3: 헤더
      ["근무 일자", "소요 시간", "착장 수", "일별 금액(세금 3.3% 포함)", "서명"],
      // Row 4: 단위
      ["", "(시간)", "(벌)", "", "근무자", "담당자"],
    ];

    let totalFit = 0;
    let totalAmt = 0;

    for (const rec of m.records) {
      const fittings = Math.round(rec.hours * 10);
      const amount = Math.round(rec.hours * rate);
      totalFit += fittings;
      totalAmt += amount;
      sheetData.push([
        fmtDate(month, rec.day),
        rec.hours,
        fittings,
        amount,
        m.name,
        "",
      ]);
    }

    // 빈 행 (합계 행과 구분)
    sheetData.push([]);

    // 합계 행
    sheetData.push(["근무 일자 합계", "", m.records.length, "일", m.name, ""]);
    sheetData.push(["착장 수 합계", "", totalFit, "벌"]);
    sheetData.push(["지급 금액 합계", "", totalAmt, "원"]);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // 열 너비 설정
    ws["!cols"] = [
      { wch: 12 }, // A 근무일자
      { wch: 12 }, // B 시간
      { wch: 10 }, // C 착장수
      { wch: 22 }, // D 금액
      { wch: 12 }, // E 서명
      { wch: 12 }, // F 담당자
    ];

    // 시트명은 모델명 (Excel 시트명 31자 제한, 특수문자 불가)
    const sheetName = m.name.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const fileName = `${year}년 ${month}월 피팅업무확인서_월말정산.xlsx`;
  XLSX.writeFile(wb, fileName);
}
