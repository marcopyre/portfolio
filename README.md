# 🚀 Portfolio Interactif - Marco Pyré

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Hugging Face](https://img.shields.io/badge/Hugging_Face-Transformers-orange?style=for-the-badge&logo=huggingface)

[![Frontend](https://img.shields.io/badge/Frontend-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://marcopyre.github.io/portfolio)
[![Backend](https://img.shields.io/badge/Backend-Vercel-blue?style=for-the-badge&logo=vercel)](https://vercel.com)
[![AI Model](https://img.shields.io/badge/AI%20Model-Hugging%20Face-yellow?style=for-the-badge&logo=huggingface)](https://huggingface.co)

</div>

## 📋 Table des matières

- [🎯 À propos](#-à-propos)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Déploiement](#-déploiement)
- [🛠️ Technologies](#️-technologies)
- [📦 Installation](#-installation)
- [🎨 Interface](#-interface)
- [🤖 IA & RAG](#-ia--rag)
- [🌐 Internationalisation](#-internationalisation)
- [📱 Responsive Design](#-responsive-design)
- [🔧 Configuration](#-configuration)
- [📄 API Endpoints](#-api-endpoints)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🎯 À propos

Portfolio interactif de **Marco Pyré**, développeur fullstack spécialisé en cloud native. Ce projet démontre une expertise technique moderne combinant :

- **Frontend** : Interface utilisateur moderne avec Next.js 15 et React 19
- **Backend** : API serverless sur Vercel
- **IA** : Assistant conversationnel alimenté par Hugging Face
- **RAG** : Base de connaissances vectorisée pour des réponses précises

## ✨ Fonctionnalités

### 💬 Assistant IA Interactif

- **Chat en temps réel** avec l'assistant IA
- **Questions rapides** prédéfinies pour faciliter l'interaction
- **Support multilingue** (français, anglais, espagnol)
- **Actions contextuelles** (téléchargement CV, envoi d'email)

### 🎨 Interface Moderne

- **Design responsive** adapté à tous les écrans
- **Animations fluides** et effets visuels
- **Mode sombre** par défaut avec thème cyberpunk
- **Particules animées** en arrière-plan

### 🔧 Fonctionnalités Techniques

- **RAG (Retrieval-Augmented Generation)** pour des réponses précises
- **Gestion d'état** optimisée avec React hooks
- **Validation** côté client et serveur
- **Logging** structuré pour le debugging

## 🏗️ Architecture

```mermaid
graph TB
    A[Frontend - GitHub Pages] --> B[API - Vercel]
    B --> C[LLM - Hugging Face]
    C --> D[RAG Database - Hugging Face]

    E[Knowledge Base] --> D
    F[Custom Model] --> C

    G[User] --> A
    A --> G
```

### 📊 Stack Technique

| Composant        | Technologie           | Hébergement  |
| ---------------- | --------------------- | ------------ |
| **Frontend**     | Next.js 15 + React 19 | GitHub Pages |
| **Backend**      | Next.js API Routes    | Vercel       |
| **IA Model**     | Google Gemma-2B-IT    | Hugging Face |
| **RAG Database** | Vector Database       | Hugging Face |
| **Styling**      | Tailwind CSS 4        | -            |
| **Language**     | TypeScript            | -            |

## 🚀 Déploiement

### 🌐 Frontend (GitHub Pages)

- **URL** : [https://marcopyre.github.io/portfolio](https://marcopyre.github.io/portfolio)
- **Build** : Automatique via GitHub Actions
- **CDN** : Global avec GitHub Pages

### ⚡ Backend (Vercel)

- **URL** : API serverless sur Vercel
- **Performance** : Edge functions pour latence minimale
- **Scalabilité** : Auto-scaling selon la charge

### 🤖 IA & RAG (Hugging Face)

- **Model** : Google Gemma-2B-IT
- **Knowledge Base** : Dataset vectorisé personnalisé
- **Inference** : API Hugging Face avec token d'accès

## 🛠️ Technologies

### Frontend

```json
{
  "next": "15.3.5",
  "react": "^19.0.0",
  "typescript": "^5",
  "tailwindcss": "^4",
  "lucide-react": "^0.525.0"
}
```

### Backend & IA

```json
{
  "@huggingface/inference": "^4.3.2",
  "radix-ui": "^1.0.5",
  "class-variance-authority": "^0.7.1"
}
```

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Hugging Face (pour l'API)

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/marcopyre/portfolio.git
cd portfolio

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API

# Lancer en mode développement
npm run dev
```

### Variables d'environnement

```env
# Hugging Face API
HUGGINGFACE_API_KEY=your_huggingface_token

# Configuration de l'API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🎨 Interface

### Design System

- **Couleurs** : Palette cyberpunk (noir, violet, cyan)
- **Typographie** : Inter pour la lisibilité
- **Animations** : Framer Motion pour les transitions
- **Icons** : Lucide React pour la cohérence

### Composants UI

- `Button` : Boutons avec variants (primary, secondary, ghost)
- `Input` : Champs de saisie stylisés
- `ScrollArea` : Zone de défilement personnalisée
- `ChatMessage` : Messages de chat avec markdown
- `TypingIndicator` : Indicateur de frappe animé

## 🤖 IA & RAG

### Assistant Conversationnel

- **Model** : Google Gemma-2B-IT via Hugging Face
- **Context** : 4096 tokens maximum
- **Temperature** : 0.7 pour créativité équilibrée
- **Functions** : Actions contextuelles (CV, email)

### Base de Connaissances

- **Format** : Dataset structuré avec métadonnées
- **Catégories** : Expérience, compétences, projets, contact
- **Priorité** : Système de scoring pour pertinence
- **Mise à jour** : Script automatisé `kbupdate.py`

### Fonctions Disponibles

```typescript
// Téléchargement du CV
get_resume(): Promise<void>

// Envoi d'email de contact
send_contact_email(sujet: string, message: string): Promise<void>
```

## 🌐 Internationalisation

### Langues Supportées

- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **Anglais**
- 🇪🇸 **Espagnol**

### Structure i18n

```
i18n/
├── en.json      # Traductions anglaises
├── fr.json      # Traductions françaises
├── language-provider.tsx
└── use-translation.ts
```

## 📱 Responsive Design

### Breakpoints

- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Optimisations

- **Images** : Lazy loading et formats optimisés
- **Fonts** : Preload des polices critiques
- **Performance** : Code splitting automatique

## 🔧 Configuration

### Next.js Config

```typescript
// next.config.ts
const nextConfig = {
  output: "export", // Pour GitHub Pages
  trailingSlash: true, // Compatibilité GitHub Pages
  images: {
    unoptimized: true, // Pour export statique
  },
};
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
```

## 📄 API Endpoints

### Chat API

```typescript
POST /api/chat
{
  "messages": [
    {
      "role": "user",
      "content": "Bonjour, parlez-moi de vos compétences"
    }
  ]
}

Response:
{
  "response": "Je suis Marco Pyré, développeur fullstack...",
  "images": ["image_id"],
  "function_call": {
    "name": "get_resume",
    "parameters": {}
  }
}
```

### Fonctions Disponibles

- `get_resume()` : Télécharge le CV
- `send_contact_email(sujet, message)` : Envoie un email

## 🤝 Contribution

### Guidelines

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Code Style

- **TypeScript** strict mode
- **ESLint** configuration Next.js
- **Prettier** pour le formatage
- **Conventional Commits** pour les messages

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

<div align="center">

**Développé avec ❤️ par Marco Pyré**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Marco%20Pyré-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/marcopyre)
[![GitHub](https://img.shields.io/badge/GitHub-marcopyre-black?style=for-the-badge&logo=github)](https://github.com/marcopyre)
[![Email](https://img.shields.io/badge/Email-ytmarcopyre%40gmail.com-red?style=for-the-badge&logo=gmail)](mailto:ytmarcopyre@gmail.com)

</div>
