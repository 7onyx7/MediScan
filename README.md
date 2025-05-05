# MediScan Project Documentation

## Overview
MediScan is a mobile application for medication management, OCR-based prescription scanning, medical history tracking, symptom logging, and safety checks against the FDA drug database.

## Key Features
- Prescription scanning via OCR (Google Vision API or test mode)
- Automatic medication info extraction (name, dosage, frequency)
- Medication list with add, edit, and detail views
- Symptom recording and history
- Diagnosis logging and history
- Medical history tracking
- Secure local storage (Expo SecureStore / AsyncStorage)
- FDA and Gemini API integrations for safety checks and insights
- Modern, accessible UI with error handling (ErrorBoundary)

## Project Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/7onyx7/MediScan.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Update API keys in .env
   ```
4. Start the app:
   ```bash
   npx expo start
   ```

## Dependencies
- React Native & Expo
- React Navigation (native-stack)
- Expo Camera, Image Picker, Image Manipulator
- Tesseract.js (OCR fallback)
- @react-native-firebase/app & @react-native-firebase/ml
- axios
- react-hook-form & zod
- @react-native-async-storage/async-storage
- @react-native-community/netinfo
- expo-file-system, expo-secure-store

## Project Structure
```text
MediScan/
├── App.tsx                # Main entry point
├── firebase.js            # Firebase initialization
├── src/
│   ├── components/        # UI components (Button, Card, ErrorBoundary, Input)
│   ├── contexts/          # UserContext for global state
│   ├── navigation/        # Stack & types
│   ├── screens/           # App screens (Home, Medications, Scan, Analysis, etc.)
│   ├── services/          # ApiService, ConfigService, FdaService, GeminiService, OcrService, StorageService
│   ├── hooks/             # useImageCapture, useMedicationAnalysis
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helpers & validation
├── assets/                # Icons, splash images
├── app.json               # Expo config
├── eas.json               # EAS config
├── package.json
└── tsconfig.json
```

## Running on Devices
- Expo Go (Android/iOS)
- Web (Expo for web) using `expo start --web`

## Privacy & Security
All sensitive data is stored locally using secure storage. No personal health data is transmitted except for FDA safety checks.