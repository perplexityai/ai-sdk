import assert from "node:assert/strict";
import { perplexitySearch } from "./index";

async function testDateFilterRequests() {
  const search = perplexitySearch({ apiKey: "test-api-key" });
  const originalFetch = globalThis.fetch;
  let requestBody: unknown;
  const response = { results: [], id: "test-search" };

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
      [{ search_after_date: "3/1/2025" }, { search_after_date_filter: "3/1/2025" }],
      [{ search_before_date: "3/15/2025" }, { search_before_date_filter: "3/15/2025" }],
      [
        { search_after_date: "3/1/2025", search_before_date: "3/15/2025" },
        { search_after_date_filter: "3/1/2025", search_before_date_filter: "3/15/2025" },
      ],
      [{}, {}],
    ] as const;

    for (const [input, expected] of cases) {
      const result = await search.execute!(
        { query: "climate research", ...input },
        { toolCallId: "test", messages: [] },
      );
      assert.deepEqual(requestBody, {
        query: "climate research",
        max_results: 10,
        max_tokens_per_page: 1024,
        ...expected,
      });
      assert.deepEqual(result, response);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log("  Date filters use canonical API fields and preserve tool arguments");
}

async function main() {
  console.log("Testing Perplexity Search Tool...\n");

  const tool = perplexitySearch();
  console.log("  Tool created successfully");

  if (!tool.execute) {
    throw new Error("Tool missing execute function");
  }
  if (!tool.description) {
    throw new Error("Tool missing description");
  }
  if (!tool.inputSchema) {
    throw new Error("Tool missing inputSchema");
  }
  console.log("  Tool structure is valid");
  console.log(`  Description: ${tool.description.substring(0, 80)}...`);

  const schema = tool.inputSchema;
  if (typeof schema !== 'object' || schema === null) {
    throw new Error("Schema is not a valid object");
  }
  console.log("  Input schema is valid");
  console.log("  Schema type:", typeof schema);

  if (typeof tool.execute !== 'function') {
    throw new Error("Execute is not a function");
  }
  console.log("  Execute function is valid");
  
  const originalKey = process.env.PERPLEXITY_API_KEY;
  delete process.env.PERPLEXITY_API_KEY;
  
  const toolWithoutKey = perplexitySearch();
  if (!toolWithoutKey.execute || !toolWithoutKey.description || !toolWithoutKey.inputSchema) {
    throw new Error("Tool structure invalid when created without API key");
  }
  console.log("  Tool can be created without API key (validation happens on execute)");
  
  if (originalKey) {
    process.env.PERPLEXITY_API_KEY = originalKey;
  }

  await testDateFilterRequests();

  console.log("\nAll tests passed!");
  console.log("Note: To test with actual API calls, set PERPLEXITY_API_KEY in your .env file");
  console.log("and use the tool with generateText() from the 'ai' package.");
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
