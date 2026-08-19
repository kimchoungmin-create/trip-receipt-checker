"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  calculateFuelCost,
  meetingMissingItems,
  naverAddressSearchUrl,
  tripMissingItems,
  type MeetingClaim,
  type TripRound,
} from "./trip-utils";

type ClaimMode = "trip" | "meeting";
type TripField = "date" | "origin" | "destination" | "distanceKm" | "oilPrice";
type TripFile = keyof TripRound["files"];
type MeetingFile = keyof MeetingClaim["files"];

const OPINET_URL = "https://www.opinet.co.kr/";
const FUEL_ECONOMY_URL = "https://min24.energy.or.kr/veec/";
const NAVER_DIRECTIONS_URL = "https://map.naver.com/p/directions";

const emptyTripFiles = () => ({ photo: "", receipt: "", map: "", opinet: "" });
const makeRound = (id: string): TripRound => ({
  id,
  date: "",
  origin: "",
  destination: "",
  distanceKm: "",
  oilPrice: "",
  files: emptyTripFiles(),
});

const emptyMeeting: MeetingClaim = {
  date: "",
  place: "",
  purpose: "",
  attendees: "",
  amount: "",
  files: { receipt: "", record: "", attendees: "" },
};

const money = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

function UploadCard({
  label,
  help,
  filename,
  onChange,
}: {
  label: string;
  help: string;
  filename: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className={`upload-card ${filename ? "has-file" : ""}`}>
      <input type="file" accept="image/*,.pdf" onChange={onChange} />
      <span className="upload-icon" aria-hidden="true">{filename ? "✓" : "+"}</span>
      <span className="upload-copy">
        <strong>{label}</strong>
        <small>{filename || help}</small>
      </span>
    </label>
  );
}

export default function Home() {
  const [mode, setMode] = useState<ClaimMode>("trip");
  const [employee, setEmployee] = useState("");
  const [department, setDepartment] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [vehicleProof, setVehicleProof] = useState("");
  const [rounds, setRounds] = useState<TripRound[]>([makeRound("round-1")]);
  const [meeting, setMeeting] = useState<MeetingClaim>(emptyMeeting);
  const [isDemo, setIsDemo] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [notice, setNotice] = useState("자료는 서버로 전송되지 않으며 현재 브라우저에서만 처리됩니다.");
  const roundCounter = useRef(2);

  const tripMissing = useMemo(
    () => tripMissingItems(rounds, vehicle, efficiency, vehicleProof),
    [rounds, vehicle, efficiency, vehicleProof],
  );
  const meetingMissing = useMemo(() => meetingMissingItems(meeting), [meeting]);
  const missing = mode === "trip" ? tripMissing : meetingMissing;
  const totalTripCost = useMemo(
    () => rounds.reduce((sum, round) => sum + calculateFuelCost(round.distanceKm, efficiency, round.oilPrice), 0),
    [rounds, efficiency],
  );
  const totalChecks = mode === "trip" ? 3 + rounds.length * 8 : 8;
  const completedChecks = Math.max(0, totalChecks - missing.length);
  const progress = Math.round((completedChecks / totalChecks) * 100);

  function updateRound(id: string, field: TripField, value: string) {
    setReviewed(false);
    setRounds((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function updateRoundFile(id: string, field: TripFile, filename: string) {
    setReviewed(false);
    setRounds((items) =>
      items.map((item) =>
        item.id === id ? { ...item, files: { ...item.files, [field]: filename } } : item,
      ),
    );
  }

  function addRound() {
    setRounds((items) => [...items, makeRound(`round-${roundCounter.current++}`)]);
    setReviewed(false);
  }

  function removeRound(id: string) {
    setRounds((items) => (items.length === 1 ? items : items.filter((item) => item.id !== id)));
    setReviewed(false);
  }

  function fileName(event: ChangeEvent<HTMLInputElement>) {
    return event.target.files?.[0]?.name ?? "";
  }

  async function openRoute(round: TripRound) {
    if (!round.origin.trim() || !round.destination.trim()) {
      setNotice("출발지와 도착지 주소를 먼저 입력해 주세요.");
      return;
    }
    const routeText = `출발지: ${round.origin}\n도착지: ${round.destination}`;
    try {
      await navigator.clipboard.writeText(routeText);
      setNotice("두 주소를 복사했습니다. 네이버 지도 길찾기에 붙여 넣고 왕복 거리를 입력하세요.");
    } catch {
      setNotice("네이버 지도에서 입력한 출발지와 도착지를 검색해 왕복 거리를 확인하세요.");
    }
    window.open(NAVER_DIRECTIONS_URL, "_blank", "noopener,noreferrer");
  }

  function openAddressSearch(address: string) {
    if (!address.trim()) {
      setNotice("검색할 주소를 먼저 입력해 주세요.");
      return;
    }
    window.open(naverAddressSearchUrl(address), "_blank", "noopener,noreferrer");
  }

  function loadDemo() {
    setMode("trip");
    setEmployee("김테스트");
    setDepartment("AI전략팀");
    setPurpose("지역 기업 AI 도입 컨설팅 및 성과 점검");
    setVehicle("2024년형 중형 가솔린 승용차 (가상)");
    setEfficiency("12.4");
    setVehicleProof("가상_공인연비_캡처.png");
    setRounds([
      {
        id: "demo-1",
        date: "2026-08-12",
        origin: "서울특별시 중구 세종대로 110",
        destination: "대전광역시 유성구 대학로 291",
        distanceKm: "328.2",
        oilPrice: "1712",
        files: {
          photo: "가상_1회차_현장사진.jpg",
          receipt: "가상_1회차_주유영수증.jpg",
          map: "가상_1회차_네이버지도.png",
          opinet: "가상_1회차_오피넷유가.png",
        },
      },
      {
        id: "demo-2",
        date: "2026-08-14",
        origin: "대전광역시 유성구 대학로 291",
        destination: "충청북도 청주시 상당구 상당로 82",
        distanceKm: "97.6",
        oilPrice: "1706",
        files: {
          photo: "가상_2회차_현장사진.jpg",
          receipt: "가상_2회차_교통비영수증.jpg",
          map: "가상_2회차_네이버지도.png",
          opinet: "가상_2회차_오피넷유가.png",
        },
      },
    ]);
    setIsDemo(true);
    setReviewed(false);
    setNotice("가상 테스트 서류를 불러왔습니다. 모든 증빙명은 예시이며 실제 증빙이 아닙니다.");
  }

  function resetClaim() {
    setEmployee("");
    setDepartment("");
    setPurpose("");
    setVehicle("");
    setEfficiency("");
    setVehicleProof("");
    setRounds([makeRound(`round-${roundCounter.current++}`)]);
    setMeeting(emptyMeeting);
    setIsDemo(false);
    setReviewed(false);
    setNotice("새 신청서를 시작했습니다.");
  }

  function exportClaim() {
    const payload = {
      warning: isDemo ? "가상 테스트용 · 실제 증빙 아님" : undefined,
      type: mode === "trip" ? "출장비" : "회의비",
      applicant: { employee, department, purpose },
      trip: mode === "trip" ? { vehicle, efficiencyKmPerL: efficiency, vehicleProof, rounds, totalFuelCost: totalTripCost } : undefined,
      meeting: mode === "meeting" ? meeting : undefined,
      validation: { ready: missing.length === 0, missing },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${mode === "trip" ? "출장비" : "회의비"}_증빙점검_${isDemo ? "가상_" : ""}${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("점검 결과를 JSON 파일로 저장했습니다. 첨부 파일은 이름만 기록됩니다.");
  }

  function reviewClaim() {
    setReviewed(true);
    setNotice(missing.length === 0 ? "필수 항목이 모두 준비됐습니다." : `누락된 항목 ${missing.length}개를 확인해 주세요.`);
  }

  return (
    <main className="app-shell">
      {isDemo && <div className="demo-ribbon">가상 테스트용 · 실제 증빙 아님</div>}
      <header className="topbar">
        <div className="brand-mark">TR</div>
        <div>
          <p className="eyebrow">TRIP RECEIPT CHECKER</p>
          <h1>출장·회의비 증빙 점검</h1>
        </div>
        <div className="top-actions">
          <span className="mode-pill">인증키 없는 기본 모드</span>
          <button className="text-button" type="button" onClick={resetClaim}>초기화</button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <span className="step-kicker">증빙 누락 사전 점검</span>
          <h2>빠진 증빙은 잡고,<br />출장비는 한 번에 계산하세요.</h2>
          <p>회차별 거리·유가와 차량 연비를 합쳐 예상 유류비를 계산하고, 제출 전에 필요한 증빙을 확인합니다.</p>
          <div className="hero-actions no-print">
            <button className="primary" type="button" onClick={() => document.getElementById("claim-form")?.scrollIntoView({ behavior: "smooth" })}>신청서 작성</button>
            <button className="secondary" type="button" onClick={loadDemo}>가상 서류로 시험</button>
          </div>
        </div>
        <aside className="status-card" aria-live="polite">
          <div className="status-head"><span>제출 준비도</span><strong>{progress}%</strong></div>
          <div className="progress"><i style={{ width: `${progress}%` }} /></div>
          <div className="status-numbers"><span>완료 {completedChecks}</span><span>필요 {totalChecks}</span></div>
          <p>{missing.length === 0 ? "모든 필수 항목이 준비됐습니다." : `현재 ${missing.length}개 항목이 비어 있습니다.`}</p>
        </aside>
      </section>

      <section className="mode-switch no-print" aria-label="비용 유형">
        <button type="button" className={mode === "trip" ? "active" : ""} onClick={() => { setMode("trip"); setReviewed(false); }}>출장비</button>
        <button type="button" className={mode === "meeting" ? "active" : ""} onClick={() => { setMode("meeting"); setReviewed(false); }}>회의비</button>
      </section>

      <section className="workspace-grid" id="claim-form">
        <div className="main-column">
          <article className="panel">
            <div className="panel-title">
              <div><span className="step-kicker">01 · 기본 정보</span><h3>신청자와 집행 목적</h3></div>
              <span className="required-note">* 필수 입력</span>
            </div>
            <div className="fields two">
              <label>신청자<input value={employee} onChange={(e) => setEmployee(e.target.value)} placeholder="성명" /></label>
              <label>부서<input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="소속 부서" /></label>
            </div>
            <label>출장·회의 목적<textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="업무 목적과 주요 내용을 적어 주세요." rows={3} /></label>
          </article>

          {mode === "trip" ? (
            <>
              <article className="panel">
                <div className="panel-title">
                  <div><span className="step-kicker">02 · 회차별 경로</span><h3>출장일·거리·유가</h3></div>
                  <button type="button" className="small-button no-print" onClick={addRound}>+ 회차 추가</button>
                </div>
                <div className="source-guide">
                  <strong>키 없이 확인하는 순서</strong>
                  <span>주소 입력 → 네이버 지도 길찾기 → 왕복 거리 입력 → 오피넷 출장일 유가 입력</span>
                </div>
                <div className="round-stack">
                  {rounds.map((round, index) => {
                    const roundCost = calculateFuelCost(round.distanceKm, efficiency, round.oilPrice);
                    return (
                      <section className="round-card" key={round.id}>
                        <div className="round-head">
                          <div><span className="round-number">{String(index + 1).padStart(2, "0")}</span><strong>{index + 1}회차</strong></div>
                          {rounds.length > 1 && <button type="button" className="remove-button no-print" onClick={() => removeRound(round.id)}>삭제</button>}
                        </div>
                        <div className="fields three route-fields">
                          <label>출장일 *<input type="date" value={round.date} onChange={(e) => updateRound(round.id, "date", e.target.value)} /></label>
                          <label>출발지 주소 *<input value={round.origin} onChange={(e) => updateRound(round.id, "origin", e.target.value)} placeholder="도로명 주소" /></label>
                          <label>도착지 주소 *<input value={round.destination} onChange={(e) => updateRound(round.id, "destination", e.target.value)} placeholder="도로명 주소" /></label>
                        </div>
                        <div className="link-row no-print">
                          <button type="button" onClick={() => openAddressSearch(round.origin)}>출발지 검색 ↗</button>
                          <button type="button" onClick={() => openAddressSearch(round.destination)}>도착지 검색 ↗</button>
                          <button type="button" className="route-button" onClick={() => openRoute(round)}>네이버 길찾기 열기 ↗</button>
                        </div>
                        <div className="fields two metric-fields">
                          <label>네이버 지도 왕복 거리(km) *<input inputMode="decimal" type="number" min="0" step="0.1" value={round.distanceKm} onChange={(e) => updateRound(round.id, "distanceKm", e.target.value)} placeholder="예: 328.2" /></label>
                          <label>오피넷 출장일 유가(원/L) *
                            <span className="input-action"><input inputMode="decimal" type="number" min="0" value={round.oilPrice} onChange={(e) => updateRound(round.id, "oilPrice", e.target.value)} placeholder="예: 1712" /><a href={OPINET_URL} target="_blank" rel="noreferrer">확인 ↗</a></span>
                          </label>
                        </div>
                        <div className="round-total"><span>이 회차 예상 유류비</span><strong>{money.format(roundCost)}원</strong></div>
                        <div className="upload-grid">
                          <UploadCard label="수행 증빙 사진" help="회차별 현장 사진" filename={round.files.photo} onChange={(e) => updateRoundFile(round.id, "photo", fileName(e))} />
                          <UploadCard label="주유·교통 영수증" help="결제일·금액이 보이게" filename={round.files.receipt} onChange={(e) => updateRoundFile(round.id, "receipt", fileName(e))} />
                          <UploadCard label="네이버 지도 캡처" help="두 주소와 거리가 보이게" filename={round.files.map} onChange={(e) => updateRoundFile(round.id, "map", fileName(e))} />
                          <UploadCard label="오피넷 유가 캡처" help="출장일과 유종이 보이게" filename={round.files.opinet} onChange={(e) => updateRoundFile(round.id, "opinet", fileName(e))} />
                        </div>
                      </section>
                    );
                  })}
                </div>
              </article>

              <article className="panel vehicle-panel">
                <div className="panel-title"><div><span className="step-kicker">03 · 차량 기준</span><h3>차종과 공인연비</h3></div></div>
                <div className="fields two">
                  <label>차종·연식 *<input value={vehicle} onChange={(e) => { setVehicle(e.target.value); setReviewed(false); }} placeholder="예: 2024년형 ○○ 1.6 가솔린" /></label>
                  <label>복합연비(km/L) *<input inputMode="decimal" type="number" min="0" step="0.1" value={efficiency} onChange={(e) => { setEfficiency(e.target.value); setReviewed(false); }} placeholder="예: 12.4" /></label>
                </div>
                <div className="link-row no-print">
                  <a href={FUEL_ECONOMY_URL} target="_blank" rel="noreferrer">한국에너지공단 공인연비 ↗</a>
                  <a href={`https://search.naver.com/search.naver?query=${encodeURIComponent(`${vehicle || "차종"} 복합연비`)}`} target="_blank" rel="noreferrer">포털에서 차종 연비 검색 ↗</a>
                </div>
                <div className="single-upload"><UploadCard label="차종 공인연비 캡처" help="차종·연식·복합연비가 보이게" filename={vehicleProof} onChange={(e) => { setVehicleProof(fileName(e)); setReviewed(false); }} /></div>
                <div className="formula-card">
                  <div><span>전체 예상 유류비</span><small>회차별 거리 ÷ 복합연비 × 해당일 유가의 합계</small></div>
                  <strong>{money.format(totalTripCost)}원</strong>
                </div>
              </article>
            </>
          ) : (
            <article className="panel">
              <div className="panel-title"><div><span className="step-kicker">02 · 회의 내역</span><h3>회의비 집행 정보</h3></div></div>
              <div className="fields two">
                <label>회의일 *<input type="date" value={meeting.date} onChange={(e) => setMeeting({ ...meeting, date: e.target.value })} /></label>
                <label>회의 장소 *<input value={meeting.place} onChange={(e) => setMeeting({ ...meeting, place: e.target.value })} placeholder="장소 또는 상호" /></label>
              </div>
              <label>회의 목적 *<textarea rows={3} value={meeting.purpose} onChange={(e) => setMeeting({ ...meeting, purpose: e.target.value })} placeholder="안건과 업무 관련성을 적어 주세요." /></label>
              <div className="fields two meeting-fields">
                <label>참석자 *<input value={meeting.attendees} onChange={(e) => setMeeting({ ...meeting, attendees: e.target.value })} placeholder="성명 또는 소속 포함" /></label>
                <label>집행 금액(원) *<input type="number" min="0" value={meeting.amount} onChange={(e) => setMeeting({ ...meeting, amount: e.target.value })} placeholder="0" /></label>
              </div>
              <div className="upload-grid meeting-uploads">
                {([[
                  "receipt", "결제 영수증", "일시·금액·상호가 보이게",
                ], [
                  "record", "회의 수행 증빙", "회의 사진 또는 회의록",
                ], [
                  "attendees", "참석자 명단", "소속·성명 확인 자료",
                ]] as [MeetingFile, string, string][]).map(([key, label, help]) => (
                  <UploadCard key={key} label={label} help={help} filename={meeting.files[key]} onChange={(e) => setMeeting({ ...meeting, files: { ...meeting.files, [key]: fileName(e) } })} />
                ))}
              </div>
            </article>
          )}
        </div>

        <aside className="side-column">
          <section className={`panel validation-panel ${reviewed ? "reviewed" : ""}`}>
            <div className="panel-title"><div><span className="step-kicker">제출 전 확인</span><h3>누락 점검</h3></div><span className={`count-badge ${missing.length === 0 ? "complete" : ""}`}>{missing.length}</span></div>
            {missing.length === 0 ? (
              <div className="all-clear"><span>✓</span><strong>필수 항목 준비 완료</strong><p>기관 내부 규정과 원본 식별 상태를 마지막으로 확인하세요.</p></div>
            ) : (
              <ul className="missing-list">
                {missing.map((item) => <li key={item}><span>!</span>{item}</li>)}
              </ul>
            )}
            <button type="button" className="primary wide no-print" onClick={reviewClaim}>누락 다시 점검</button>
          </section>

          <section className="panel source-panel">
            <span className="step-kicker">공식 확인처</span>
            <h3>자료 출처 바로가기</h3>
            <a href={NAVER_DIRECTIONS_URL} target="_blank" rel="noreferrer"><span>거리·경로</span><strong>네이버 지도</strong><i>↗</i></a>
            <a href={OPINET_URL} target="_blank" rel="noreferrer"><span>출장일 유가</span><strong>오피넷</strong><i>↗</i></a>
            <a href={FUEL_ECONOMY_URL} target="_blank" rel="noreferrer"><span>공인 복합연비</span><strong>자동차연비센터</strong><i>↗</i></a>
            <p>공식 API 자동 연동에는 각 서비스의 인증키가 필요합니다. 이 버전은 공식 페이지에서 확인한 값을 직접 입력하는 방식입니다.</p>
          </section>

          <section className="panel privacy-panel">
            <span aria-hidden="true">⌁</span>
            <div><strong>파일은 업로드되지 않습니다</strong><p>선택한 파일은 서버에 저장하지 않고 이름과 첨부 여부만 현재 화면에서 확인합니다.</p></div>
          </section>
        </aside>
      </section>

      <section className="action-dock no-print">
        <p aria-live="polite">{notice}</p>
        <div>
          <button type="button" className="secondary" onClick={exportClaim}>JSON 저장</button>
          <button type="button" className="secondary" onClick={() => window.print()}>인쇄·PDF</button>
          <button type="button" className="primary" onClick={reviewClaim}>제출 전 점검</button>
        </div>
      </section>

      <footer>
        <p>이 도구는 증빙 누락을 사전에 확인하는 보조 수단입니다. 최종 인정 여부와 지급 기준은 소속 기관의 회계 규정을 따릅니다.</p>
      </footer>
    </main>
  );
}
