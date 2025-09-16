


// src/services/apiConfig.ts
export const API_CONFIG = {
  FASTAPI_BASE_URL: process.env.REACT_APP_FASTAPI_URL || 'https://risk-api.fintech-platform.com',
  GRAPHQL_ENDPOINT: process.env.REACT_APP_GRAPHQL_URL || 'https://graphql.fintech-platform.com/v1/graphql',
  KAFKA_WS_URL: process.env.REACT_APP_KAFKA_WS || 'wss://kafka-stream.fintech-platform.com',
  REDIS_CACHE_PREFIX: 'risk_analytics',
  LAMBDA_FUNCTION_URLS: {
    RISK_CALCULATION: 'https://lambda-risk-calc.aws.fintech-platform.com',
    PORTFOLIO_ANALYSIS: 'https://lambda-portfolio.aws.fintech-platform.com',
    ALERT_PROCESSOR: 'https://lambda-alerts.aws.fintech-platform.com'
  }
};