import assert from "node:assert/strict";
import test from "node:test";

import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

const {
  buildBeatmapsetSearchParams,
  mapUiStatusesToApiStatuses,
} = jiti("../lib/hooks/api/beatmap/beatmapsetSearchParams.ts");

test("mapUiStatusesToApiStatuses maps known statuses to RankStatusInt numbers", () => {
  assert.deepEqual(
    mapUiStatusesToApiStatuses(["Ranked", "Loved", "Approved"]),
    [1, 4, 2],
  );
});

test("buildBeatmapsetSearchParams converts page to offset", () => {
  const params = buildBeatmapsetSearchParams({
    page: 3,
    limit: 24,
  });

  assert.equal(params.get("offset"), "48");
  assert.equal(params.get("limit"), "24");
});

test("buildBeatmapsetSearchParams builds repeated numeric status params", () => {
  const params = buildBeatmapsetSearchParams({
    page: 1,
    limit: 24,
    status: ["Ranked", "Loved", "Approved"],
  });

  assert.deepEqual(params.getAll("status"), ["1", "4", "2"]);
});

test("buildBeatmapsetSearchParams omits status when statuses are empty or invalid", () => {
  const emptyParams = buildBeatmapsetSearchParams({
    page: 1,
    limit: 24,
    status: [],
  });

  const invalidParams = buildBeatmapsetSearchParams({
    page: 1,
    limit: 24,
    status: ["UnknownStatus", "BadStatus"],
  });

  assert.deepEqual(emptyParams.getAll("status"), []);
  assert.deepEqual(invalidParams.getAll("status"), []);
});
