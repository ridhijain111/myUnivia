/**
 * UNIVIA CAMPUS INTELLIGENCE PLATFORM
 * Production-Ready Relational Database Schema (PostgreSQL + Drizzle / Prisma Compatible)
 *
 * Covers:
 * - Multi-identifier Authentication & Sessions (Student ID, Phone, Username/Email)
 * - Strict Role-Based Access Control (Guest, Student, Society Lead, Super Admin)
 * - Societies & Member Directories
 * - Event Lifecycle with Multi-Stage Admin Approval Workflow (PENDING -> APPROVED / REJECTED)
 * - Event Routing & Tagged Societies Junction
 * - Event Registrations & Pass Generation
 * - Campus Notifications & Audit Logs
 * - Real-Time WhatsApp-Style Channels & Messages
 */

export const SCHEMA_SQL = `
-- Enable UUID and cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('Guest', 'Student', 'Student Lead', 'Society Admin', 'Super Admin');
CREATE TYPE event_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE event_category AS ENUM ('Tech & Innovation', 'Social', 'Arts & Culture', 'Academic & Career', 'Wellness & Sports');
CREATE TYPE registration_type AS ENUM ('open_rsvp', 'form', 'external', 'members_only');
CREATE TYPE society_category AS ENUM ('Tech', 'Design & Arts', 'Academic', 'Social & Cultural', 'Outdoor & Sports');
CREATE TYPE notification_type AS ENUM ('event', 'society', 'deadline', 'message', 'admin_review');

-- 1. USERS TABLE (Supports Multi-Identifier Authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(64) UNIQUE,                 -- e.g. "IGDTUW-AI-2024-042"
    phone_number VARCHAR(32) UNIQUE,               -- e.g. "+91 98101 23456"
    username VARCHAR(64) UNIQUE,                   -- e.g. "riyasharma"
    email VARCHAR(255) UNIQUE NOT NULL,            -- e.g. "riya.sharma@igdtuw.ac.in"
    password_hash VARCHAR(255) NOT NULL,           -- bcrypt/argon2 hash (enforced min 8 chars, 1 upper, 1 lower, 1 num, 1 special)
    name VARCHAR(128) NOT NULL,
    role user_role NOT NULL DEFAULT 'Student',
    major VARCHAR(128) DEFAULT 'B.Tech Computer Science & AI',
    class_year VARCHAR(64) DEFAULT '1st Year • Class of 2029',
    university VARCHAR(255) DEFAULT 'Indira Gandhi Delhi Technical University for Women (Univia)',
    avatar_url TEXT DEFAULT '',
    campus_card_id VARCHAR(64) UNIQUE NOT NULL,
    status_message VARCHAR(255) DEFAULT '🟢 Active on Univia Campus',
    bio TEXT,
    hostel_block VARCHAR(128),
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for instantaneous multi-identifier lookups
CREATE INDEX idx_users_student_id ON users(LOWER(student_id));
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_username ON users(LOWER(username));
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_campus_card ON users(campus_card_id);

-- 2. AUTH SESSIONS & TOKENS (Clean Logout Hygiene)
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jwt_id VARCHAR(128) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_active ON auth_sessions(user_id, is_active);

-- 3. SOCIETIES
CREATE TABLE societies (
    id VARCHAR(64) PRIMARY KEY,                    -- e.g. "soc-assetmerkle"
    name VARCHAR(128) NOT NULL,
    category society_category NOT NULL,
    member_count INT DEFAULT 1,
    avatar VARCHAR(16) NOT NULL DEFAULT '⚡',
    banner_color VARCHAR(64) DEFAULT 'from-purple-500 to-indigo-600',
    description TEXT NOT NULL,
    meeting_schedule VARCHAR(255) DEFAULT 'Every Wednesday & Friday • 4:30 PM',
    location VARCHAR(255) DEFAULT 'Lab 201 & Auditorium Hall 2',
    lead_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SOCIETY MEMBERSHIPS
CREATE TABLE society_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_role VARCHAR(64) DEFAULT 'Member',      -- 'Lead', 'Coordinator', 'Member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(society_id, user_id)
);

-- 5. CAMPUS EVENTS WITH ADMIN APPROVAL WORKFLOW
CREATE TABLE events (
    id VARCHAR(64) PRIMARY KEY,                    -- e.g. "evt-assetmerkle-today"
    title VARCHAR(255) NOT NULL,
    primary_society_id VARCHAR(64) REFERENCES societies(id) ON DELETE SET NULL,
    society_name VARCHAR(128) NOT NULL,
    society_avatar VARCHAR(16) DEFAULT '⚡',
    event_date VARCHAR(64) NOT NULL,               -- e.g. "Today, Oct 21" or "2026-10-21"
    event_time VARCHAR(64) NOT NULL,               -- e.g. "4:00 PM - 6:30 PM"
    location VARCHAR(255) NOT NULL,
    category event_category NOT NULL DEFAULT 'Tech & Innovation',
    attendees_count INT DEFAULT 0,
    max_attendees INT DEFAULT 100,
    image_color VARCHAR(128) DEFAULT 'from-[#7033F5] to-[#9857FF]',
    tags TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    
    -- Event Approval Workflow Constraints:
    -- Default is 'PENDING' for all student / organizer proposed events
    status event_status NOT NULL DEFAULT 'PENDING',
    proposed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_feedback TEXT,
    
    -- Registration and Logistics
    registration_type registration_type NOT NULL DEFAULT 'open_rsvp',
    registration_url TEXT,
    registration_deadline VARCHAR(64),
    require_laptop BOOLEAN DEFAULT FALSE,
    dietary_provided BOOLEAN DEFAULT FALSE,
    is_today BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_primary_society ON events(primary_society_id);

-- 6. EVENT TAGGED SOCIETIES (Many-to-Many Routing Junction)
-- When an event is proposed, notifications are dispatched to all tagged societies
CREATE TABLE event_tagged_societies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    is_notified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, society_id)
);

-- 7. EVENT REGISTRATIONS & DIGITAL PASSES
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_id VARCHAR(64) UNIQUE NOT NULL,         -- e.g. "UNIVIA-TKT-8842"
    student_name VARCHAR(128) NOT NULL,
    roll_no VARCHAR(64) NOT NULL,
    branch_year VARCHAR(128) NOT NULL,
    dietary_preference VARCHAR(32) DEFAULT 'No Preference',
    needs_laptop_loan BOOLEAN DEFAULT FALSE,
    additional_notes TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- 8. NOTIFICATIONS & ADMIN REVIEW AUDIT
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    society_id VARCHAR(64) REFERENCES societies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type notification_type NOT NULL,
    action_target VARCHAR(128),
    is_read BOOLEAN DEFAULT FALSE,
    is_admin_broadcast BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_society ON notifications(society_id);

-- 9. WHATSAPP & REAL-TIME CHANNELS
CREATE TABLE chat_channels (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    is_direct BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    society_id VARCHAR(64) REFERENCES societies(id) ON DELETE CASCADE,
    role_or_category VARCHAR(128),
    description TEXT,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. CHAT MESSAGES
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id VARCHAR(64) NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    attachment_json JSONB,
    delivery_status VARCHAR(16) DEFAULT 'read',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_channel ON chat_messages(channel_id, created_at);
`;

// TypeScript Database Entities for Frontend and Backend consistency
export interface DbUser {
  id: string;
  studentId: string;
  phoneNumber: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'Guest' | 'Student' | 'Student Lead' | 'Society Admin' | 'Super Admin';
  major: string;
  classYear: string;
  university: string;
  avatarUrl: string;
  campusCardId: string;
  statusMessage: string;
  bio?: string;
  hostelBlock?: string;
  skills: string[];
  interests: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbEvent {
  id: string;
  title: string;
  primarySocietyId?: string;
  societyName: string;
  societyAvatar?: string;
  eventDate: string;
  eventTime: string;
  location: string;
  category: 'Tech & Innovation' | 'Social' | 'Arts & Culture' | 'Academic & Career' | 'Wellness & Sports';
  attendeesCount: number;
  maxAttendees: number;
  imageColor: string;
  tags: string[];
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proposedByUserId?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  reviewFeedback?: string;
  taggedSocieties: string[];
  registrationType: 'open_rsvp' | 'form' | 'external' | 'members_only';
  registrationUrl?: string;
  registrationDeadline?: string;
  requireLaptop: boolean;
  dietaryProvided: boolean;
  createdAt: string;
}
