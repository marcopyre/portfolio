from datasets import Dataset
from huggingface_hub import login, HfApi
import pandas as pd

DATASET_NAME = "marcopyre/portfolio-knowledge-base"

knowledge_base_data = [
    {
        "id": "contact",
        "category": "contact",
        "title": "Informations de Contact",
        "content": "Marco Pyré - Développeur Fullstack & Ingénierie Cloud — Orienté Architecture\nEmail: ytmarcopyre@gmail.com\nGitHub: https://github.com/marcopyre\nPortfolio: https://github.com/marcopyre/portfolio\nStatut: Recherche d'un CDI post-études (2025)",
        "keywords": ["contact", "email", "github", "marco", "pyré", "portfolio"],
        "priority": 1
    },
    {
        "id": "experience_deloitte",
        "category": "experience",
        "title": "Expérience Deloitte",
        "content": "Deloitte, Grenoble — Alternant Développeur Cloud (Septembre 2022 - Aujourd'hui)\nProjets clés :\n- Pernod Ricard - Data Portal : Conception et développement d'une solution de gestion de données, intégration cloud, architecture serverless, développement fullstack, stack: Angular, NestJS, PostgreSQL. Formation des nouveaux développeurs lors de la passation.\n- World Athletics - Stats Zone Pro : Développement d'interfaces modernes, intégration de microservices, cloud natif, stack: NextJS, Strapi. Développeur fullstack, participation à la conception de l'architecture, DevOps et publication dans le cloud AWS.\n- Deloitte - Neptune : Développement d'un SaaS modulaire, adaptable aux différents clients et déployable rapidement, utilisé comme projet vitrine de l'entreprise, stack: Angular, NestJS, PostgreSQL. Développeur fullstack et cloud, participation à tout le développement de l'application, mise en place de l'assistant IA, encadrement du déploiement Azure (certification AZ-204).\n- Odyssee : Refection totale d'un SaaS, utilisé dans un contexte scolaire, stack: Angular, NestJS, PostgreSQL.\nDéfis techniques : Résolution de bugs complexes au niveau du compilateur JavaScript via reverse engineering, collaboration sur des choix d'architecture cloud avec fort impact technique.",
        "keywords": ["deloitte", "alternant", "cloud", "angular", "nestjs", "pernod", "ricard", "world athletics", "azure", "aws", "devops", "saas", "ia", "reverse engineering"],
        "priority": 2
    },
    {
        "id": "experience_hurence_oracle",
        "category": "experience",
        "title": "Expérience Hurence et Oracle",
        "content": "Hurence, Grenoble — Stagiaire (Mai 2021 - Juin 2021) : Développement d'une interface de gestion de données massives avec frameworks Big Data\nOracle, Grenoble — Stagiaire (Décembre 2015) : Développement d'un logiciel d'encryptage",
        "keywords": ["hurence", "oracle", "stage", "big data", "encryptage", "données massives"],
        "priority": 3
    },
    {
        "id": "formation",
        "category": "formation",
        "title": "Formation",
        "content": "Master Expert en informatique et systèmes d'information - Epsi, Grenoble (2023 - 2025)\nLicence Concepteur Développeur d'Applications - Epsi, Grenoble (2020 - 2023)",
        "keywords": ["formation", "epsi", "grenoble", "master", "licence", "informatique", "études"],
        "priority": 3
    },
    {
        "id": "competences_cloud",
        "category": "competences",
        "title": "Compétences Cloud & Infrastructure",
        "content": "Expertise : Architecture cloud native, Serverless, FinOps, déploiement automatisé\nPlateformes : AWS, Azure, GCP\nDevOps : Docker, Kubernetes, CI/CD, IaC (Terraform)\nSystèmes : Linux, Windows",
        "keywords": ["cloud", "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "devops", "finops", "serverless"],
        "priority": 2
    },
    {
        "id": "competences_dev",
        "category": "competences",
        "title": "Compétences Développement",
        "content": "Langages : TypeScript, JavaScript, C++, C, Python, Java, Scala, Kotlin, Swift, C#, R, SQL, CSS, HTML\nFrameworks : NestJS, Express, Strapi, AngularJS, Next.js, SwiftUI\nOutils : Node.js, Git, VSCode, XCode, PlatformIO, Knime, Jest",
        "keywords": ["typescript", "javascript", "python", "nestjs", "nextjs", "xcode", "swiftui", "platformio", "langages", "frameworks", "git", "vscode"],
        "priority": 2
    },
    {
        "id": "competences_db",
        "category": "competences",
        "title": "Bases de Données",
        "content": "SQL : PostgreSQL, MySQL, SQLite\nNoSQL : MongoDB",
        "keywords": ["postgresql", "mysql", "mongodb", "sqlite", "sql", "nosql", "bases de données"],
        "priority": 3
    },
    {
        "id": "competences_divers",
        "category": "competences",
        "title": "Spécialisations et Autres Compétences",
        "content": "Architecture : Cloud, base de données, microservices\nFirmware / Hardware : Développement de PCB, conception de firmware\nData : Machine Learning, Data Mining, Big Data, visualisation\nAutres : Méthodologies agiles, gestion de projet, gouvernance SI",
        "keywords": ["architecture", "firmware", "hardware", "pcb", "machine learning", "gouvernance", "gestion", "microservices", "agile"],
        "priority": 3
    },
    {
        "id": "projets",
        "category": "projets",
        "title": "Projets Personnels",
        "content": "Ostea38 : Site vitrine pour une ostéopathe animalière, mis en place dans un objectif de limitation de coût tout en maximisant les performances (FinOps), développé en NextJS, utilisation de CloudFlare en tant que CDN, hébergé sur Azure, un gros travail de SEO a été effectué afin d'améliorer le référencement sur Google, qui a résulté en une première position dans les recherches, devant des sites CMS (WordPress, PrestaShop...).\nApp iOS avec Siri IA intégrée : Application mobile intelligente avec commandes vocales avancées, stack: Swift, SwiftUI.\nPCB custom : Développement d'une carte électronique avec firmware embarqué.\nProjets open-source : Contributions sur GitHub dans divers domaines (firmware, cloud, outils dev).",
        "keywords": ["osteopathie", "ios", "siri", "swift", "nextjs", "azure", "finops", "seo", "github", "open-source", "pcb", "firmware", "cloudflare", "wordpress"],
        "priority": 3
    },
    {
        "id": "certifications",
        "category": "certifications",
        "title": "Certifications",
        "content": "Microsoft Certified: Azure Developer Associate (Niveau 2)\nCertification n° 7AD53B-G21DD4",
        "keywords": ["certification", "microsoft", "azure", "developer", "associate", "az204"],
        "priority": 3
    },
    {
        "id": "langues",
        "category": "langues",
        "title": "Langues",
        "content": "Français : Langue maternelle\nAnglais : Courant (C2)",
        "keywords": ["langue", "français", "anglais", "c2", "langues"],
        "priority": 3
    },
    {
        "id": "profil",
        "category": "profil",
        "title": "Profil Professionnel",
        "content": "Marco Pyré est un développeur fullstack orienté technique, avec une forte appétence pour l'architecture cloud et les systèmes complexes. Il se distingue par sa polyvalence — cloud, back-end, front-end, firmware — et par sa curiosité constante pour les technologies de pointe. Fort de son alternance chez Deloitte, il a su relever des défis complexes allant du serverless à l'analyse bas-niveau de code, en passant par l'optimisation de pipelines cloud. En parallèle, il mène des projets personnels et open-source ambitieux. Sa discipline rigoureuse, nourrie par une pratique quotidienne d'haltérophilie depuis 2022, reflète son engagement dans la durée et sa constance. Il est aujourd'hui à la recherche d'un CDI pour poursuivre son évolution vers des postes à forte composante technique ou d'architecture.",
        "keywords": ["fullstack", "architecture", "polyvalent", "deloitte", "haltérophilie", "cdi", "profil", "cloud", "systèmes complexes", "serverless", "pipelines"],
        "priority": 1
    },
    {
        "id": "motivation_passion",
        "category": "rh",
        "title": "Motivation et Passion",
        "content": "Pourquoi ce domaine ? J'ai choisi ce domaine par passion, car depuis toujours je touche à un PC. Par souci d'apprendre, je me suis intéressé à comment il fonctionnait, puis une passion pour l'informatique en a découlé.\nQu'est-ce qui me motive ? Ce qui me motive le plus, c'est de faire ce qui me plaît. Si ce ne serait pas mon travail, je développerais quand même. En fait, je passe la plupart de mon temps à développer. Je passe mon temps libre en salle de sport ou devant mon ordinateur, à imaginer et construire de nouvelles choses.",
        "keywords": ["motivation", "passion", "pc", "informatique", "développement", "sport", "haltérophilie", "construire"],
        "priority": 2
    },
    {
        "id": "evolution_carriere",
        "category": "rh",
        "title": "Évolution de Carrière",
        "content": "Où vous voyez-vous dans 5 ans ? J'aimerais évoluer vers un poste Senior dans le même domaine, ou m'orienter vers un poste d'architecte Cloud, afin d'évoluer et de voir plus de choses.",
        "keywords": ["évolution", "carrière", "senior", "architecte", "cloud", "5 ans"],
        "priority": 2
    },
    {
        "id": "projet_fier",
        "category": "rh",
        "title": "Projet Dont Je Suis Fier",
        "content": "Pouvez-vous me décrire un projet dont vous êtes particulièrement fier ? Cette question est difficile, c'est comme me demander de choisir un enfant favori. J'ai cependant une préférence pour la complexité technique et le challenge. Je dirais donc que mon projet favori serait le projet AirF, qui m'a énormément challengé et sur lequel j'ai beaucoup appris.",
        "keywords": ["projet", "fier", "complexité", "challenge", "airf", "apprentissage"],
        "priority": 3
    },
    {
        "id": "defi_professionnel",
        "category": "rh",
        "title": "Plus Grand Défi Professionnel",
        "content": "Quel a été votre plus grand défi professionnel et comment l'avez-vous surmonté ? Mon plus grand défi professionnel était sûrement ma certification Azure, que j'ai obtenue après beaucoup d'apprentissage et de persévérance.",
        "keywords": ["défi", "professionnel", "certification", "azure", "apprentissage", "persévérance"],
        "priority": 3
    },
    {
        "id": "resultats_concrets",
        "category": "rh",
        "title": "Résultats Concrets",
        "content": "Quels résultats concrets avez-vous obtenus dans vos précédents postes ? Lors de déploiement d'applications auprès de clients, leur satisfaction est pour moi le meilleur retour que l'on puisse avoir.",
        "keywords": ["résultats", "concrets", "déploiement", "clients", "satisfaction"],
        "priority": 3
    },
    {
        "id": "travail_equipe",
        "category": "rh",
        "title": "Travail en Équipe",
        "content": "Comment travaillez-vous en équipe ? J'ai pour habitude de mettre en place les méthodes agiles.",
        "keywords": ["équipe", "travail", "méthodes", "agiles", "collaboration"],
        "priority": 3
    },
    {
        "id": "gestion_stress",
        "category": "rh",
        "title": "Gestion du Stress",
        "content": "Comment gérez-vous le stress et les deadlines ? De mon point de vue, je les gère très bien. Je ne suis pas de nature stressée, je garde la tête froide et je me concentre sur mon objectif.",
        "keywords": ["stress", "deadlines", "gestion", "tête froide", "concentration", "objectif"],
        "priority": 3
    }
]


def create_dataset():
    df = pd.DataFrame(knowledge_base_data)
    return Dataset.from_pandas(df)

def upload_to_huggingface(dataset):
    dataset.push_to_hub(
        DATASET_NAME,
        private=False,
        commit_message="Knowledge base mise à jour complète pour Marco Pyré avec informations RH"
    )
    print(f"Dataset uploadé: https://huggingface.co/datasets/{DATASET_NAME}")

def create_dataset_card():
    card_content = """
# Marco Pyré Portfolio Knowledge Base

Ce dataset contient les informations structurées du portfolio de Marco Pyré, développeur fullstack spécialisé en cloud et architecture.

## Structure

- **id**: Identifiant unique du chunk
- **category**: Catégorie (contact, experience, competences, projets, rh, etc.)
- **title**: Titre du chunk
- **content**: Contenu détaillé
- **keywords**: Mots-clés pour la recherche
- **priority**: Priorité (1=haute, 3=basse)

## Catégories

- **contact**: Informations de contact
- **experience**: Expérience professionnelle
- **competences**: Compétences techniques
- **projets**: Projets personnels
- **certifications**: Certifications obtenues
- **formation**: Formation académique
- **langues**: Langues parlées
- **profil**: Profil professionnel général
- **rh**: Réponses aux questions RH courantes

## Utilisation

Ce dataset est conçu pour alimenter un chatbot portfolio avec une knowledge base structurée permettant de répondre aux questions sur Marco Pyré, ses compétences, son expérience et ses projets.

## Licence

Les informations sont publiques et peuvent être utilisées pour présenter Marco Pyré.

Code du portfolio: https://github.com/marcopyre/portfolio
Contact: ytmarcopyre@gmail.com
"""
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(card_content)

if __name__ == "__main__":
    dataset = create_dataset()
    create_dataset_card()
    upload_to_huggingface(dataset)
    print("Knowledge Base mise à jour et uploadée avec succès !")
    print(f"Total de {len(knowledge_base_data)} chunks créés")