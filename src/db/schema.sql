-- =========================================================
-- Univia Campus Community Platform - PostgreSQL Database Schema
-- Multi-identifier Authentication, Societies & Event Moderation
-- =========================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('GUEST', 'STUDENT', 'SOCIETY_LEAD', 'ADMIN');
CREATE TYPE event_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 2. Create Users Table (Multi-Identifier Login)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(64) UNIQUE,
    phone VARCHAR(32) UNIQUE,
    username VARCHAR(64) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    name VARCHAR(128) NOT NULL,
    avatar TEXT,
    major VARCHAR(128),
    class_year VARCHAR(64),
    campus_card_id VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup indexes for Multi-Identifier Login (Student ID, Phone, Username, Email)
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Create Societies Table
CREATE TABLE IF NOT EXISTS societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) UNIQUE NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    avatar TEXT,
    banner_url TEXT,
    lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_societies_slug ON societies(slug);

-- 4. Create Society Members Join Table
CREATE TABLE IF NOT EXISTS society_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_society_member UNIQUE (user_id, society_id)
);

-- 5. Create Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date VARCHAR(64) NOT NULL,
    time VARCHAR(64) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'Tech & Innovation',
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    status event_status NOT NULL DEFAULT 'PENDING',
    is_visible BOOLEAN NOT NULL DEFAULT FALSE,
    max_attendees INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for status, visibility, and foreign keys
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_visible ON events(is_visible);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_society ON events(society_id);

-- 6. Create Event Reviews Table (Audit Trail for Admin Moderation)
CREATE TABLE IF NOT EXISTS event_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision event_status NOT NULL,
    feedback TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_reviews_event ON event_reviews(event_id);
