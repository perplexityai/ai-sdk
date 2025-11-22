# Perplexity Search for the Vercel AI SDK

[![npm version](https://img.shields.io/npm/v/%40perplexity-ai%2Fai-sdk?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/@perplexity-ai/ai-sdk)

A powerful web search tool powered by Perplexity's Search API for use with the Vercel AI SDK. Search the web for real-time information, news, research papers, and articles with advanced filtering options including domain, language, date range, and recency filters.

## Installation

```bash
pnpm install @perplexity-ai/ai-sdk
```

## Usage

```typescript
import { perplexitySearch } from "@perplexity-ai/ai-sdk";
import { generateText, gateway } from "ai";

const result = await generateText({
  model: gateway("openai/gpt-4o-mini"),
  prompt: "What are the latest AI developments? Use search to find current information.",
  tools: {
    search: perplexitySearch(),
  },
});
```

### Options

You can configure the API key for your tool. The `perplexitySearch` tool accepts an optional configuration object:

```typescript
type PerplexitySearchConfig = {
  apiKey?: string;
};
```

## Features

- **Real-time web search** using Perplexity's continuously refreshed index
- **Multi-query support** - search with multiple queries in a single request
- **Advanced filtering** - domain, language, date range, and recency filters
- **Regional search** - get geographically relevant results by country
- **Flexible content extraction** - control how much content is extracted per page
- **Type-safe** - Full TypeScript support with comprehensive type definitions

## Advanced Usage

### Regional Search

```typescript
const { text } = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: 'What are the latest government policies on renewable energy in the US?',
  tools: {
    search: perplexitySearch(),
  },
});
```

The AI can use the `country` parameter to get region-specific results:

```typescript
// The AI will automatically use parameters like:
// { query: "government policies renewable energy", country: "US" }
```

### Domain Filtering

```typescript
const { text } = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: 'Find recent climate change research from scientific journals only.',
  tools: {
    search: perplexitySearch(),
  },
});
```

The AI can filter to specific domains:

```typescript
// The AI might use:
// { 
//   query: "climate change research", 
//   search_domain_filter: ["nature.com", "science.org", "pnas.org"] 
// }
```

### Multi-Query Search

```typescript
const { text } = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: 'Research AI safety, AGI development, and AI regulation. Use multiple searches.',
  tools: {
    search: perplexitySearch(),
  },
});
```

The AI can perform multiple searches:

```typescript
// The AI might use:
// { 
//   query: ["AI safety research", "AGI development timeline", "AI regulation 2025"] 
// }
```

## Configuration Options

The AI can use these parameters when calling the search tool:

- `query` - Search query (string or array of up to 5 strings)
- `max_results` - Number of results (1-20, default: 10)
- `max_tokens_per_page` - Content extraction limit (256-2048, default: 1024)
- `country` - ISO country code for regional results (e.g., "US", "GB")
- `search_domain_filter` - Include/exclude domains (max 20)
- `search_language_filter` - Language filtering (max 10 ISO codes)
- `search_after_date` - Results after date (MM/DD/YYYY format)
- `search_before_date` - Results before date (MM/DD/YYYY format)
- `search_recency_filter` - Time-based filtering ("day", "week", "month", "year")

## API Configuration

You can also pass the API key directly:

```typescript
import { perplexitySearch } from "@perplexity-ai/ai-sdk";

const search = perplexitySearch({
  apiKey: "your-api-key-here"
});
```

## Response Format

The tool returns structured search results:

```typescript
{
  results: [
    {
      title: "Article Title",
      url: "https://example.com/article",
      snippet: "Content preview...",
      date: "2025-01-15",
      last_updated: "2025-01-20"
    }
  ],
  id: "search-request-id"
}
```

## Development

### Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file:

```bash
cp env.example .env
```

4. Add your Perplexity API key to `.env`

### Testing

Test your tool locally:

```bash
pnpm test
```

### Building

Build the package:

```bash
pnpm build
```

### Publishing

Before publishing, update the package name in `package.json` to your desired package name.

The package automatically builds before publishing:

```bash
pnpm publish
```

## Project Structure

```
.
├── src/
│   ├── tools/
│   │   └── perplexity-search.ts  # Perplexity search tool implementation
│   ├── types.ts                  # TypeScript type definitions
│   ├── index.ts                  # Tool exports
│   └── test.ts                   # Test script
├── dist/                         # Build output (generated)
├── package.json
├── tsconfig.json
├── env.example
├── .gitignore
└── README.md
```

## License

MIT

## Links

- [Perplexity Search API Documentation](https://docs.perplexity.ai/guides/search-quickstart)
- [Get API Key](https://www.perplexity.ai/account/api/keys)
- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/foundations/tools#using-ready-made-tool-packages)
