import { InferenceClient } from "@huggingface/inference";
import { type NextRequest, NextResponse } from "next/server";

const client = new InferenceClient(process.env.HF_TOKEN);

// Knowledge Base du portfolio - Marco Pyré
const KNOWLEDGE_BASE = `
INFORMATIONS PORTFOLIO - MARCO PYRÉ
Développeur Fullstack - Ingénierie Cloud

## Informations de Contact
- **Email**: ytmarcopyre@gmail.com
- **Statut**: Recherche d'une opportunité post études (alternance)

## Expérience Professionnelle

### Deloitte, Grenoble — Alternant Développeur Cloud
**Septembre 2022 - AUJOURD'HUI**
- **Projet Pernod Ricard - Data Portal**: Conception et développement d'une solution de gestion de données avec développement front-end et back-end, intégration avec services cloud
- **Projet World Athletics - Stats Zone Pro**: Développement d'interfaces utilisateur modernes et implémentation d'architectures cloud natives

### Hurence, Grenoble — Stagiaire
**Mai 2021 - Juin 2021**
- Création d'une interface utilisateur de gestion de données massives (Big Data)
- Intégration avec des frameworks de big data

### Oracle, Grenoble — Stagiaire
**Décembre 2015**
- Développement d'un logiciel d'encryptage

## Formation
- **Master Expert en informatique et systèmes d'information** - Epsi, Grenoble (Septembre 2023 - Septembre 2025)
- **Licence concepteur développeur d'applications** - Epsi, Grenoble (Septembre 2020 - Septembre 2023)

## Compétences Techniques

### Cloud & Infrastructure
- **Plateformes Cloud**: AWS, Azure, GCP
- **Systèmes**: Linux, Windows
- **DevOps**: CI/CD, Docker, Kubernetes
- **FinOps**: Optimisation des coûts cloud

### Développement
- **Langages**: TypeScript, JavaScript, C++, C, Python, Java, Scala, Kotlin, Swift, C#, R, SQL, CSS, HTML
- **Infrastructure as Code**: Terraform
- **Frameworks**: Express, NestJs, Strapi, Angular, Next.js, SwiftUI, Jest
- **Outils**: Node.js, Git, CI/CD, VSCode, XCode, PlatformIO, Knime

### Bases de Données
- **Relationnelles**: PostgreSQL, MySQL, SQLite
- **NoSQL**: MongoDB

### Spécialisations
- **Architecture**: Conception d'Architecture, Conception de base de données
- **Firmware**: Conception de Firmware
- **Data**: Machine Learning, Data Science, Data Mining, Data Visualisation, Big Data
- **Gestion de projet**: Méthodes agiles, rédaction de cahier des charges, élaboration de stratégies SI, gouvernance

## Certifications
- **Microsoft Certified: Azure Developer Associate** (Certification niveau 2)
- **Numéro de certification**: 7AD53B-G21DD4

## Langues
- **Français**: Langue maternelle
- **Anglais**: Fluent (C2)

## Projets Notables
- **Data Portal Pernod Ricard**: Solution complète de gestion de données avec architecture cloud native
- **Stats Zone Pro World Athletics**: Interface utilisateur moderne pour les statistiques sportives
- **Interface Big Data**: Gestion de données massives avec intégration de frameworks spécialisés
- **Logiciel d'encryptage**: Développement de solutions de sécurité

## Expertise Technique
Marco Pyré est un développeur fullstack spécialisé dans l'ingénierie cloud avec une forte expertise en :
- Développement d'applications web modernes (front-end et back-end)
- Architecture cloud native sur AWS, Azure et GCP
- Gestion et traitement de données massives
- Intégration de services cloud
- Méthodologies DevOps et FinOps
- Développement multi-plateforme (web, mobile, desktop)

## Profil Professionnel
Actuellement en Master Expert en informatique et systèmes d'information, Marco combine une solide expérience pratique chez Deloitte avec des compétences techniques polyvalentes. Il recherche une opportunité post-études en alternance pour continuer à développer son expertise en ingénierie cloud et développement fullstack.
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.HF_TOKEN) {
      return NextResponse.json(
        { error: "Token Hugging Face manquant" },
        { status: 500 }
      );
    }

    // Construire le contexte avec la knowledge base
    const systemMessage = {
      role: "system" as const,
      content: `Tu es Marco Pyré, développeur fullstack spécialisé en ingénierie cloud. Tu dois répondre aux questions en te basant sur les informations suivantes :

${KNOWLEDGE_BASE}

Instructions :
- Réponds de manière professionnelle mais accessible
- Utilise les informations de la knowledge base pour répondre précisément sur Marco Pyré
- Si une question sort du cadre du portfolio, redirige poliment vers les compétences et projets de Marco
- Sois enthousiaste à propos des technologies et projets mentionnés
- Propose des exemples concrets basés sur l'expérience de Marco (Deloitte, projets Pernod Ricard, World Athletics, etc.)
- Réponds de manière naturelle et engageante
- Mets en avant l'expertise cloud native, le développement fullstack et l'expérience en alternance
- Souligne la recherche d'opportunité post-études si pertinent`,
    };

    // Préparer les messages avec le contexte système
    const chatMessages = [
      systemMessage,
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const chatCompletion = await client.chatCompletion({
      model: "google/gemma-2b-it",
      messages: chatMessages,
      max_tokens: 400, // Réduire pour économiser
      temperature: 0.6,
    });

    const response =
      chatCompletion.choices[0]?.message?.content ||
      "Désolé, je n'ai pas pu générer une réponse.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Erreur API Chat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la réponse" },
      { status: 500 }
    );
  }
}
