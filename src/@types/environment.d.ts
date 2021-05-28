declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      PRODUCTION: boolean;
      DB_HOST: string;
      DB_USER: string;
      DB_PASS: string;
      DB_NAME: string;
      EXCHANGE_API: string;
    }
  }
}

export { };