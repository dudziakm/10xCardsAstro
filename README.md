# my10xCards

## Table of Contents

- [Project Name](#project-name)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Name

**my10xCards**

## Project Description

my10xCards is an innovative application designed to simplify the creation of high-quality educational flashcards. The system leverages AI to automatically generate flashcard candidates from a provided text input while also supporting manual flashcard creation. The application is tailored for professionals looking for efficient learning tools based on spaced repetition, enabling both automated and manual flashcard management with user-friendly review and editing capabilities.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, Shadcn/ui
- **Backend & Database:** Supabase (for authentication and PostgreSQL database)
- **AI Integration:** OpenRouter.ai for generating flashcards
- **Tooling:** Node.js (v22.14.0 as specified in .nvmrc), ESLint, Prettier

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dudziakm/10xCardsAstro.git
   cd 10xCardsAstro
   ```

2. **Use the correct Node.js version:**
   Make sure you are using Node.js version 22.14.0. If you use nvm, run:
   ```bash
   nvm use
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

The project includes the following npm scripts defined in `package.json`:

- **dev:** Starts the Astro development server.
- **build:** Builds the project for production.
- **preview:** Previews the production build locally.
- **astro:** Utility command for Astro.
- **lint:** Runs ESLint to analyze the code for potential issues.
- **lint:fix:** Automatically fixes linting errors where possible.
- **format:** Formats the code using Prettier.

## Project Scope

The project's core features include:

- **AI-Generated Flashcards:**
  - Accepts text input (1000 to 10,000 characters) to generate up to 10 flashcard candidates.
  - Each flashcard candidate's front is limited to 200 characters and back to 500 characters.
  - Generated cards are presented for review, with options for acceptance, editing, or rejection. Only accepted flashcards are stored.

- **Manual Flashcard Creation:**
  - Users can manually create flashcards with validations (front up to 200 characters, back up to 500 characters).

- **Flashcard Management:**
  - Features a searchable and paginated list of saved flashcards (e.g., 10 per page).
  - Allows editing and deletion of flashcards.

- **User Account Management:**
  - Registration, login, password change, and account deletion via Supabase integration.

- **Learning Session:**
  - Dedicated study mode that uses a spaced repetition algorithm to help users review flashcards efficiently.

## Project Status

The project is currently under active development. Features are being implemented iteratively, and feedback is welcomed to improve performance and usability.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
