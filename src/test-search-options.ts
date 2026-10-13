import assert from "node:assert/strict";
import { z } from "zod";
import { perplexitySearch, type PerplexitySearchResponse } from "./index";

export async function testSearchOptions() {
  const search = perplexitySearch({ apiKey: "test-api-key" });
  const schema = search.inputSchema;
  assert(schema instanceof z.ZodObject);
  assert.equal(schema.parse({ query: "research" }).search_type, "web");

  for (const key of ["max_tokens", "max_tokens_per_page"] as const) {
    for (const value of [1, 256, 2048, 1000000]) {
      assert(schema.safeParse({ query: "research", [key]: value }).success);
    }
    for (const value of [0, -1, 1.5, 1000001]) {
      assert(!schema.safeParse({ query: "research", [key]: value }).success);
    }
  }
  assert(schema.safeParse({ query: "research", search_language_filter: Array(20).fill("en") }).success);
  assert(!schema.safeParse({ query: "research", search_language_filter: Array(21).fill("en") }).success);
  assert(!schema.safeParse({ query: "research", search_type: "people" }).success);
  assert(!schema.safeParse({ query: "research", search_recency_filter: "minute" }).success);
  assert(!schema.safeParse({ query: "research", max_results: 21 }).success);
  assert(!schema.safeParse({ query: "research", max_results: 1.5 }).success);
  for (const key of ["last_updated_after_filter", "last_updated_before_filter"]) {
    assert(!schema.safeParse({ query: "research", [key]: "2025-03-01" }).success);
  }

  const response: PerplexitySearchResponse = {
    id: "test-search",
    results: [
      { title: "No dates", url: "https://example.com", snippet: "Missing" },
      { title: "Null dates", url: "https://example.com", snippet: "Null", date: null, last_updated: null },
      { title: "Known dates", url: "https://example.com", snippet: "Known", date: "2025-03-01", last_updated: "2025-03-15" },
    ],
  };
  const originalFetch = globalThis.fetch;
  let requestBody: unknown;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "https://api.perplexity.ai/search");
    assert.equal(init?.method, "POST");
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const cases = [
      {},
      { search_type: "web" },
      { search_type: "fast", search_recency_filter: "hour" },
      { max_tokens: 1, max_tokens_per_page: 1 },
      { max_tokens: 1000000, max_tokens_per_page: 1000000 },
      { last_updated_after_filter: "3/1/2025" },
      { last_updated_before_filter: "3/15/2025" },
      {
        search_type: "fast",
        max_tokens: 5000,
        max_tokens_per_page: 3000,
        search_language_filter: Array(20).fill("en"),
        last_updated_after_filter: "3/1/2025",
        last_updated_before_filter: "3/15/2025",
      },
    ] as const;

    for (const options of cases) {
      assert(schema.safeParse({ query: "research", ...options }).success);
      const result = await search.execute!(
        { query: "research", ...options },
        { toolCallId: "test", messages: [] },
      );
      assert.deepEqual(requestBody, {
        query: "research",
        max_results: 10,
        max_tokens_per_page: 1024,
        ...options,
      });
      assert.deepEqual(result, response);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log("  Search options match the API contract and preserve nullable dates");
}
