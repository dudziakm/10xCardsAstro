# REST API Plan

## 1. Resources
- **Flashcards** - Maps to `flashcards` table
- **Generations** - Maps to `generations` table
- **Generation Error Logs** - Maps to `generation_error_logs` table
- **Auth** - Managed by Supabase Auth

## 2. Endpoints

### Authentication Endpoints

#### Register
- **Method**: POST
- **Path**: `/api/auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "string"
    },
    "session": {
      "access_token": "string",
      "refresh_token": "string"
    }
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 409 Conflict (Email already exists)

#### Login
- **Method**: POST
- **Path**: `/api/auth/login`
- **Description**: Log in an existing user
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "string"
    },
    "session": {
      "access_token": "string",
      "refresh_token": "string"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### Change Password
- **Method**: POST
- **Path**: `/api/auth/change-password`
- **Description**: Change user's password
- **Request Body**:
  ```json
  {
    "current_password": "string",
    "new_password": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### Delete Account
- **Method**: DELETE
- **Path**: `/api/auth/account`
- **Description**: Delete user's account
- **Request Body**: None
- **Response Body**:
  ```json
  {
    "success": true
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

### Flashcard Endpoints

#### List Flashcards
- **Method**: GET
- **Path**: `/api/flashcards`
- **Description**: Get paginated list of user's flashcards with search and filtering
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (optional)
  - `source`: 'manual' | 'ai' (optional)
  - `sort`: 'created_at' | 'updated_at' (default: 'updated_at')
  - `order`: 'asc' | 'desc' (default: 'desc')
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "source": "manual" | "ai",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 42,
      "items_per_page": 10
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Get Flashcard
- **Method**: GET
- **Path**: `/api/flashcards/{id}`
- **Description**: Get a specific flashcard by ID
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "source": "manual" | "ai",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found
#### Create Flashcard
- **Method**: POST
- **Path**: `/api/flashcards`
- **Description**: Create a new flashcard manually. (Note: Saving flashcards selected after AI generation might use a separate batch endpoint).
- **Request Body**:
  ```json
  {
    "front": "string (max 200 chars)",
    "back": "string (max 500 chars)"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "source": "manual", // Source is 'manual' when using this endpoint for direct creation.
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### Update Flashcard
- **Method**: PUT
- **Path**: `/api/flashcards/{id}`
- **Description**: Update an existing flashcard
- **Request Body**:
  ```json
  {
    "front": "string (max 200 chars)",
    "back": "string (max 500 chars)"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "source": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### Delete Flashcard
- **Method**: DELETE
- **Path**: `/api/flashcards/{id}`
- **Description**: Delete a flashcard
- **Response Body**:
  ```json
  {
    "success": true
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### Generate Flashcards
- **Method**: POST
- **Path**: `/api/flashcards/generate`
- **Description**: Generate flashcard candidates using AI
- **Request Body**:
  ```json
  {
    "input_text": "string (1000-10000 chars)"
  }
  ```
- **Response Body**:
  ```json
  {
    "candidates": [
      {
        "front": "string",
        "back": "string"
      }
    ],
    "generation_id": "uuid"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

#### Save Batch Flashcards
- **Method**: POST
- **Path**: `/api/flashcards/batch`
- **Description**: Save multiple flashcards after AI generation and review
- **Request Body**:
  ```json
  {
    "flashcards": [
      {
        "front": "string (max 200 chars)",
        "back": "string (max 500 chars)"
      }
    ],
    "generation_id": "uuid"
  }
  ```
- **Response Body**:
  ```json
  {
    "saved_count": 5,
    "flashcards": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "source": "ai",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

### Learning Session Endpoints

#### Get Next Learning Flashcard
- **Method**: GET
- **Path**: `/api/flashcards/next-for-learning`
- **Description**: Get the next flashcard for learning based on the algorithm
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "front": "string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found (No more flashcards for learning)

#### Review Flashcard
- **Method**: POST
- **Path**: `/api/flashcards/{id}/review`
- **Description**: Record the user's knowledge assessment of a flashcard
- **Request Body**:
  ```json
  {
    "knowledge_level": 1 | 2 | 3 | 4 | 5
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "next_review_date": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

### Generation Logs Endpoints

#### List Generations
- **Method**: GET
- **Path**: `/api/generations`
- **Description**: Get paginated list of generation logs
- **Query Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `sort`: 'created_at' (default)
  - `order`: 'asc' | 'desc' (default: 'desc')
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "input_text_preview": "string (truncated)",
        "cards_generated": 10,
        "successful": true,
        "created_at": "timestamp"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 42,
      "items_per_page": 10
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Get Generation Details
- **Method**: GET
- **Path**: `/api/generations/{id}`
- **Description**: Get details of a specific generation including any error logs
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "input_text": "string",
    "cards_generated": 10,
    "successful": true,
    "created_at": "timestamp",
    "error_logs": [
      {
        "id": "uuid",
        "error_message": "string",
        "error_code": "string",
        "timestamp": "timestamp"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

## 3. Authentication and Authorization

The API will use JWT-based authentication provided by Supabase Auth:

- Authentication is required for all endpoints except `/api/auth/register` and `/api/auth/login`
- JWT tokens will be passed in the Authorization header using the Bearer scheme
- Supabase client middleware will validate tokens and extract user information
- Row Level Security (RLS) will be enforced at the database level to ensure users can only access their own data
- The API will also check user authorization before processing requests

Implementation details:
- JWT tokens will be issued upon login/registration
- Access tokens will have a short expiry (e.g., 1 hour)
- Refresh tokens will have a longer expiry (e.g., 2 weeks)
- Token refresh endpoint will be provided by Supabase Auth

## 4. Validation and Business Logic

### Validation Rules

#### Flashcards
- `front`: Required, maximum 200 characters
- `back`: Required, maximum 500 characters
- `source`: Automatically set based on creation method ('manual' or 'ai')

#### Generate Flashcards
- `input_text`: Required, minimum 1000 characters, maximum 10000 characters

#### Review Flashcard
- `knowledge_level`: Required, integer between 1 and 5

### Business Logic Implementation

1. **AI Flashcard Generation**:
   - Validate input text length (1000-10000 chars)
   - Call OpenRouter.ai API to generate flashcards
   - Format response to return up to 10 candidate flashcards
   - Log the generation attempt in the `generations` table
   - If generation fails, log the error in the `generation_error_logs` table

2. **Flashcard Search**:
   - Utilize PostgreSQL's full-text search capabilities via the `front_tsv` and `back_tsv` columns
   - Combine with filtering by source if requested
   - Apply pagination with default of 10 items per page

3. **Learning Algorithm**:
   - Select flashcards for review based on spaced repetition principles
   - Use `knowledge_level` input to adjust next review date
   - Prioritize flashcards that are due for review
   - Include some new flashcards in each learning session

4. **Security**:
   - Enforce that users can only access their own flashcards and generations
   - Validate all input data before processing
   - Sanitize output to prevent data leakage 