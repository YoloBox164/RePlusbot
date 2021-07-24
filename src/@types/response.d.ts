interface ExchangeRateAPIResponse {
  result: "success" | "error";
  /** https://www.exchangerate-api.com/docs */
  documentation?: string;
  /** https://www.exchangerate-api.com/terms */
  terms_of_use?: string;
  /** Milliseconds */
  time_last_update_unix?: number;
  /**"Fri, 27 Mar 2020 00:00:00 +0000"*/
  time_last_update_utc?: string;
  /** Milliseconds */
  time_next_update_unix?: number;
  /** "Sat, 28 Mar 2020 01:00:00 +0000"*/
  time_next_update_utc?: string;
  /** ISO 4217 Three Letter Currency Code */
  base_code?: string;
  /** ISO 4217 Three Letter Currency Code */
  target_code?: string;
  conversion_rate?: number;
  conversion_result?: number;
  /**
   *`error-type` can be any of the following:
   * * "unsupported-code" if we don't support the supplied currency code ([see supported currencies...](https://www.exchangerate-api.com/docs/supported-currencies)).
   * * "malformed-request" when some part of your request doesn't follow the structure shown above.
   * * "invalid-key" when your API key is not valid.
   * * "inactive-account" if your email address wasn't confirmed.
   * * "quota-reached" when your account has reached the the number of requests allowed by your plan.
   */
  "error-type"?: "unsupported-code" | "malformed-request" | "invalid-key" | "inactive-account" | "quota-reached";
}

interface ISOCurrencyMapResponse {
  [x: string]: {
    symbol: string;
    /** ISO 4217 Three Letter Currency Code */
    code: string;
    symbol_native: string;
    decimal_digits: number;
    rounding: number;
  };
}

interface CatAPIResponse {
  id: string;
  url: string;
  categories: {
    id: number;
    name: string;
  }[];
  breeds: {
    id: string;
    name: string;
    temperament: string;
    life_span: string;
    alt_names: string;
    wikipedia_url: string;
    origin: string;
    weight_imperial: string;
    experimental: boolean;
    hairless: boolean;
    natural: boolean;
    rare: boolean;
    rex: boolean;
    suppress_tail: boolean;
    short_legs: boolean;
    hypoallergenic: boolean;
    adaptaboility: 1 | 2 | 3 | 4 | 5;
    affection_level: 1 | 2 | 3 | 4 | 5;
    country_code: string;
    child_friendly: 1 | 2 | 3 | 4 | 5;
    dog_friendly: 1 | 2 | 3 | 4 | 5;
    grooming: 1 | 2 | 3 | 4 | 5;
    health_issues: 1 | 2 | 3 | 4 | 5;
    intelligence: 1 | 2 | 3 | 4 | 5;
    shedding_level: 1 | 2 | 3 | 4 | 5;
    social_needs: 1 | 2 | 3 | 4 | 5;
    stranger_friendly: 1 | 2 | 3 | 4 | 5;
    vocalisation: 1 | 2 | 3 | 4 | 5;
  }[];
}

interface DogAPIResponse {
  id: string;
  url: string;
  categories: {
    id: number;
    name: string;
  }[];
  breeds: {
    id: string;
    name: string;
    temperament: string;
    life_span: string;
    alt_names: string;
    wikipedia_url: string;
    origin: string;
    weight: Record<string, unknown>;
    country_code: string;
    height: Record<string, unknown>;
  }[];
}
