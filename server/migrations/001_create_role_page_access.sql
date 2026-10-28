-- =============================================================================
-- Migration: 001_create_role_page_access.sql
-- Description: Creates the role_page_access table and sequence for RBAC / Page Permissions.
-- Approved in T2 Architecture.
-- =============================================================================

-- 1. Create Sequence for role_page_access_id
CREATE SEQUENCE IF NOT EXISTS role_page_access_role_page_access_id_seq;

-- 2. Create Table role_page_access
CREATE TABLE IF NOT EXISTS role_page_access (
    role_page_access_id BIGINT NOT NULL DEFAULT nextval('role_page_access_role_page_access_id_seq'::regclass),
    role_id BIGINT NOT NULL,
    page_key VARCHAR(100) NOT NULL,
    can_access BOOLEAN NOT NULL DEFAULT false,
    creation_date_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_date_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user BIGINT,
    CONSTRAINT role_page_access_pkey PRIMARY KEY (role_page_access_id),
    CONSTRAINT fk_role_page_access_role FOREIGN KEY (role_id) 
        REFERENCES roles (role_id) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION,
    CONSTRAINT uq_role_page_access_role_page UNIQUE (role_id, page_key)
);
