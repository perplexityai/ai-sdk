import { tool } from "ai";
import { z } from "zod";
import packageJson from "../../package.json";
import type { PerplexitySearchConfig, PerplexitySearchResponse } from "../types";

export function perplexitySearch(config: PerplexitySearchConfig = {}) {
  const {
    apiKey = process.env.PERPLEXITY_API_KEY,
  } = config;

  return tool({
    description: "Search the web using Perplexity's Search API for real-time information, news, research papers, and articles. Provides ranked search results with advanced filtering options including domain, language, date range, and recency filters.",
    inputSchema: z.object({
      query: z.union([
        z.string().min(1).max(500),
        z.array(z.string().min(1).max(500)).max(5)
      ]).describe("Search query (string) or multiple queries (array of up to 5 strings). Multi-query searches return combined results from all queries."),
      
      search_type: z.enum(['web', 'fast']).default('web').optional().describe("Search type: 'web' for general web search (default), or 'fast' for lower-latency, lower-cost web search."),
      
      max_results: z.number().int().min(1).max(20).default(10).optional().describe("Maximum number of search results to return (1-20, default: 10)"),

      max_tokens: z.number().int().min(1).max(1000000).optional().describe("Maximum total webpage content tokens to return across all search results (1-1000000)"),

      max_tokens_per_page: z.number().int().min(1).max(1000000).default(1024).optional().describe("Maximum number of tokens to extract per search result page (1-1000000, default: 1024)"),
      
      country: z.string().length(2).optional().describe("Two-letter ISO 3166-1 alpha-2 country code for regional search results (e.g., 'US', 'GB', 'FR')"),
      
      search_domain_filter: z.array(z.string()).max(20).optional().describe("List of domains to include or exclude from search results (max 20). To include: ['nature.com', 'science.org']. To exclude: ['-example.com', '-spam.net']"),
      
      search_language_filter: z.array(z.string().length(2)).max(20).optional().describe("List of ISO 639-1 language codes to filter results (max 20, lowercase). Examples: ['en', 'fr', 'de']"),
      
      search_after_date: z.string().regex(/^\d{1,2}\/\d{1,2}\/\d{4}$/).optional().describe("Include only results published after this date. Format: 'MM/DD/YYYY' (e.g., '3/1/2025'). Cannot be used with search_recency_filter."),
      
      search_before_date: z.string().regex(/^\d{1,2}\/\d{1,2}\/\d{4}$/).optional().describe("Include only results published before this date. Format: 'MM/DD/YYYY' (e.g., '3/15/2025'). Cannot be used with search_recency_filter."),
      
      last_updated_after_filter: z.string().regex(/^\d{1,2}\/\d{1,2}\/\d{4}$/).optional().describe("Include only results updated after this date. Format: 'MM/DD/YYYY' (e.g., '3/1/2025')."),

      last_updated_before_filter: z.string().regex(/^\d{1,2}\/\d{1,2}\/\d{4}$/).optional().describe("Include only results updated before this date. Format: 'MM/DD/YYYY' (e.g., '3/15/2025')."),

      search_recency_filter: z.enum(['hour', 'day', 'week', 'month', 'year']).optional().describe("Filter results by relative time period. Cannot be used with search_after_date or search_before_date.")
    }),
    execute: async ({ 
      query, 
      search_type,
      max_results = 10, 
      max_tokens,
      max_tokens_per_page = 1024, 
      country, 
      search_domain_filter, 
      search_language_filter, 
      search_after_date, 
      search_before_date, 
      last_updated_after_filter,
      last_updated_before_filter,
      search_recency_filter 
    }): Promise<PerplexitySearchResponse> => {
      if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY is required. Set it in environment variables or pass it in config.");
      }

      const requestBody: Record<string, unknown> = {
        query,
        max_results,
        max_tokens_per_page,
      };

      if (search_type !== undefined) {
        requestBody.search_type = search_type;
      }
      if (max_tokens !== undefined) {
        requestBody.max_tokens = max_tokens;
      }
      if (country !== undefined) {
        requestBody.country = country;
      }
      if (search_domain_filter && search_domain_filter.length > 0) {
        requestBody.search_domain_filter = search_domain_filter;
      }
      if (search_language_filter && search_language_filter.length > 0) {
        requestBody.search_language_filter = search_language_filter;
      }
      if (search_after_date !== undefined) {
        requestBody.search_after_date_filter = search_after_date;
      }
      if (search_before_date !== undefined) {
        requestBody.search_before_date_filter = search_before_date;
      }
      if (search_recency_filter !== undefined) {
        requestBody.search_recency_filter = search_recency_filter;
      }
      if (last_updated_after_filter !== undefined) {
        requestBody.last_updated_after_filter = last_updated_after_filter;
      }
      if (last_updated_before_filter !== undefined) {
        requestBody.last_updated_before_filter = last_updated_before_filter;
      }

      try {
        const response = await fetch('https://api.perplexity.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'X-Pplx-Integration': `perplexity-ai-sdk/${packageJson.version}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Perplexity Search API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as PerplexitySearchResponse;
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to search with Perplexity Search API: ${error.message}`);
        }
        throw error;
      }
    },
  });
}
