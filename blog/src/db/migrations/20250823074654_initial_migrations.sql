-- Add migration script here
create table accounts (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    email text not null,
    account_name text not null,
    password_hash text not null,
    email_verified_at timestamptz,
    photo_identifier text
);

create unique index accounts_email_unique on accounts (email) where deleted_at is null and email is not null;

create table posts (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    account_id uuid not null,
    contents text not null
);

create table comments (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    account_id uuid not null,
    post_id uuid not null,
    contents text not null
);