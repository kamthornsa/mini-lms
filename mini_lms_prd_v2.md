# PRD: Mini LMS (Documentation-Style Learning Platform)

## 1. Project Overview

Mini LMS is a lightweight Learning Management System designed with a
**documentation-style interface**, similar to modern developer
documentation platforms such as:

-   Docusaurus
-   VitePress
-   Starlight
-   Next.js Docs

The goal is to provide a **clean, readable, and code-friendly learning
environment** for technical courses such as programming, engineering,
and IT.

------------------------------------------------------------------------

## 2. Design Philosophy

### Docs-First Learning

Lessons are written in **Markdown or MDX (Markdown + JSX)**, allowing
instructors to easily create structured and interactive content.

Supports:

-   Code snippets with syntax highlighting
-   Embedded YouTube videos
-   Custom React components (via MDX)

------------------------------------------------------------------------

### Zero-Friction Login

Students log in using only:

Student ID

No password required.

------------------------------------------------------------------------

## 3. User Roles

### Teacher (Admin)

-   Create courses
-   Create sections
-   Import students via CSV
-   Assign courses to sections
-   Create lessons and assignments
-   Review submissions

### Student

-   Login via Student ID
-   View assigned courses
-   Read lessons
-   Submit assignments via link

------------------------------------------------------------------------

## 4. System Model

Supports:

-   Multiple courses
-   Multiple sections
-   Many-to-many relationships

Flow:

Students → Sections → Courses → Lessons

------------------------------------------------------------------------

## 5. Features

### Student Management

-   CSV import
-   Group assignment
-   Duplicate validation

------------------------------------------------------------------------

### Section Management

Examples:

-   CE6841
-   CE6842

------------------------------------------------------------------------

### Course Management

Courses contain:

-   Lessons
-   Assignments

------------------------------------------------------------------------

### Lesson Content

Supports:

-   Markdown / MDX
-   Code blocks
-   YouTube embeds

------------------------------------------------------------------------

### Assignment System

-   Linked to lessons
-   Submission via URL
-   Timestamp tracking

------------------------------------------------------------------------

## 6. UI / UX Design

Layout:

Sidebar \| Content \| TOC

Features:

-   Docs-style sidebar
-   Markdown rendering
-   Auto TOC generation

------------------------------------------------------------------------

## 7. Database Schema (PostgreSQL)

### students

id UUID PRIMARY KEY\
student_id VARCHAR UNIQUE\
full_name VARCHAR

------------------------------------------------------------------------

### sections

id SERIAL PRIMARY KEY\
name VARCHAR

------------------------------------------------------------------------

### student_sections

student_id UUID\
section_id INT

------------------------------------------------------------------------

### courses

id SERIAL PRIMARY KEY\
title VARCHAR\
slug VARCHAR

------------------------------------------------------------------------

### section_courses

section_id INT\
course_id INT

------------------------------------------------------------------------

### lessons

id SERIAL PRIMARY KEY\
course_id INT\
title VARCHAR\
slug VARCHAR\
content TEXT

------------------------------------------------------------------------

### assignments

id SERIAL PRIMARY KEY\
lesson_id INT\
title VARCHAR

------------------------------------------------------------------------

### submissions

id SERIAL PRIMARY KEY\
student_id UUID\
assignment_id INT\
link_url TEXT

------------------------------------------------------------------------

## 8. Tech Stack

-   Next.js 15
-   PostgreSQL
-   Prisma
-   NextAuth (Student ID only)
-   Tailwind CSS + shadcn/ui
-   MDX (Markdown + JSX)
-   Shiki (code highlighting)

------------------------------------------------------------------------

## 9. Future Features

-   Quiz system
-   Progress tracking
-   Code playground
-   Discussion system

------------------------------------------------------------------------

## 10. Target Use Cases

-   Programming courses
-   Engineering education
-   Technical training
