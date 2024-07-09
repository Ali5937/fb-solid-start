declare module "bun" {
  interface Env {
    POSTGRESQL_USER: string;
    POSTGRESQL_HOST: string;
    POSTGRESQL_DATABASE: string;
    POSTGRESQL_PASSWORD: string;

    CURRENCY_EXCHANGE_API: string;
    GIS_API: string;

    JWT_SECRET_ACCESS: string;
    JWT_SECRET_REFRESH: string;
  }
}
