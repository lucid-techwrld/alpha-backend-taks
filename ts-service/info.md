# Candidate Document Intake + Summary Workflow

## Overview

This project implements a **Candidate Document Intake and Summary Generation system** using **NestJS, TypeScript, and a background job workflow**.

Recruiters can upload candidate documents (such as resumes or cover letters). The system stores those documents and allows recruiters to request a structured candidate summary generated using a Large Language Model (LLM).

Summary generation is processed **asynchronously using a queue/worker pattern**, ensuring that long-running AI tasks do not block API requests.

---

# Architecture

The system follows a modular backend architecture with clear separation of concerns.

```
Controller
   ↓
Service
   ↓
Queue Job
   ↓
Worker
   ↓
Summarization Provider (LLM abstraction)
   ↓
Gemini API
   ↓
Database
```

Key design goals:

* Clear modular structure
* Background processing for AI tasks
* Provider abstraction for LLM integration
* Database-backed document storage
* Workspace-based access control

---

# Tech Stack

* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** TypeORM
* **Queue:** In-memory queue abstraction provided in the starter
* **Validation:** class-validator / DTO validation
* **Testing:** Jest + Supertest
* **LLM Provider:** Google Gemini
* **Schema Validation:** Zod (for validating LLM output)

---

# Features Implemented

## 1. Candidate Document Upload

Recruiters can upload documents associated with a candidate.

Endpoint:

```
POST /candidates/:candidateId/documents
```

Example Request:

```
{
  "documentType": "resume",
  "fileName": "resume.txt",
  "storageKey": "resume-123",
  "rawText": "John Doe backend engineer with 5 years experience..."
}
```

Documents are stored with metadata including:

* candidateId
* documentType
* fileName
* storageKey
* rawText
* uploadedAt

---

## 2. Summary Generation Request

Recruiters can request generation of a structured candidate summary.

Endpoint:

```
POST /candidates/:candidateId/summaries/generate
```

The endpoint:

* creates a **pending summary record**
* enqueues a **background job**
* returns **202 Accepted**

Example Response:

```
{
  "status": "pending",
  "summaryId": "uuid"
}
```

---

## 3. Background Worker Processing

A worker processes queued jobs asynchronously.

The worker:

1. Fetches candidate documents
2. Sends the documents to the LLM provider
3. Validates structured output
4. Stores the generated summary
5. Updates job status

Summary statuses:

* `pending`
* `completed`
* `failed`

Failures are stored with an error message for observability.

---

## 4. Retrieve Summaries

List summaries for a candidate.

```
GET /candidates/:candidateId/summaries
```

Retrieve a specific summary.

```
GET /candidates/:candidateId/summaries/:summaryId
```

Example Response:

```
{
  "id": "summary-id",
  "score": 84,
  "strengths": ["Strong Node.js experience"],
  "concerns": ["Limited leadership experience"],
  "summary": "Candidate shows strong backend engineering skills...",
  "recommendedDecision": "interview"
}
```

---

# LLM Provider

The system uses **Google Gemini** for candidate summary generation.

Model used:

```
gemini-1.5-flash
```

The provider returns structured output:

* score
* strengths
* concerns
* summary
* recommendedDecision

To ensure reliability, the output is validated using **Zod** before saving to the database.

---

# Provider Abstraction

LLM logic is not implemented directly in controllers or workers.

Instead, a provider interface is used:

```
SummarizationProvider
```

This allows the system to easily swap providers such as:

* Gemini
* OpenAI
* internal models

Tests use a **FakeSummarizationProvider** to avoid external API calls.

---

# Workspace Access Control

Recruiters belong to a workspace.

Requests must include:

```
x-user-id
x-workspace-id
```

The application ensures that recruiters can only access candidates belonging to their workspace.

This is enforced in the service layer to maintain clear access boundaries.

---

# Database Design

Main entities:

### CandidateDocument

```
id
candidateId
documentType
fileName
storageKey
rawText
uploadedAt
```

### CandidateSummary

```
id
candidateId
status
score
strengths
concerns
summary
recommendedDecision
provider
promptVersion
errorMessage
createdAt
updatedAt
```

Indexes are applied to `candidateId` for efficient retrieval.

---

# Environment Setup

Create a `.env` file:

```
GEMINI_API_KEY=your_api_key
DATABASE_URL=postgres://user:password@localhost:5432/db
```

API keys can be generated from Google AI Studio.

---

# Running the Project

Install dependencies:

```
npm install
```

Run database:

```
docker compose up -d postgres
```

Run migrations:

```
npm run migration:run
```

Start server:

```
npm run start:dev
```

---

# Running Tests

Tests are written using **Jest** and **SuperTest**.

Run tests:

```
npm run test
```

Tests use a **fake summarization provider** to avoid external API calls.

---

# Possible Improvements

Several improvements could be made with additional time.

### 1. File Upload Handling

Currently documents are submitted as raw text for simplicity.

A production implementation would include:

* file upload using multipart/form-data
* storage in object storage (e.g., S3)
* automatic text extraction from PDFs or DOCX files

---

### 2. Persistent Queue System

The starter uses an in-memory queue.

A production system should use a robust queue such as:

* Redis-based job queues
* retry mechanisms
* job backoff strategies

---

### 3. Worker Process Separation

Currently the worker runs inside the API process.

A scalable architecture would separate:

```
API Service
Worker Service
Queue Broker
```

This allows horizontal scaling.

---

### 4. Improved LLM Reliability

Enhancements could include:

* JSON schema prompting
* automatic retries on invalid output
* structured output parsers

---

### 5. Observability

Production systems would include:

* structured logging
* metrics
* job monitoring dashboards

---

# Design Considerations

The solution prioritizes:

* maintainability
* modular architecture
* asynchronous processing
* testability
* clean separation of concerns

A smaller but well-structured solution was preferred over adding unnecessary complexity.

---

# Assumptions

* Candidate entities already exist in the system.
* Workspace ownership is provided via request headers.
* Documents are available as text during upload.

These assumptions keep the solution focused on the assessment goals.

---

# Conclusion

This implementation demonstrates:

* modular NestJS architecture
* DTO validation
* relational database modeling
* asynchronous job processing
* provider abstraction for AI integration
* testable design

The goal was to provide a **clear, maintainable, and production-oriented solution** while keeping the implementation focused and practical.
