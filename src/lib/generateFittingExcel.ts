import ExcelJS from "exceljs";
import { TEMPLATE_B64 } from "./template_b64";

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

const FITTINGS_PER_HOUR = 20;

// 템플릿에서 알려진 병합 셀 목록
const MODEL_SHEET_MERGES = [
  "A3:A4", "D3:D4", "E3:F3",
  "A28:B28", "A29:B29", "A30:B30",
  "E28:E30", "F28:F30",
];

async function cloneTemplateSheet(
  tmpl: ExcelJS.Worksheet,
  dst: ExcelJS.Worksheet
): Promise<void> {
  // 열 너비 복사
  tmpl.columns.forEach((col, idx) => {
    if (col.width) dst.getColumn(idx + 1).width = col.width;
  });

  // 행 높이 + 셀 스타일 복사 (값은 복사 안 함)
  for (let r = 1; r <= 30; r++) {
    const srcRow = tmpl.getRow(r);
    const dstRow = dst.getRow(r);
    if (srcRow.height) dstRow.height = srcRow.height;

    for (let col = 1; col <= 6; col++) {
      const src = srcRow.getCell(col);
      const dst2 = dstRow.getCell(col);
      const s = src.style;
      if (s?.fill) dst2.fill = JSON.parse(JSON.stringify(s.fill));
      if (s?.border) dst2.border = JSON.parse(JSON.stringify(s.border));
      if (s?.font) dst2.font = JSON.parse(JSON.stringify(s.font));
      if (s?.alignment) dst2.alignment = JSON.parse(JSON.stringify(s.alignment));
      if (s?.numFmt) dst2.numFmt = s.numFmt;
    }
  }

  // 병합 셀 적용
  MODEL_SHEET_MERGES.forEach((range) => {
    try { dst.mergeCells(range); } catch { /* 이미 병합된 경우 무시 */ }
  });
}

function fillModelData(
  ws: ExcelJS.Worksheet,
  m: ModelData,
  year: number,
  month: number
): void {
  const rate = m.hourly_rate ?? 0;
  const totalPay = m.records.reduce((s, r) => s + Math.round(r.hours * rate), 0);
  let totalFittings = 0;

  // 행 1: 제목
  ws.getCell("A1").value = `${year}년 ${month}월 피팅 업무 확인서`;
  ws.getCell("E1").value = m.name;
  ws.getCell("F1").value = totalPay;

  // 행 3~4: 헤더 (템플릿 복사 후 재설정)
  ws.getCell("A3").value = "근무 일자";
  ws.getCell("B3").value = "소요 시간";
  ws.getCell("C3").value = "착장 수";
  ws.getCell("D3").value = "일별 금액\n(세금 3.3% 포함)";
  ws.getCell("E3").value = "서명";
  ws.getCell("B4").value = "(시간)";
  ws.getCell("C4").value = "(벌)";
  ws.getCell("E4").value = "근무자";
  ws.getCell("F4").value = "담당자";

  // 행 5~27: 기존 데이터 초기화 후 새 데이터 입력
  for (let r = 5; r <= 27; r++) {
    for (let col = 1; col <= 6; col++) {
      ws.getCell(r, col).value = null;
    }
  }

  let dataRow = 5;
  for (const rec of m.records) {
    const fittings = Math.round(rec.hours * FITTINGS_PER_HOUR);
    const amount = Math.round(rec.hours * rate);
    totalFittings += fittings;

    ws.getCell(dataRow, 1).value = new Date(`${rec.date}T00:00:00`);
    ws.getCell(dataRow, 1).numFmt = "m/d";
    ws.getCell(dataRow, 2).value = rec.hours;
    ws.getCell(dataRow, 3).value = fittings;
    ws.getCell(dataRow, 4).value = amount;
    ws.getCell(dataRow, 5).value = m.name;
    ws.getCell(dataRow, 6).value = "강기쁨";
    dataRow++;
  }

  // 행 28~30: 합계
  ws.getCell("A28").value = "근무 일자 합계";
  ws.getCell("C28").value = m.records.length;
  ws.getCell("D28").value = "일";
  ws.getCell("E28").value = m.name;
  ws.getCell("F28").value = "강기쁨";

  ws.getCell("A29").value = "착장 수 합계";
  ws.getCell("C29").value = totalFittings;
  ws.getCell("D29").value = "벌";

  ws.getCell("A30").value = "지급 금액 합계";
  ws.getCell("C30").value = totalPay;
  ws.getCell("D30").value = "원";
}

export async function generateFittingExcelBuffer(data: ExportData): Promise<Buffer> {
  const { year, month, models } = data;

  // 템플릿 로드 (base64 내장)
  const tmplWb = new ExcelJS.Workbook();
  await tmplWb.xlsx.load(Buffer.from(TEMPLATE_B64, "base64") as never);
  const tmplSheet = tmplWb.worksheets[0];

  const wb = new ExcelJS.Workbook();

  // 합계 시트
  const wsSummary = wb.addWorksheet("합계");
  wsSummary.getColumn(1).width = 13.5;
  wsSummary.getColumn(3).width = 11.75;
  wsSummary.getColumn(4).width = 10.875;
  wsSummary.getColumn(6).width = 15.625;
  wsSummary.getColumn(7).width = 20.625;
  wsSummary.getRow(10).values = ["사업부", "분류", "모델", "근무일 수", "착장 수", "급여", "비고"];

  let sumRow = 11;
  const dept = "DISCOVERY\nQM팀";
  let prevGender = "";
  for (const m of models) {
    const rate = m.hourly_rate ?? 0;
    wsSummary.getRow(sumRow).values = [
      sumRow === 11 ? dept : "",
      "-" !== prevGender ? "-" : "",
      m.name,
      m.records.length,
      m.records.reduce((s, r) => s + Math.round(r.hours * FITTINGS_PER_HOUR), 0),
      m.records.reduce((s, r) => s + Math.round(r.hours * rate), 0),
      "",
    ];
    prevGender = "-";
    sumRow++;
  }

  // 표 시트
  const wsTable = wb.addWorksheet("표");
  wsTable.getColumn(2).width = 13.5;
  wsTable.getColumn(4).width = 10.875;
  wsTable.getColumn(6).width = 15.625;
  wsTable.getColumn(7).width = 15.0;
  wsTable.getRow(4).values = ["", "사업부", "분류", "모델", "근무일 수", "착장 수", "급여", "비고"];

  let tableRow = 5;
  for (const m of models) {
    const rate = m.hourly_rate ?? 0;
    wsTable.getRow(tableRow).values = [
      "", dept, "-", m.name,
      m.records.length,
      m.records.reduce((s, r) => s + Math.round(r.hours * FITTINGS_PER_HOUR), 0),
      m.records.reduce((s, r) => s + Math.round(r.hours * rate), 0),
      "",
    ];
    tableRow++;
  }

  // 모델별 시트: 템플릿 복사 후 값 채우기
  for (const m of models) {
    const ws = wb.addWorksheet(m.name.slice(0, 31));
    await cloneTemplateSheet(tmplSheet, ws);
    fillModelData(ws, m, year, month);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
