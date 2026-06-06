-- Run as PostgreSQL superuser (postgres):
-- psql -U postgres -f scripts/setup-database.sql

CREATE USER erp_user WITH PASSWORD 'StrongPassword123!';

CREATE DATABASE erp_system OWNER erp_user;

GRANT ALL PRIVILEGES ON DATABASE erp_system TO erp_user;

\c erp_system

GRANT ALL ON SCHEMA public TO erp_user;
GRANT CREATE ON SCHEMA public TO erp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO erp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO erp_user;
