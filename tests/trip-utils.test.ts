import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateFuelCost,
  meetingMissingItems,
  naverAddressSearchUrl,
  tripMissingItems,
  type MeetingClaim,
  type TripRound,
} from "../app/trip-utils.ts";

test("거리·연비·유가로 유류비를 계산한다", () => {
  assert.equal(calculateFuelCost(328.2, 12.4, 1712), 45313);
  assert.equal(calculateFuelCost("", 12.4, 1712), 0);
  assert.equal(calculateFuelCost(100, 0, 1712), 0);
});

test("회차별 필수 증빙과 차량 연비 증빙을 점검한다", () => {
  const round: TripRound = {
    id: "1",
    date: "2026-08-12",
    origin: "서울특별시 중구 세종대로 110",
    destination: "대전광역시 유성구 대학로 291",
    distanceKm: "328.2",
    oilPrice: "1712",
    files: { photo: "photo.jpg", receipt: "receipt.jpg", map: "map.png", opinet: "oil.png" },
  };
  assert.deepEqual(tripMissingItems([round], "가상 차량", "12.4", "fuel.png"), []);
  assert.deepEqual(tripMissingItems([{ ...round, files: { ...round.files, map: "" } }], "가상 차량", "12.4", "fuel.png"), ["1회차 네이버 지도 캡처"]);
});

test("회의비 필수 자료를 점검한다", () => {
  const meeting: MeetingClaim = {
    date: "2026-08-12",
    place: "회의실",
    purpose: "사업 점검",
    attendees: "김테스트 외 2명",
    amount: "90000",
    files: { receipt: "receipt.jpg", record: "minutes.pdf", attendees: "list.pdf" },
  };
  assert.deepEqual(meetingMissingItems(meeting), []);
});

test("네이버 주소 검색 URL을 안전하게 만든다", () => {
  assert.equal(
    naverAddressSearchUrl("서울특별시 중구 세종대로 110"),
    "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%A4%91%EA%B5%AC%20%EC%84%B8%EC%A2%85%EB%8C%80%EB%A1%9C%20110",
  );
});
