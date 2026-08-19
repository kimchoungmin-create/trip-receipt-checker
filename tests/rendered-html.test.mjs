import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("https://expense-checker.example/", {
      headers: {
        accept: "text/html",
        "x-forwarded-host": "expense-checker.example",
        "x-forwarded-proto": "https",
      },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("출장·회의비 점검 화면과 공유 메타데이터를 렌더링한다", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>출장·회의비 증빙 점검<\/title>/);
  assert.match(html, /빠진 증빙은 잡고/);
  assert.match(html, /필수 증빙 누락을 한 번에 확인/);
  assert.match(html, /https:\/\/expense-checker\.example\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/);
});
