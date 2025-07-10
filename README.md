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
- [📄 API Endpoints](#-api-endpoints)

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
- **Système de notifications email** via Resend (production uniquement)

## 🏗️ Architecture

```mermaid
graph TB
    A[Frontend - GitHub Pages] --> B[API - Vercel]
    B --> C[LLM - Hugging Face]
    D[RAG Database - Hugging Face] --> C
    B --> E[Email Service - Resend]

    G[Google Gemma] --> C

```

### 📊 Stack Technique

| Composant         | Technologie           | Hébergement  |
| ----------------- | --------------------- | ------------ |
| **Frontend**      | Next.js 15 + React 19 | GitHub Pages |
| **Backend**       | Next.js API Routes    | Vercel       |
| **IA Model**      | Google Gemma-2B-IT    | Hugging Face |
| **RAG Database**  | Vector Database       | Hugging Face |
| **Styling**       | Tailwind CSS 4        | -            |
| **Language**      | TypeScript            | -            |
| **Email Service** | Resend                | -            |

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

### 📧 Email Service (Resend)

- **Service** : Notifications automatiques
- **Environnement** : Production uniquement
- **Types** : Alertes d'erreur, logs de conversation, notifications de crédits
- **Destinataire** : Marco Pyré (ytmarcopyre@gmail.com)

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
  "resend": "^3.0.0",
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
HF_TOKEN=your_huggingface_token

# Resend Email Service (pour les notifications)
RESEND_API_KEY=your_resend_api_key
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

## 📧 Services

### Email Service (Resend)

- **Environnement** : Production uniquement (`NODE_ENV=production`)
- **Notifications** : Alertes d'erreur, logs de conversation, crédits épuisés
- **Configuration** : Variable d'environnement `RESEND_API_KEY`
- **Sécurité** : Emails désactivés en développement pour éviter les envois accidentels

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

// Ouverture du Github du projet
get_source_code(): Promise<void>

// Ouverture du site ostea38.fr
get_ostea38(): Promise<void>
```

## 🌐 Internationalisation

### Langues Supportées

- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **Anglais**

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

## 🚨 Gestion d'Erreur & Notifications

### Crédits Hugging Face Épuisés

Le système détecte automatiquement les erreurs de crédits Hugging Face et :

1. **Affiche un message utilisateur** : "Je suis à court de token, une notification a été envoyé à Marco, le soucis seras corrigé d'ici peu."
2. **Envoie une notification email** à Marco via Resend (production uniquement)
3. **Log les erreurs** pour le debugging

### Système de Notifications Email

Le système envoie automatiquement des emails via Resend **uniquement en production** :

- **Alertes de crédits épuisés** : Notification immédiate quand les crédits Hugging Face sont épuisés
- **Logs de conversation** : Chaque conversation utilisateur + réponse du bot
- **Erreurs système** : Notifications pour les erreurs techniques

### Configuration Resend

1. Créez un compte sur [Resend](https://resend.com)
2. Obtenez votre clé API
3. Configurez la variable d'environnement `RESEND_API_KEY`
4. Vérifiez votre domaine d'envoi dans Resend
5. Les emails ne sont envoyés qu'en environnement de production (`NODE_ENV=production`)

---

<div align="center">

**Développé avec ❤️ par Marco Pyré**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Marco%20Pyré-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/marcopyre)
[![GitHub](https://img.shields.io/badge/GitHub-marcopyre-black?style=for-the-badge&logo=github)](https://github.com/marcopyre)
[![Email](https://img.shields.io/badge/Email-ytmarcopyre%40gmail.com-red?style=for-the-badge&logo=gmail)](mailto:ytmarcopyre@gmail.com)

</div>
