export interface PerplexitySearchConfig {
  /**
   * API key for authenticating requests to Perplexity Search API.
   * If not provided, will use PERPLEXITY_API_KEY environment variable.
   */
  apiKey?: string;
}

/**
 * Individual search result from Perplexity Search API
 */
export interface PerplexitySearchResult {
  /**
   * Title of the search result
   */
  title: string;

  /**
   * URL of the search result
   */
  url: string;

  /**
   * Text snippet/preview of the content
   */
  snippet: string;

  /**
   * Publication date of the content
   */
  date?: string;

  /**
   * Last updated date of the content
   */
  last_updated?: string;
}

/**
 * Response from Perplexity Search API
 */
export interface PerplexitySearchResponse {
  /**
   * Array of search results
   */
  results: PerplexitySearchResult[];

  /**
   * Unique identifier for this search request
   */
  id: string;
}
