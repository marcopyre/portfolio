from datasets import Dataset
from huggingface_hub import login, HfApi
import pandas as pd

DATASET_NAME = "marcopyre/portfolio-knowledge-base"

knowledge_base_data = [
    {
        "id": "contact",
        "category": "contact",
        "title": "Informations de Contact",
        "content": "Marco Pyré - Développeur Fullstack & Ingénierie Cloud — Orienté Architecture\nEmail: ytmarcopyre@gmail.com\nGitHub: https://github.com/marcopyre\nStatut: Recherche d'un CDI post-études (2025)",
        "keywords": ["contact", "email", "github", "marco", "pyré"],
        "priority": 1
    },
    {
        "id": "experience_deloitte",
        "category": "experience",
        "title": "Expérience Deloitte",
        "content": "Deloitte, Grenoble — Alternant Développeur Cloud (Septembre 2022 - Aujourd'hui)\nProjets clés:\n- Pernod Ricard - Data Portal : fullstack, serverless, Angular, NestJS, PostgreSQL. Formation des nouveaux développeurs.\n- World Athletics - Stats Zone Pro : NextJS, Strapi, cloud natif AWS, dev fullstack, conception d’architecture et DevOps.\n- Deloitte - Neptune : SaaS vitrine, Angular, NestJS, PostgreSQL, assistant IA, déploiement Azure encadré suite à la certification AZ-204.\n- Odyssee : refonte d’un SaaS scolaire, Angular, NestJS, PostgreSQL.\nDéfis : Bugs compilateur JS (reverse engineering), choix d’architecture cloud critiques.",
        "keywords": ["deloitte", "alternant", "cloud", "angular", "nestjs", "pernod", "ricard", "world", "athletics", "azure", "aws", "devops"],
        "priority": 2
    },
    {
        "id": "experience_hurence_oracle",
        "category": "experience",
        "title": "Expérience Hurence et Oracle",
        "content": "Hurence (Mai-Juin 2021) : Interface de gestion de données massives avec frameworks Big Data\nOracle (Décembre 2015) : Développement d’un logiciel d’encryptage",
        "keywords": ["hurence", "oracle", "stage", "big data", "encryptage"],
        "priority": 3
    },
    {
        "id": "competences_cloud",
        "category": "competences",
        "title": "Compétences Cloud & Infrastructure",
        "content": "Architecture cloud native, Serverless, FinOps, déploiement automatisé\nPlateformes : AWS, Azure, GCP\nDevOps : Docker, Kubernetes, CI/CD, Terraform\nSystèmes : Linux, Windows",
        "keywords": ["cloud", "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "devops"],
        "priority": 2
    },
    {
        "id": "competences_dev",
        "category": "competences",
        "title": "Compétences Développement",
        "content": "Langages : TypeScript, JavaScript, C++, C, Python, Java, Scala, Kotlin, Swift, C#, R, SQL, CSS, HTML\nFrameworks : NestJS, Express, Strapi, AngularJS, Next.js, SwiftUI\nOutils : Node.js, Git, VSCode, XCode, PlatformIO, Knime, Jest",
        "keywords": ["typescript", "javascript", "python", "nestjs", "nextjs", "xcode", "swiftui", "platformio"],
        "priority": 2
    },
    {
        "id": "competences_db",
        "category": "competences",
        "title": "Bases de Données",
        "content": "SQL : PostgreSQL, MySQL, SQLite\nNoSQL : MongoDB",
        "keywords": ["postgresql", "mysql", "mongodb", "sqlite", "sql", "nosql"],
        "priority": 3
    },
    {
        "id": "competences_divers",
        "category": "competences",
        "title": "Spécialisations et Autres Compétences",
        "content": "Architecture cloud, microservices, bases de données\nFirmware/Hardware : développement de PCB, conception de firmware\nData : ML, data mining, big data, visualisation\nMéthodologies agiles, gestion de projet, gouvernance SI",
        "keywords": ["firmware", "pcb", "architecture", "data", "ml", "big data", "gouvernance", "agile"],
        "priority": 3
    },
    {
        "id": "formation",
        "category": "formation",
        "title": "Formation",
        "content": "Master Expert en informatique et systèmes d'information - Epsi Grenoble (2023 - 2025)\nLicence Concepteur Développeur d'Applications - Epsi Grenoble (2020 - 2023)",
        "keywords": ["formation", "epsi", "grenoble", "master", "licence", "informatique"],
        "priority": 3
    },
    {
        "id": "projets",
        "category": "projets",
        "title": "Projets Personnels",
        "content": "App iOS avec Siri IA : commandes vocales, Swift/SwiftUI\nPCB custom : carte électronique avec firmware\nOpen-source : Contributions GitHub (firmware, cloud, outils dev)",
        "keywords": ["ios", "siri", "swift", "pcb", "firmware", "opensource", "github"],
        "priority": 3
    },
    {
        "id": "certifications",
        "category": "certifications",
        "title": "Certifications",
        "content": "Microsoft Certified: Azure Developer Associate (Niveau 2)\nCertification n° 7AD53B-G21DD4",
        "keywords": ["certification", "microsoft", "azure", "developer", "associate"],
        "priority": 3
    },
    {
        "id": "langues",
        "category": "langues",
        "title": "Compétences Linguistiques",
        "content": "Français : Langue maternelle\nAnglais : Courant (C2)",
        "keywords": ["langue", "français", "anglais", "c2"],
        "priority": 3
    },
    {
        "id": "profil",
        "category": "profil",
        "title": "Profil Professionnel",
        "content": "Développeur fullstack orienté technique avec forte appétence pour l’architecture cloud et les systèmes complexes. Polyvalent (cloud, back-end, front-end, firmware), curieux, rigoureux. Alternance chez Deloitte : défis cloud & serverless, reverse engineering, pipelines. Projets open-source et personnels. Discipline quotidienne en haltérophilie depuis 2022. Recherche CDI à forte composante technique/architecture.",
        "keywords": ["fullstack", "architecture", "polyvalent", "deloitte", "haltérophilie", "cdi"],
        "priority": 1
    }
]

def create_dataset():
    df = pd.DataFrame(knowledge_base_data)
    return Dataset.from_pandas(df)

def upload_to_huggingface(dataset):
    dataset.push_to_hub(
        DATASET_NAME,
        private=False,
        commit_message="Knowledge base mise à jour pour Marco Pyré"
    )
    print(f"Dataset uploadé: https://huggingface.co/datasets/{DATASET_NAME}")

def create_dataset_card():
    card_content = """
# Marco Pyré Portfolio Knowledge Base

Ce dataset contient les informations structurées du portfolio de Marco Pyré, développeur fullstack spécialisé en cloud.

## Structure

- **id**: Identifiant unique du chunk
- **category**: Catégorie (contact, experience, competences, etc.)
- **title**: Titre du chunk
- **content**: Contenu détaillé
- **keywords**: Mots-clés pour la recherche
- **priority**: Priorité (1=haute, 3=basse)

## Utilisation

Ce dataset est conçu pour alimenter un chatbot portfolio avec une knowledge base structurée.

## Licence

Les informations sont publiques et peuvent être utilisées pour présenter Marco Pyré.

Code du portfolio: https://github.com/marcopyre/portfolio
"""
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(card_content)

if __name__ == "__main__":
    dataset = create_dataset()
    create_dataset_card()
    upload_to_huggingface(dataset)
    print("Knowledge Base mise à jour et uploadée avec succès !")
