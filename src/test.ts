import { perplexitySearch } from "./index";

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

  console.log("\nAll tests passed!");
  console.log("Note: To test with actual API calls, set PERPLEXITY_API_KEY in your .env file");
  console.log("and use the tool with generateText() from the 'ai' package.");
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
