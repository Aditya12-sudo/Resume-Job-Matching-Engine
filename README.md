🚀 React + TypeScript + Vite Starter
This project provides a minimal yet powerful setup to kickstart a React + TypeScript application using Vite. It includes support for Fast Refresh, type-aware ESLint, and customizable configurations — ideal for building scalable and maintainable production apps.

✨ Features
⚡ Fast dev environment with Vite

⚛️ React with TypeScript

🔄 Hot Module Replacement (HMR)

🧹 ESLint with Type-Aware Rules

🔍 Pre-configured with SWC or Babel (your choice)

📦 Tech Stack
React

TypeScript

Vite

ESLint

SWC (Optional alternative to Babel)

🧠 Getting Started
bash
Copy
Edit
# Clone the repository
git clone https://github.com/your-username/your-project-name.git

# Navigate into the directory
cd your-project-name

# Install dependencies
npm install

# Start development server
npm run dev
🔧 ESLint Configuration
For better production-quality linting, the configuration has been enhanced to support type-aware rules.

🔹 parserOptions Setup
Update the ESLint config (.eslintrc.js or .eslintrc.cjs) to include:

js
Copy
Edit
parserOptions: {
  ecmaVersion: 'latest',
  sourceType: 'module',
  project: ['./tsconfig.json', './tsconfig.node.json'],
  tsconfigRootDir: __dirname,
}
🔹 Extend ESLint Rules
Replace the default recommended rule set with type-aware versions:

json
Copy
Edit
"extends": [
  "plugin:react/recommended",
  "plugin:react/jsx-runtime",
  "plugin:@typescript-eslint/recommended-type-checked",
  "plugin:@typescript-eslint/stylistic-type-checked"
]
🔹 Install Required Plugins
bash
Copy
Edit
npm install -D eslint eslint-plugin-react @typescript-eslint/eslint-plugin @typescript-eslint/parser
If using SWC instead of Babel for Fast Refresh:

bash
Copy
Edit
npm install -D @vitejs/plugin-react-swc
📁 Folder Structure
arduino
Copy
Edit
├── public/
├── src/
│   ├── components/
│   ├── App.tsx
│   ├── main.tsx
├── .eslintrc.cjs
├── tsconfig.json
├── vite.config.ts
🧪 Scripts
bash
Copy
Edit
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
📌 Notes
Make sure your TypeScript project references (tsconfig.json) are correct.

Use @vitejs/plugin-react-swc for performance with large codebases.

📃 License
MIT

