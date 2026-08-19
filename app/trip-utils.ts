export type TripRound = {
  id: string;
  date: string;
  origin: string;
  destination: string;
  distanceKm: string;
  oilPrice: string;
  files: Record<"photo" | "receipt" | "map" | "opinet", string>;
};

export type MeetingClaim = {
  date: string;
  place: string;
  purpose: string;
  attendees: string;
  amount: string;
  files: Record<"receipt" | "record" | "attendees", string>;
};

export function calculateFuelCost(
  distanceKm: string | number,
  efficiencyKmPerL: string | number,
  oilPricePerL: string | number,
) {
  const distance = Number(distanceKm);
  const efficiency = Number(efficiencyKmPerL);
  const oilPrice = Number(oilPricePerL);
  if (distance <= 0 || efficiency <= 0 || oilPrice <= 0) return 0;
  return Math.round((distance / efficiency) * oilPrice);
}

export function tripMissingItems(
  rounds: TripRound[],
  vehicle: string,
  efficiency: string,
  vehicleProof = "",
) {
  const missing: string[] = [];
  if (!vehicle.trim()) missing.push("차종");
  if (Number(efficiency) <= 0) missing.push("공인 복합연비");
  if (!vehicleProof) missing.push("차종 공인연비 캡처");
  rounds.forEach((round, index) => {
    const label = `${index + 1}회차`;
    if (!round.date) missing.push(`${label} 출장일`);
    if (!round.origin.trim() || !round.destination.trim()) missing.push(`${label} 출발·도착 주소`);
    if (Number(round.distanceKm) <= 0) missing.push(`${label} 네이버 지도 거리`);
    if (Number(round.oilPrice) <= 0) missing.push(`${label} 오피넷 출장일 유가`);
    if (!round.files.photo) missing.push(`${label} 수행 증빙 사진`);
    if (!round.files.receipt) missing.push(`${label} 주유·교통비 영수증`);
    if (!round.files.map) missing.push(`${label} 네이버 지도 캡처`);
    if (!round.files.opinet) missing.push(`${label} 오피넷 유가 캡처`);
  });
  return missing;
}

export function meetingMissingItems(claim: MeetingClaim) {
  const missing: string[] = [];
  if (!claim.date) missing.push("회의일");
  if (!claim.place.trim()) missing.push("회의 장소");
  if (!claim.purpose.trim()) missing.push("회의 목적");
  if (!claim.attendees.trim()) missing.push("참석자");
  if (Number(claim.amount) <= 0) missing.push("집행 금액");
  if (!claim.files.receipt) missing.push("결제 영수증");
  if (!claim.files.record) missing.push("회의 수행 증빙");
  if (!claim.files.attendees) missing.push("참석자 명단");
  return missing;
}

export function naverAddressSearchUrl(address: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(address.trim())}`;
}
