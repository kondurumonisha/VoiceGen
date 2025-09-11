🎙️ VoiceGen
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Experience smooth text-to-speech with instant Indian language translation

🔗 Live Demo  
👉 [Open VoiceGen Website] voice-gen-bice.vercel.app

______________________________________________________________________________________________________________________________________________________________________________________________________________________________
🚀 Overview
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
VoiceGen is a modern web application that converts text into speech while seamlessly translating it into multiple Indian languages such as Hindi, Telugu, Tamil, Malayalam, and more.

It is designed to be simple, interactive, and powerful, making communication across languages effortless.
______________________________________________________________________________________________________________________________________________________________________________________________________________________________
✨ Features
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
📝 Text Input – Enter or paste text for translation and speech conversion.

🌐 Language Translation – Supports Indian languages (Hindi, Telugu, Tamil, Malayalam, etc.).

🔊 Text-to-Speech (TTS) – Listen to natural-sounding speech in the target language.

🔄 Swap Languages – Instantly swap between source and target languages.

⚡ Quick Samples – Predefined phrases like greetings, thanks, questions, and emergency use cases.

🎨 Modern UI – Clean, responsive design with dark theme for better readability.
______________________________________________________________________________________________________________________________________________________________________________________________________________________________
🖥️ Tech Stack
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
- Next.js – Frontend & API routes

- TypeScript – Strongly typed development

- Tailwind CSS – Styling and responsive layout

- MyMemory API – Free translation service

- Web Speech API – For generating natural text-to-speech
_____________________________________________________________________________________________________________________________________________________________________________________________________________________________
🎯 How It Works
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
- Enter text in the Input Box

- Select Source Language and Target Language

- Click Translate

- View translated text in the Output Box

- Convert translated text to speech instantly
______________________________________________________________________________________________________________________________________________________________________________________________________________________________
🌍 Demo Use Cases
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
- Helping students understand content in their mother tongue

- Assisting travelers with quick translations

- Voice assistance in regional languages

- Accessibility tool for visually impaired users
______________________________________________________________________________________________________________________________________________________________________________________________________________________________
📌 Future Enhancements
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
🎤 Speech-to-Text input

🔗 Integration with AI-powered translation APIs

📱 Mobile-first progressive web app (PWA)
______________________________________________________________________________________________________________________________________________________________________________________________________________________________
📂 Project Structure
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

```plaintext
voicegen/
│
├── pages/                     # Next.js Pages Router (API + UI pages)
│   ├── api/
│   │   └── translate.ts       # Translation API route
│   └── index.tsx              # Homepage (UI for text-to-speech + translation)
│
├── public/                    # Public assets (icons, images, etc.)
│   └── favicon.ico
│
├── styles/
│   └── globals.css            # Global Tailwind/Custom CSS
│
├── components/                # Reusable React components
│   ├── LanguageSelector.tsx   # Dropdown for choosing languages
│   ├── TextInput.tsx          # Input area for text
│   └── OutputBox.tsx          # Display translated text + speech controls
│
├── utils/                     # Helper functions
│   └── tts.js                 # Text-to-speech logic (Web Speech API)
│
├── README.md                  # Documentation file
├── package.json               # NPM dependencies
├── tsconfig.json              # TypeScript configuration
└── next.config.js             # Next.js configuration

