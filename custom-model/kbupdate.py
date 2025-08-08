from datasets import Dataset
from huggingface_hub import login, HfApi

DATASET_NAME = "marcopyre/portfolio-knowledge-base"

knowledge_base_data = knowledge_base_data = [
    {
        "id": "contact",
        "category": "contact",
        "title": "Contact Information",
        "content": "Marco Pyré – Fullstack Developer & Cloud Engineering — Architecture Oriented\nEmail: ytmarcopyre@gmail.com\nGitHub: https://github.com/marcopyre\nPortfolio: https://github.com/marcopyre/portfolio\nStatus: Seeking a full-time position post-graduation (2025)",
        "keywords": ["contact", "email", "github", "marco", "pyré", "portfolio"],
        "priority": 1
    },
    {
        "id": "experience_deloitte",
        "category": "experience",
        "title": "Deloitte Experience",
        "content": "Deloitte, Grenoble — Cloud Developer Apprentice (September 2022 - Present)\nKey projects:\n- Pernod Ricard - Data Portal: Designed and developed a data management solution, cloud integration, serverless architecture, fullstack development, stack: Angular, NestJS, PostgreSQL. Trained new developers during the handover.\n- World Athletics - Stats Zone Pro: Built modern interfaces, integrated microservices, cloud-native deployment, stack: NextJS, Strapi. Fullstack developer, contributed to architectural design, DevOps, and cloud publishing (AWS).\n- Deloitte - Neptune: Developed a modular SaaS product, adaptable to various clients and quickly deployable, used as a company showcase project, stack: Angular, NestJS, PostgreSQL. Fullstack and cloud developer, led full app development, integrated an AI assistant, and supervised Azure deployment (AZ-204 certified).\n- Odyssee: Complete overhaul of a SaaS used in an educational context, stack: Angular, NestJS, PostgreSQL.\nTechnical challenges: Solved complex JavaScript compiler bugs via reverse engineering, collaborated on impactful cloud architecture decisions.",
        "keywords": ["deloitte", "apprentice", "cloud", "angular", "nestjs", "pernod", "ricard", "world athletics", "azure", "aws", "devops", "saas", "ai", "reverse engineering"],
        "priority": 2
    },
    {
        "id": "experience_hurence_oracle",
        "category": "experience",
        "title": "Hurence and Oracle Experience",
        "content": "Hurence, Grenoble — Intern (May 2021 - June 2021): Developed a big data management interface using Big Data frameworks.\nOracle, Grenoble — Intern (December 2015): Developed encryption software.",
        "keywords": ["hurence", "oracle", "internship", "big data", "encryption", "data"],
        "priority": 3
    },
    {
        "id": "formation",
        "category": "formation",
        "title": "Education",
        "content": "Master's Degree – IT and Information Systems Expert - Epsi, Grenoble (2023 - 2025)\nBachelor's Degree – Application Developer - Epsi, Grenoble (2020 - 2023)",
        "keywords": ["education", "epsi", "grenoble", "master", "bachelor", "computer science", "studies"],
        "priority": 3
    },
    {
        "id": "competences_cloud",
        "category": "competences",
        "title": "Cloud & Infrastructure Skills",
        "content": "Expertise: Cloud-native architecture, Serverless, FinOps, automated deployment\nPlatforms: AWS, Azure, GCP\nDevOps: Docker, Kubernetes, CI/CD, IaC (Terraform)\nSystems: Linux, Windows",
        "keywords": ["cloud", "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "devops", "finops", "serverless"],
        "priority": 2
    },
    {
        "id": "competences_dev",
        "category": "competences",
        "title": "Development Skills",
        "content": "Languages: TypeScript, JavaScript, C++, C, Python, Java, Scala, Kotlin, Swift, C#, R, SQL, CSS, HTML\nFrameworks: NestJS, Express, Strapi, AngularJS, Next.js, SwiftUI\nTools: Node.js, Git, VSCode, XCode, PlatformIO, Knime, Jest",
        "keywords": ["typescript", "javascript", "python", "nestjs", "nextjs", "xcode", "swiftui", "platformio", "languages", "frameworks", "git", "vscode"],
        "priority": 2
    },
    {
        "id": "competences_db",
        "category": "competences",
        "title": "Databases",
        "content": "SQL: PostgreSQL, MySQL, SQLite\nNoSQL: MongoDB",
        "keywords": ["postgresql", "mysql", "mongodb", "sqlite", "sql", "nosql", "databases"],
        "priority": 3
    },
    {
        "id": "competences_divers",
        "category": "competences",
        "title": "Specializations & Other Skills",
        "content": "Architecture: Cloud, database, microservices\nFirmware / Hardware: PCB development, firmware design\nData: Machine Learning, Data Mining, Big Data, visualization\nOthers: Agile methodologies, project management, IT governance",
        "keywords": ["architecture", "firmware", "hardware", "pcb", "machine learning", "governance", "management", "microservices", "agile"],
        "priority": 3
    },
    {
        "id": "projets",
        "category": "projets",
        "title": "Personal Projects",
        "content": "Ostea38: Showcase site for an animal osteopath, built with cost optimization and performance in mind (FinOps), developed with NextJS, CloudFlare as CDN, hosted on Azure. Extensive SEO work resulted in top Google ranking, ahead of CMS platforms (WordPress, PrestaShop...).\niOS App with Integrated Siri AI: Smart mobile app with advanced voice commands, stack: Swift, SwiftUI.\nCustom PCB: Developed an electronic board with embedded firmware.\nOpen-source Projects: GitHub contributions across various areas (firmware, cloud, dev tools).",
        "keywords": ["osteopathy", "ios", "siri", "swift", "nextjs", "azure", "finops", "seo", "github", "open-source", "pcb", "firmware", "cloudflare", "wordpress"],
        "priority": 3
    },
    {
        "id": "certifications",
        "category": "certifications",
        "title": "Certifications",
        "content": "Microsoft Certified: Azure Developer Associate (Level 2)\nCertificate ID: 7AD53B-G21DD4",
        "keywords": ["certification", "microsoft", "azure", "developer", "associate", "az204"],
        "priority": 3
    },
    {
        "id": "langues",
        "category": "langues",
        "title": "Languages",
        "content": "French: Native\nEnglish: Fluent (C2)",
        "keywords": ["language", "french", "english", "c2", "languages"],
        "priority": 3
    },
    {
        "id": "profil",
        "category": "profil",
        "title": "Professional Profile",
        "content": "Marco Pyré is a technically oriented fullstack developer with a strong focus on cloud architecture and complex systems. He stands out for his versatility — cloud, back-end, front-end, firmware — and his constant curiosity for cutting-edge technologies. Through his apprenticeship at Deloitte, he tackled complex challenges from serverless architectures to low-level code analysis and cloud pipeline optimization. In parallel, he leads ambitious personal and open-source projects. His rigorous discipline, reinforced by daily weight training since 2022, reflects his long-term commitment and consistency. He is now looking for a full-time position to grow into technical or architecture-focused roles.",
        "keywords": ["fullstack", "architecture", "versatile", "deloitte", "weightlifting", "full-time", "profile", "cloud", "complex systems", "serverless", "pipelines"],
        "priority": 1
    },
    {
        "id": "motivation_passion",
        "category": "rh",
        "title": "Motivation and Passion",
        "content": "Why this field? I chose this field out of passion. I've always been hands-on with computers. Driven by a thirst for knowledge, I started exploring how they work, and naturally developed a love for IT.\nWhat motivates me? What motivates me most is doing what I love. Even if it weren’t my job, I would still be coding. I spend most of my time developing, either at the gym or in front of my computer, imagining and building new things.",
        "keywords": ["motivation", "passion", "computer", "IT", "development", "gym", "weightlifting", "building"],
        "priority": 2
    },
    {
        "id": "evolution_carriere",
        "category": "rh",
        "title": "Career Growth",
        "content": "Where do you see yourself in 5 years? I hope to evolve into a Senior role in the same field or move toward a Cloud Architect position to broaden my horizons.",
        "keywords": ["career", "growth", "senior", "architect", "cloud", "5 years"],
        "priority": 2
    },
    {
        "id": "projet_fier",
        "category": "rh",
        "title": "Proud Project",
        "content": "Can you describe a project you're particularly proud of? That’s a tough one — like picking a favorite child. However, I lean towards technically complex and challenging projects. I’d say the AirF project, which pushed me to my limits and taught me a lot, is the one I’m most proud of.",
        "keywords": ["project", "proud", "complexity", "challenge", "airf", "learning"],
        "priority": 3
    },
    {
        "id": "defi_professionnel",
        "category": "rh",
        "title": "Greatest Professional Challenge",
        "content": "What was your biggest professional challenge and how did you overcome it? My greatest professional challenge was likely earning my Azure certification, which I achieved through dedication and persistence.",
        "keywords": ["challenge", "professional", "certification", "azure", "learning", "perseverance"],
        "priority": 3
    },
    {
        "id": "resultats_concrets",
        "category": "rh",
        "title": "Tangible Results",
        "content": "What concrete results have you achieved in your past roles? During app deployments for clients, their satisfaction has always been the most rewarding result for me.",
        "keywords": ["results", "concrete", "deployment", "clients", "satisfaction"],
        "priority": 3
    },
    {
        "id": "travail_equipe",
        "category": "rh",
        "title": "Teamwork",
        "content": "How do you work in a team? I usually implement agile methodologies.",
        "keywords": ["team", "work", "methods", "agile", "collaboration"],
        "priority": 3
    },
    {
        "id": "gestion_stress",
        "category": "rh",
        "title": "Stress Management",
        "content": "How do you handle stress and deadlines? I handle them well. I’m not naturally stressed, I stay calm and focused on my goals.",
        "keywords": ["stress", "deadlines", "management", "calm", "focus", "goal"],
        "priority": 3
    }
]


def create_dataset():
    # Crée directement depuis une liste de dictionnaires, pas besoin de pandas
    return Dataset.from_list(knowledge_base_data)

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