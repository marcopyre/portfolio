const fs = require('fs').promises;
const { HfInference } = require('@huggingface/inference');
const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

class PortfolioDataUploader {
    constructor() {
        this.hf = new HfInference(process.env.HF_TOKEN);
        this.pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        
        this.indexName = 'portfolio-knowledge-base';
        this.index = null;
        
        this.embeddingModel = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';
    }

    buildKeywords(list) {
        try {
            if (Array.isArray(list)) return list.join(', ');
            if (typeof list === 'string') return list;
            if (list && typeof list === 'object') return Object.values(list).flat().join(', ');
            return '';
        } catch {
            return '';
        }
    }

    async translateToEnglish(text) {
        try {
            const res = await this.hf.translation({
                model: 'facebook/nllb-200-distilled-600M',
                inputs: text,
                source_language: 'fra_Latn',
                target_language: 'eng_Latn'
            });
            if (Array.isArray(res) && res.length > 0 && res[0].translation_text) {
                return String(res[0].translation_text);
            }
            if (res && res.translation_text) {
                return String(res.translation_text);
            }
            return text;
        } catch {
            return text;
        }
    }

    async ensureEnglish(text) {
        return this.translateToEnglish(text);
    }

    normalizeTags(tags) {
        return Array.from(
            new Set(
                (tags || [])
                    .filter(Boolean)
                    .map(t => String(t).toLowerCase().trim())
                    .filter(t => t.length > 0)
            )
        );
    }

    async translateKeywordsToEnglish(tags) {
        const unique = this.normalizeTags(tags);
        const translated = await Promise.all(unique.map(k => this.translateToEnglish(k)));
        return this.normalizeTags(translated);
    }

    async initialize() {
        try {
            this.index = this.pinecone.index(this.indexName);
            console.log('Connected to Pinecone');
        } catch (error) {
            console.error('Initialization failed:', error.message);
            throw error;
        }
    }

    async generateEmbedding(text) {
        try {
            const response = await this.hf.featureExtraction({
                model: this.embeddingModel,
                inputs: text
            });
            return Array.isArray(response) ? response : Array.from(response);
        } catch (error) {
            console.error('Embedding generation failed:', error);
            throw error;
        }
    }

    getPortfolioData() {
        return {
            general: {
                name: "Marco Pyré",
                title: "Fullstack Developer & Cloud Engineering — Architecture-Oriented",
                email: "ytmarcopyre@gmail.com",
                github: "https://github.com/marcopyre",
                linkedin: "https://linkedin.com/in/marco-pyré-51187b200",
                portfolio: "https://marcopyre.github.io/portfolio/",
                status: "Currently working as Ingénieur Développeur Intégrateur d'Applications Médicales at CHPF, Papeete, Tahiti (since November 2025)"
            },

            experiences: [
                {
                    company: "Centre Hospitalier de Polynésie française (CHPF)",
                    location: "Papeete, Tahiti",
                    position: "Ingénieur Développeur Intégrateur d'Applications Médicales",
                    period: "November 2025 – Present",
                    description: "Development and maintenance of critical medical software in Java Spring Boot (backend) and Angular (frontend). Integration with IBM AS400/iSeries systems via JDBC connectors. Interfacing with medical equipment via standardized health protocols. Management of sensitive medical data following hospital regulations (confidentiality, traceability, patient data integrity). Setup of Kubernetes infrastructure for hospital information system orchestration.",
                    stack: ["Java", "Spring Boot", "Angular", "IBM AS400", "IBM DB2 for i", "JDBC", "Kubernetes"]
                },
                {
                    company: "Deloitte",
                    location: "Grenoble",
                    position: "Cloud Developer Apprentice",
                    period: "September 2022 - September 2025",
                    description: "Fullstack and cloud development on multiple high-impact projects for major clients.",
                    stack: ["Angular", "NestJS", "PostgreSQL", "Next.js", "Strapi", "AWS", "Azure", "TypeScript"]
                },
                {
                    company: "Hurence",
                    location: "Grenoble",
                    position: "Intern",
                    period: "May 2021 - June 2021",
                    description: "Development of a massive data management interface using Big Data frameworks",
                    stack: ["Big Data"]
                },
                {
                    company: "Oracle",
                    location: "Grenoble",
                    position: "Intern",
                    period: "December 2015",
                    description: "Development of encryption software",
                    stack: []
                }
            ],

            projects: [
                {
                    name: "CHPF - Medical Information System",
                    role: "Medical Application Developer",
                    stack: ["Java", "Spring Boot", "Angular", "IBM AS400", "IBM DB2 for i", "JDBC", "Kubernetes"],
                    type: "Professional",
                    description: "Development and maintenance of critical medical software for the Centre Hospitalier de Polynésie française (CHPF), the main public hospital in French Polynesia, including Java Spring Boot backend development, Angular frontend development, IBM AS400/iSeries legacy systems integration using JDBC/JTOpen, development of data exchange services between modern applications and the hospital information system, medical device interfacing through standardized healthcare protocols, secure management of sensitive patient and medical data with confidentiality, traceability and integrity constraints, Kubernetes infrastructure setup for hospital application orchestration, and technical architecture and infrastructure deployment decisions."
                },
                {
                    name: "Pernod Ricard - Data Portal",
                    role: "Fullstack Developer & Trainer",
                    stack: ["Angular", "NestJS", "PostgreSQL"],
                    type: "Professional",
                    description: "Design and development of a data management solution, cloud integration, serverless architecture. Conducted training for new developers during handover."
                },
                {
                    name: "World Athletics - Stats Zone Pro",
                    role: "Fullstack Developer & DevOps",
                    stack: ["Next.js", "Strapi", "AWS"],
                    type: "Professional",
                    description: "Development of modern interfaces, microservices integration, cloud native. Participated in architecture design and AWS cloud deployment."
                },
                {
                    name: "Deloitte - Neptune",
                    role: "Fullstack & Cloud Developer",
                    stack: ["Angular", "NestJS", "PostgreSQL", "Azure", "PyTorch", "TensorFlow"],
                    type: "Professional",
                    description: "Development of a modular SaaS, company's showcase project. AI assistant implementation with RAG architecture and GPU-accelerated ML workflows. Supervised Azure cloud deployment following AZ-204 certification."
                },
                {
                    name: "Odyssee",
                    role: "Fullstack Developer",
                    stack: ["Angular", "NestJS", "PostgreSQL"],
                    type: "Professional",
                    description: "Complete rebuild of a SaaS used in educational context. Client presentations and technical demonstrations to stakeholders."
                },
                {
                    name: "Ostea38",
                    role: "Full Development",
                    stack: ["Next.js", "Azure", "Cloudflare"],
                    type: "Personal",
                    description: "Showcase website for an animal osteopath with FinOps optimization. Achieved first position in Google searches through extensive SEO work, ahead of CMS sites like WordPress and PrestaShop."
                },
                {
                    name: "AirF - Hardware AI Voice Assistant",
                    role: "Full Stack Hardware & Software Developer",
                    stack: ["TensorFlow", "PyTorch", "Swift", "SwiftUI", "C/C++", "KiCad", "PlatformIO"],
                    type: "Personal",
                    description: "Physical AI voice assistant project in progress since 2022. TensorFlow and PyTorch for voice processing, Swift/SwiftUI mobile app for device control, custom PCB designed with KiCad, C/C++ firmware with PlatformIO. End-to-end project combining machine learning, mobile development and hardware engineering."
                },
                {
                    name: "Portfolio - RAG Chatbot",
                    role: "Full Developer",
                    stack: ["RAG", "Vector Database", "Cloud"],
                    type: "Personal",
                    description: "Intelligent chatbot using Retrieval-Augmented Generation (RAG) architecture, vector database for semantic search, deployed with scalable cloud infrastructure. Available at marcopyre.github.io/portfolio/"
                }
            ],

            skills: {
                languages: [
                    "TypeScript", "JavaScript", "Python", "Java", "C++", "C", "C#", "SQL",
                    "Swift", "Kotlin", "Scala", "R", "CSS", "HTML"
                ],
                
                frameworks: [
                    "Angular", "React", "Next.js", "SwiftUI",
                    "NestJS", "Express", "Spring Boot", "Strapi"
                ],
                
                tools: [
                    "Node.js", "Git", "Jenkins", "GitHub Actions", "VSCode", "XCode", "PlatformIO", "KiCad", "Jest"
                ],
                
                cloud: [
                    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform"
                ],
                
                databases: {
                    sql: ["PostgreSQL", "MySQL", "SQLite", "IBM DB2 for i (AS400)"],
                    nosql: ["MongoDB"]
                },

                network: [
                    "Cloudflare (DNS, CDN, Turnstile, Zero Trust)", "Nginx", "Firewall"
                ],

                monitoring: [
                    "CloudWatch", "Azure Monitor"
                ],

                aiMl: [
                    "PyTorch", "TensorFlow", "Machine Learning", "RAG Architecture",
                    "GPU Acceleration", "CUDA", "Knowledge Base Design"
                ],

                hardware: [
                    "KiCad", "PlatformIO", "Embedded Systems", "PCB Design", "C/C++ Firmware"
                ],
                
                specializations: [
                    "Cloud native architecture", "Serverless", "FinOps", "Microservices",
                    "Distributed Computing", "Large-Scale Systems", "PCB development",
                    "Firmware design", "Machine Learning", "Data Mining", "Big Data",
                    "Agile/Scrum", "Technical Training & Mentoring"
                ]
            },

            education: [
                {
                    degree: "Master Expert en informatique et systèmes d'information",
                    school: "Epsi, Grenoble",
                    period: "2023 - 2025",
                    highlights: "Machine Learning, Deep Learning, Data Science, Large-Scale Computing Systems. Visual computing workshop: connected foosball project with real-time ball tracking via ML."
                },
                {
                    degree: "Licence Concepteur Développeur d'Applications",
                    school: "Epsi, Grenoble",
                    period: "2020 - 2023"
                }
            ],

            certifications: [
                {
                    name: "Microsoft Certified: Azure Developer Associate",
                    level: "Level 2",
                    id: "7AD53B-G21DD4"
                }
            ],

            languages: [
                {
                    language: "French",
                    level: "Native"
                },
                {
                    language: "English",
                    level: "Fluent (C2)"
                }
            ],

            achievements: [
                "Resolved complex bugs at JavaScript compiler level through reverse engineering",
                "Collaborated on cloud architecture decisions with high technical impact",
                "Achieved first position in Google searches ahead of CMS sites through SEO optimization (Ostea38)",
                "Successfully supervised Azure cloud deployment following AZ-204 certification",
                "Set up Kubernetes infrastructure for hospital information system at CHPF",
                "Integrated IBM AS400/iSeries legacy systems with modern Spring Boot applications",
                "Built end-to-end hardware AI voice assistant (AirF) combining ML, mobile, and custom PCB",
                "Contributed to open-source projects in various domains (firmware, cloud, dev tools)"
            ]
        };
    }

    async clearDatabase() {
        try {
            console.log('Clearing existing database...');
            await this.index.deleteAll();
            console.log('Database cleared successfully');
        } catch (error) {
            if (error.status === 404 || error.code === 404 || error.message?.includes('404')) {
                console.log('Database is already empty, continuing...');
                return;
            }
            console.error('Error clearing database:', error);
            throw error;
        }
    }

    async uploadStructuredData() {
        await this.clearDatabase();
        
        const portfolioData = this.getPortfolioData();
        const tagsProfileEn = this.normalizeTags(['profile','about','bio','contact','email','github','linkedin','portfolio']);
        const tagsExperienceEn = await this.translateKeywordsToEnglish(['experience','expérience','work','job','emploi','poste','company','mission']);
        const tagsProjectsEn = await this.translateKeywordsToEnglish(['projets','réalisations','project','projects','portfolio','travaux','application','produit']);
        const tagsSkillsLanguagesEn = await this.translateKeywordsToEnglish(['skills','compétences','languages','langages','programming','coding']);
        const tagsSkillsFrameworksEn = await this.translateKeywordsToEnglish(['skills','frameworks','technologies','bibliothèques','outils']);
        const tagsSkillsCloudEn = await this.translateKeywordsToEnglish(['skills','cloud','infrastructure','devops','docker','kubernetes','ci/cd','terraform']);
        const tagsSkillsSpecEn = await this.translateKeywordsToEnglish(['skills','specializations','spécialisation','expertise','domaines']);
        const tagsEducationEn = await this.translateKeywordsToEnglish(['education','formation','diplôme','degree','studies','études','school']);
        const tagsCertificationsEn = await this.translateKeywordsToEnglish(['certifications','certificat','badge','accréditation']);
        const tagsAchievementsEn = await this.translateKeywordsToEnglish(['achievements','réalisations','succès','accomplissements']);
        const tagsOverviewEn = this.normalizeTags(['overview','summary','list']);
        const vectors = [];
        let vectorId = 0;

        console.log('Starting portfolio data upload...');

        // --- GENERAL PROFILE ---
        const generalText = `Profile | About | Bio. Category: profile. Name: ${portfolioData.general.name}. Title: ${portfolioData.general.title}. Email: ${portfolioData.general.email}. GitHub: ${portfolioData.general.github}. LinkedIn: ${portfolioData.general.linkedin}. Portfolio: ${portfolioData.general.portfolio}. Status: ${portfolioData.general.status}. Keywords: profile, about, bio, contact, email, github, linkedin, portfolio.`;
        const generalTextEn = await this.ensureEnglish(generalText);
        const generalEmbedding = await this.generateEmbedding(generalTextEn);
        vectors.push({
            id: `general_${vectorId++}`,
            values: generalEmbedding,
            metadata: {
                type: 'general',
                content: generalTextEn,
                category: 'profile',
                name: 'Profile',
                chunk_index: 0,
                tags: tagsProfileEn
            }
        });
        await this.delay(100);

        // --- EXPERIENCES ---
        for (const exp of portfolioData.experiences) {
            const stackStr = exp.stack && exp.stack.length > 0 ? ` Stack: ${exp.stack.join(', ')}.` : '';
            const expText = `Experience | Job | Work | Role. Category: experience. Company: ${exp.company}. Location: ${exp.location}. Position: ${exp.position}. Period: ${exp.period}. Description: ${exp.description}.${stackStr} Keywords: experience, work, job, role, company, mission.`;
            const expTextEn = await this.ensureEnglish(expText);
            const expEmbedding = await this.generateEmbedding(expTextEn);
            vectors.push({
                id: `experience_${vectorId++}`,
                values: expEmbedding,
                metadata: {
                    type: 'experience',
                    company: exp.company,
                    position: exp.position,
                    content: expTextEn,
                    category: 'experience',
                    name: `${exp.company} - ${exp.position}`,
                    chunk_index: 0,
                    tags: tagsExperienceEn
                }
            });
            await this.delay(100);
        }

        // --- PROJECTS ---
        for (const project of portfolioData.projects) {
            const projectText = `Project | Work | Deliverable. Category: projects. Name: ${project.name}. Description: ${project.description}. Role: ${project.role}. Stack: ${project.stack.join(', ')}. Type: ${project.type}. Keywords: project, deliverable, portfolio, application, product.`;
            const projectTextEn = await this.ensureEnglish(projectText);
            const projectEmbedding = await this.generateEmbedding(projectTextEn);
            vectors.push({
                id: `project_${vectorId++}`,
                values: projectEmbedding,
                metadata: {
                    type: 'project',
                    name: project.name,
                    project_type: project.type,
                    content: projectTextEn,
                    category: 'projects',
                    chunk_index: 0,
                    tags: tagsProjectsEn
                }
            });
            await this.delay(100);
        }

        const projectNames = portfolioData.projects.map(p => p.name).join(', ');
        const projectsOverview = `Projects overview | Portfolio. Category: projects. Projects: ${projectNames}. Summary: list of projects and achievements. Related questions: Can you tell me about your projects? Present your projects. What are your projects? Keywords: projects, portfolio, achievements, list, overview.`;
        const projectsOverviewEn = await this.ensureEnglish(projectsOverview);
        const projectsOverviewEmbedding = await this.generateEmbedding(projectsOverviewEn);
        vectors.push({
            id: `projects_overview_${vectorId++}`,
            values: projectsOverviewEmbedding,
            metadata: {
                type: 'overview',
                name: 'Projects Overview',
                content: projectsOverviewEn,
                category: 'projects',
                chunk_index: 0,
                tags: this.normalizeTags([...tagsProjectsEn, ...tagsOverviewEn])
            }
        });
        await this.delay(100);

        // --- SKILLS ---
        const languagesText = `Skills | Languages. Category: skills. Subcategory: languages. Programming languages mastered: ${portfolioData.skills.languages.join(', ')}. Keywords: skills, languages, programming, coding.`;
        const languagesTextEn = await this.ensureEnglish(languagesText);
        const languagesEmbedding = await this.generateEmbedding(languagesTextEn);
        vectors.push({
            id: `skills_languages_${vectorId++}`,
            values: languagesEmbedding,
            metadata: {
                type: 'skills',
                skill_category: 'languages',
                content: languagesTextEn,
                category: 'skills',
                name: 'Programming Languages',
                chunk_index: 0,
                tags: tagsSkillsLanguagesEn
            }
        });
        await this.delay(100);

        const frameworksText = `Skills | Frameworks and technologies. Category: skills. Subcategory: frameworks. Frameworks and technologies: ${portfolioData.skills.frameworks.join(', ')}. Keywords: frameworks, libraries, technologies, tools.`;
        const frameworksTextEn = await this.ensureEnglish(frameworksText);
        const frameworksEmbedding = await this.generateEmbedding(frameworksTextEn);
        vectors.push({
            id: `skills_frameworks_${vectorId++}`,
            values: frameworksEmbedding,
            metadata: {
                type: 'skills',
                skill_category: 'frameworks',
                content: frameworksTextEn,
                category: 'skills',
                name: 'Frameworks',
                chunk_index: 0,
                tags: tagsSkillsFrameworksEn
            }
        });
        await this.delay(100);

        const cloudText = `Skills | Cloud and Infrastructure. Category: skills. Subcategory: cloud. Cloud and Infrastructure skills: ${portfolioData.skills.cloud.join(', ')}. Keywords: cloud, infrastructure, devops, docker, kubernetes, ci/cd, terraform.`;
        const cloudTextEn = await this.ensureEnglish(cloudText);
        const cloudEmbedding = await this.generateEmbedding(cloudTextEn);
        vectors.push({
            id: `skills_cloud_${vectorId++}`,
            values: cloudEmbedding,
            metadata: {
                type: 'skills',
                skill_category: 'cloud',
                content: cloudTextEn,
                category: 'skills',
                name: 'Cloud & Infrastructure',
                chunk_index: 0,
                tags: tagsSkillsCloudEn
            }
        });
        await this.delay(100);

        const aiMlText = `Skills | AI and Machine Learning. Category: skills. Subcategory: ai_ml. AI and ML skills: ${portfolioData.skills.aiMl.join(', ')}. Keywords: ai, machine learning, deep learning, pytorch, tensorflow, rag, gpu, cuda.`;
        const aiMlTextEn = await this.ensureEnglish(aiMlText);
        const aiMlEmbedding = await this.generateEmbedding(aiMlTextEn);
        vectors.push({
            id: `skills_aiml_${vectorId++}`,
            values: aiMlEmbedding,
            metadata: {
                type: 'skills',
                skill_category: 'ai_ml',
                content: aiMlTextEn,
                category: 'skills',
                name: 'AI & Machine Learning',
                chunk_index: 0,
                tags: this.normalizeTags(['ai', 'ml', 'machine learning', 'pytorch', 'tensorflow', 'rag', 'gpu', 'cuda'])
            }
        });
        await this.delay(100);

        const hardwareText2 = `Skills | Hardware and Embedded. Category: skills. Subcategory: hardware. Hardware and embedded skills: ${portfolioData.skills.hardware.join(', ')}. Keywords: hardware, pcb, embedded, firmware, kicad, platformio.`;
        const hardwareTextEn2 = await this.ensureEnglish(hardwareText2);
        const hardwareEmbedding2 = await this.generateEmbedding(hardwareTextEn2);
        vectors.push({
            id: `skills_hardware_${vectorId++}`,
            values: hardwareEmbedding2,
            metadata: {
                type: 'skills',
                skill_category: 'hardware',
                content: hardwareTextEn2,
                category: 'skills',
                name: 'Hardware & Embedded',
                chunk_index: 0,
                tags: this.normalizeTags(['hardware', 'pcb', 'embedded', 'firmware', 'kicad', 'platformio', 'electronics'])
            }
        });
        await this.delay(100);

        const networkText = `Skills | Network and Security. Category: skills. Subcategory: network. Network and security skills: ${portfolioData.skills.network.join(', ')}. Keywords: network, security, cloudflare, nginx, firewall, dns, cdn.`;
        const networkTextEn = await this.ensureEnglish(networkText);
        const networkEmbedding = await this.generateEmbedding(networkTextEn);
        vectors.push({
            id: `skills_network_${vectorId++}`,
            values: networkEmbedding,
            metadata: {
                type: 'skills',
                skill_category: 'network',
                content: networkTextEn,
                category: 'skills',
                name: 'Network & Security',
                chunk_index: 0,
                tags: this.normalizeTags(['network', 'security', 'cloudflare', 'nginx', 'firewall', 'dns', 'cdn'])
            }
        });
        await this.delay(100);

        const specializationsText = `Skills | Specializations. Category: skills. Subcategory: specializations. Specialization areas: ${portfolioData.skills.specializations.join(', ')}. Keywords: specialization, expertise, domains.`;
        const specializationsTextEn = await this.ensureEnglish(specializationsText);
        const specializationsEmbedding = await this.generateEmbedding(specializationsTextEn);
        vectors.push({
            id: `skills_specializations_${vectorId++}`,
            values: specializationsEmbedding,
            metadata: {
                type: 'skills',
                skill_category: 'specializations',
                content: specializationsTextEn,
                category: 'skills',
                name: 'Specializations',
                chunk_index: 0,
                tags: tagsSkillsSpecEn
            }
        });
        await this.delay(100);

        // --- TECHNOLOGY-SPECIFIC VECTORS ---
        const techVectors = [
            {
                id: 'angular', technology: 'Angular',
                text: `Angular Framework | Frontend Technology. Category: skills. Technology: Angular. Context: Marco uses Angular extensively in professional projects including CHPF Medical IS, Pernod Ricard Data Portal, Deloitte Neptune, and Odyssee. Angular is a core frontend framework in his stack. Related questions: Do you use Angular? Do you know Angular? Can you work with Angular?`,
                tags: ['angular', 'framework', 'frontend', 'javascript', 'typescript']
            },
            {
                id: 'react', technology: 'React',
                text: `React Framework | Frontend Technology. Category: skills. Technology: React. Context: Marco uses React as a frontend framework alongside Angular and Next.js. React is part of his core frontend skill set. Related questions: Do you use React? Do you know React? Can you work with React?`,
                tags: ['react', 'framework', 'frontend', 'javascript', 'typescript']
            },
            {
                id: 'nextjs', technology: 'Next.js',
                text: `Next.js Framework | React Framework. Category: skills. Technology: Next.js. Context: Marco uses Next.js in professional projects like World Athletics Stats Zone Pro and personal projects like Ostea38. Next.js is a key React framework in his toolkit. Related questions: Do you use Next.js? Do you know Next.js? Can you work with Next.js?`,
                tags: ['nextjs', 'react', 'framework', 'frontend', 'javascript', 'typescript']
            },
            {
                id: 'nestjs', technology: 'NestJS',
                text: `NestJS Framework | Backend Framework. Category: skills. Technology: NestJS. Context: Marco uses NestJS extensively in multiple professional projects including Pernod Ricard Data Portal, Deloitte Neptune, and Odyssee. NestJS is one of his primary backend frameworks. Related questions: Do you use NestJS? Do you know NestJS? Can you work with NestJS?`,
                tags: ['nestjs', 'nodejs', 'backend', 'framework', 'typescript']
            },
            {
                id: 'springboot', technology: 'Spring Boot',
                text: `Spring Boot | Java Backend Framework. Category: skills. Technology: Spring Boot. Context: Marco uses Spring Boot as the primary backend framework at CHPF for developing critical medical applications, including IBM AS400/iSeries JDBC integration. Related questions: Do you use Spring Boot? Do you know Spring Boot? Can you work with Java Spring Boot?`,
                tags: ['spring', 'springboot', 'java', 'backend', 'framework']
            },
            {
                id: 'aws', technology: 'AWS',
                text: `AWS Cloud Platform | Amazon Web Services. Category: skills. Technology: AWS. Context: Marco has extensive experience with AWS through his work on World Athletics Stats Zone Pro project where he participated in AWS cloud deployment. AWS is one of his main cloud platforms alongside Azure and GCP. Related questions: Do you use AWS? Do you know Amazon Web Services? Can you work with AWS?`,
                tags: ['aws', 'cloud', 'amazon', 'infrastructure', 'devops']
            },
            {
                id: 'azure', technology: 'Azure',
                text: `Azure Cloud Platform | Microsoft Azure. Category: skills. Technology: Azure. Context: Marco has Azure Developer Associate certification (7AD53B-G21DD4) and supervised Azure cloud deployment for Deloitte Neptune project. He also used Azure for hosting personal projects like Ostea38. Azure is a core competency. Related questions: Do you use Azure? Do you know Microsoft Azure? Are you Azure certified?`,
                tags: ['azure', 'microsoft', 'cloud', 'certification', 'infrastructure']
            },
            {
                id: 'kubernetes', technology: 'Kubernetes',
                text: `Kubernetes | Container Orchestration. Category: skills. Technology: Kubernetes. Context: Marco set up a Kubernetes infrastructure for orchestrating hospital information system services at CHPF. Kubernetes is part of his cloud infrastructure expertise. Related questions: Do you use Kubernetes? Do you know Kubernetes? Do you have K8s experience?`,
                tags: ['kubernetes', 'k8s', 'container', 'orchestration', 'devops', 'cloud']
            },
            {
                id: 'typescript', technology: 'TypeScript',
                text: `TypeScript Programming Language. Category: skills. Technology: TypeScript. Context: Marco uses TypeScript extensively across multiple projects and frameworks including Angular, NestJS, and Next.js. TypeScript is his primary language for both frontend and backend development. Related questions: Do you use TypeScript? Do you know TypeScript? Can you work with TypeScript?`,
                tags: ['typescript', 'javascript', 'programming', 'language', 'frontend', 'backend']
            },
            {
                id: 'java', technology: 'Java',
                text: `Java Programming Language. Category: skills. Technology: Java. Context: Marco uses Java with Spring Boot at CHPF for developing critical medical applications. Java is a core language in his current role. Related questions: Do you use Java? Do you know Java? Can you work with Java?`,
                tags: ['java', 'programming', 'language', 'backend', 'spring']
            },
            {
                id: 'postgresql', technology: 'PostgreSQL',
                text: `PostgreSQL Database. Category: skills. Technology: PostgreSQL. Context: Marco uses PostgreSQL in multiple professional projects including Pernod Ricard Data Portal, Deloitte Neptune, and Odyssee. PostgreSQL is his primary database choice for enterprise applications. Related questions: Do you use PostgreSQL? Do you know PostgreSQL? Can you work with databases?`,
                tags: ['postgresql', 'database', 'sql', 'data', 'backend']
            },
            {
                id: 'ibm_as400', technology: 'IBM AS400',
                text: `IBM AS400 / iSeries | IBM DB2 for i | Legacy Systems Integration. Category: skills. Technology: IBM AS400. Context: Marco integrates IBM AS400/iSeries systems at CHPF using JDBC connectors (JTOpen), developing data exchange services between modern applications and the legacy hospital information system. Related questions: Do you know AS400? Do you have IBM i experience? Can you work with iSeries?`,
                tags: ['ibm', 'as400', 'iseries', 'db2', 'legacy', 'jdbc', 'hospital']
            },
            {
                id: 'pytorch_tensorflow', technology: 'PyTorch & TensorFlow',
                text: `PyTorch | TensorFlow | GPU Machine Learning. Category: skills. Technology: PyTorch, TensorFlow. Context: Marco uses PyTorch and TensorFlow for GPU-accelerated ML workflows in Deloitte Neptune and for his personal AirF hardware AI voice assistant project. He has experience with CUDA and GPU computing. Related questions: Do you use PyTorch? Do you know TensorFlow? Do you have machine learning experience?`,
                tags: ['pytorch', 'tensorflow', 'ml', 'ai', 'gpu', 'cuda', 'deep learning']
            },
            {
                id: 'kicad', technology: 'KiCad',
                text: `KiCad | PCB Design | Hardware Development. Category: skills. Technology: KiCad. Context: Marco uses KiCad for custom PCB design in his AirF hardware AI voice assistant project. He has experience designing custom circuit boards and writing C/C++ firmware with PlatformIO. Related questions: Do you know KiCad? Do you design PCBs? Do you have hardware experience?`,
                tags: ['kicad', 'pcb', 'hardware', 'electronics', 'embedded', 'firmware']
            }
        ];

        for (const tech of techVectors) {
            const textEn = await this.ensureEnglish(tech.text);
            const embedding = await this.generateEmbedding(textEn);
            vectors.push({
                id: `tech_${tech.id}_${vectorId++}`,
                values: embedding,
                metadata: {
                    type: 'technology',
                    technology: tech.technology,
                    content: textEn,
                    category: 'skills',
                    name: `${tech.technology} Technology`,
                    chunk_index: 0,
                    tags: this.normalizeTags(tech.tags)
                }
            });
            await this.delay(100);
        }

        // --- FAQ VECTORS ---
        const faqVectors = [
            {
                id: 'frontend', question_type: 'frontend',
                text: `Frontend Development Question. Category: questions. Question: What frontend technologies do you use? Answer: Marco is proficient in Angular, React, and Next.js for frontend development, with extensive experience in TypeScript, JavaScript, HTML, and CSS. He has used Angular in multiple professional projects at CHPF and Deloitte.`,
                tags: ['frontend', 'angular', 'react', 'nextjs', 'javascript', 'typescript']
            },
            {
                id: 'backend', question_type: 'backend',
                text: `Backend Development Question. Category: questions. Question: What backend technologies do you use? Answer: Marco uses NestJS and Spring Boot for backend development, working with Node.js, TypeScript, Java, and databases including PostgreSQL and IBM DB2 for i. He has extensive experience building APIs and serverless architectures.`,
                tags: ['backend', 'nestjs', 'springboot', 'java', 'nodejs', 'api', 'serverless']
            },
            {
                id: 'cloud', question_type: 'cloud',
                text: `Cloud Development Question. Category: questions. Question: What cloud platforms do you use? Answer: Marco is experienced with AWS, Azure, and GCP. He is Microsoft Azure certified and has deployed applications on all three platforms, with expertise in serverless, containerization (Docker, Kubernetes), and infrastructure as code (Terraform).`,
                tags: ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'infrastructure', 'devops']
            },
            {
                id: 'current_role', question_type: 'experience',
                text: `Current Role Question. Category: questions. Question: What is your current position? Answer: Marco is currently working as Ingénieur Développeur Intégrateur d'Applications Médicales at the Centre Hospitalier de Polynésie française (CHPF) in Papeete, Tahiti, since November 2025. He develops critical medical software in Java Spring Boot and Angular, integrates IBM AS400/iSeries legacy systems, and manages Kubernetes infrastructure.`,
                tags: ['current', 'position', 'role', 'chpf', 'tahiti', 'medical', 'hospital']
            },
            {
                id: 'chpf', question_type: 'experience',
                text: `CHPF Experience Question. Category: questions. Question: Tell me about your work at CHPF. Answer: Marco works at the Centre Hospitalier de Polynésie française in Papeete, Tahiti as Ingénieur Développeur Intégrateur d'Applications Médicales since November 2025. He develops critical medical software in Java Spring Boot and Angular, integrates IBM AS400/iSeries legacy systems via JDBC, interfaces with medical equipment via standardized health protocols, manages sensitive patient data, and set up a Kubernetes infrastructure for the hospital information system.`,
                tags: ['chpf', 'hospital', 'medical', 'tahiti', 'polynesia', 'spring boot', 'angular', 'as400', 'kubernetes']
            },
            {
                id: 'deloitte', question_type: 'experience',
                text: `Deloitte Experience Question. Category: questions. Question: Tell me about your experience at Deloitte. Answer: Marco worked as a Cloud Developer Apprentice at Deloitte Grenoble from September 2022 to September 2025. He worked on major projects including Pernod Ricard Data Portal (Angular, NestJS, PostgreSQL), World Athletics Stats Zone Pro (Next.js, Strapi, AWS), Deloitte Neptune (AI/RAG, Azure), and Odyssee. He specialized in fullstack and cloud development.`,
                tags: ['deloitte', 'experience', 'cloud', 'apprentice', 'projects', 'grenoble']
            },
            {
                id: 'experience_years', question_type: 'experience',
                text: `Years of Experience Question. Category: questions. Question: How many years of experience do you have? Answer: Marco has been working since 2015 with internships at Oracle and Hurence, completed a 3-year apprenticeship at Deloitte (2022-2025), and is currently working at CHPF (since November 2025). He has over 10 years of combined experience in software and cloud development.`,
                tags: ['experience', 'years', 'career', 'timeline', 'professional']
            },
            {
                id: 'pernod_ricard', question_type: 'project',
                text: `Pernod Ricard Project Question. Category: questions. Question: Tell me about the Pernod Ricard project. Answer: Marco worked on the Pernod Ricard Data Portal, designing and developing a data management solution with cloud integration and serverless architecture. He used Angular, NestJS, PostgreSQL stack and also conducted training for new developers during handover.`,
                tags: ['pernod', 'ricard', 'data', 'portal', 'angular', 'nestjs', 'postgresql']
            },
            {
                id: 'world_athletics', question_type: 'project',
                text: `World Athletics Project Question. Category: questions. Question: What did you do for World Athletics? Answer: Marco worked on World Athletics Stats Zone Pro, developing modern interfaces and microservices integration with cloud native architecture. He used Next.js and Strapi, participated in architecture design, DevOps, and AWS cloud deployment.`,
                tags: ['world', 'athletics', 'stats', 'zone', 'nextjs', 'strapi', 'aws']
            },
            {
                id: 'neptune', question_type: 'project',
                text: `Neptune Project Question. Category: questions. Question: What is the Neptune project? Answer: Deloitte Neptune is a modular SaaS that Marco helped develop, adaptable to different clients and rapidly deployable. It's used as Deloitte's showcase project. Marco worked as fullstack and cloud developer, implemented AI assistant functionality with RAG architecture and GPU-accelerated ML workflows, and supervised Azure cloud deployment following his AZ-204 certification.`,
                tags: ['neptune', 'saas', 'modular', 'ai', 'rag', 'azure', 'showcase', 'deloitte']
            },
            {
                id: 'ostea38', question_type: 'project',
                text: `Ostea38 Project Question. Category: questions. Question: Tell me about Ostea38. Answer: Ostea38 is a personal project - a showcase website for an animal osteopath. Marco implemented it with cost limitation objectives (FinOps), developed in Next.js using Cloudflare as CDN, hosted on Azure. Extensive SEO work achieved first position in Google searches, ahead of CMS sites like WordPress and PrestaShop.`,
                tags: ['ostea38', 'nextjs', 'seo', 'finops', 'cloudflare', 'azure', 'personal']
            },
            {
                id: 'airf', question_type: 'project',
                text: `AirF Project Question. Category: questions. Question: Tell me about the AirF project. Answer: AirF is Marco's personal R&D project since 2022 — a physical AI voice assistant. It combines TensorFlow and PyTorch for voice processing, a Swift/SwiftUI mobile app for device control, a custom PCB designed with KiCad, and C/C++ firmware with PlatformIO. It is an end-to-end project spanning machine learning, mobile development, and hardware engineering.`,
                tags: ['airf', 'hardware', 'ai', 'voice', 'assistant', 'pcb', 'kicad', 'tensorflow', 'pytorch', 'swift']
            },
            {
                id: 'education', question_type: 'education',
                text: `Education Question. Category: questions. Question: What is your educational background? Answer: Marco completed a Master Expert en informatique et systèmes d'information at Epsi, Grenoble (2023-2025), covering Machine Learning, Deep Learning, Data Science, and Large-Scale Computing. He also holds a Licence Concepteur Développeur d'Applications from the same school (2020-2023).`,
                tags: ['education', 'master', 'bachelor', 'epsi', 'grenoble', 'graduation']
            },
            {
                id: 'certification', question_type: 'certification',
                text: `Azure Certification Question. Category: questions. Question: Do you have any certifications? Answer: Yes, Marco is Microsoft Certified: Azure Developer Associate (Level 2, Certification ID: 7AD53B-G21DD4). This certification validates his expertise in Azure cloud development and deployment.`,
                tags: ['certification', 'azure', 'microsoft', 'developer', 'associate', 'cloud']
            },
            {
                id: 'contact', question_type: 'contact',
                text: `Contact Information Question. Category: questions. Question: How can I contact you? Answer: You can reach Marco Pyré at ytmarcopyre@gmail.com, check his GitHub at https://github.com/marcopyre, LinkedIn at marco-pyré-51187b200, or visit his portfolio at marcopyre.github.io/portfolio/.`,
                tags: ['contact', 'email', 'github', 'linkedin', 'portfolio', 'marco', 'pyre']
            },
            {
                id: 'availability', question_type: 'availability',
                text: `Availability Question. Category: questions. Question: Are you available for hire? Answer: Marco is currently working as Ingénieur Développeur Intégrateur d'Applications Médicales at CHPF in Papeete, Tahiti since November 2025. He is open to discussing new opportunities depending on the role and context.`,
                tags: ['availability', 'hire', 'job', 'position', 'chpf', 'tahiti']
            },
            {
                id: 'spoken_languages', question_type: 'languages',
                text: `Languages Question. Category: questions. Question: What languages do you speak? Answer: Marco is a native French speaker and is fluent in English (C2 level). This bilingual proficiency allows him to work effectively in international environments.`,
                tags: ['languages', 'french', 'english', 'bilingual', 'native', 'fluent']
            },
            {
                id: 'achievements', question_type: 'achievements',
                text: `Technical Achievements Question. Category: questions. Question: What are your main technical achievements? Answer: Marco resolved complex bugs at JavaScript compiler level through reverse engineering, set up Kubernetes infrastructure at CHPF for the hospital information system, integrated IBM AS400 legacy systems with modern Spring Boot apps, built an end-to-end hardware AI voice assistant (AirF), achieved first position in Google searches through SEO optimization (Ostea38), and supervised Azure cloud deployment following AZ-204 certification.`,
                tags: ['achievements', 'kubernetes', 'as400', 'airf', 'seo', 'azure', 'cloud']
            },
            {
                id: 'ai_experience', question_type: 'ai',
                text: `AI Experience Question. Category: questions. Question: Do you have experience with AI? Answer: Yes, Marco implemented AI assistant functionality with RAG architecture and GPU-accelerated ML workflows in the Deloitte Neptune project (PyTorch, TensorFlow, Azure). He also built AirF, a physical AI voice assistant using TensorFlow and PyTorch, and has experience with CUDA GPU computing.`,
                tags: ['ai', 'artificial', 'intelligence', 'machine', 'learning', 'rag', 'pytorch', 'tensorflow', 'gpu']
            },
            {
                id: 'hardware', question_type: 'hardware',
                text: `Hardware Experience Question. Category: questions. Question: Do you work with hardware? Answer: Yes, Marco has significant hardware experience. He designs custom PCBs with KiCad and writes C/C++ firmware with PlatformIO, most notably for his AirF personal project — a physical AI voice assistant with a fully custom PCB.`,
                tags: ['hardware', 'pcb', 'firmware', 'embedded', 'electronics', 'platformio', 'kicad']
            },
            {
                id: 'devops', question_type: 'devops',
                text: `DevOps Experience Question. Category: questions. Question: Do you have DevOps experience? Answer: Yes, Marco has extensive DevOps experience including Docker, Kubernetes, CI/CD pipelines (Jenkins, GitHub Actions), and Infrastructure as Code (Terraform). He set up Kubernetes infrastructure at CHPF, participated in AWS deployment for World Athletics, and supervised Azure deployment for Neptune.`,
                tags: ['devops', 'docker', 'kubernetes', 'cicd', 'terraform', 'infrastructure', 'jenkins']
            },
            {
                id: 'agile', question_type: 'methodology',
                text: `Agile Methodology Question. Category: questions. Question: Do you work with Agile methodologies? Answer: Yes, Marco has experience with Agile/Scrum methodologies across his work at Deloitte and CHPF. He has participated in client presentations, technical demonstrations, and developer training and mentoring.`,
                tags: ['agile', 'scrum', 'methodology', 'project', 'management', 'collaborative']
            },
            {
                id: 'fullstack', question_type: 'expertise',
                text: `Fullstack Development Question. Category: questions. Question: Are you a fullstack developer? Answer: Yes, Marco is a fullstack developer with expertise in frontend (Angular, React, Next.js), backend (NestJS, Spring Boot), databases (PostgreSQL, IBM DB2 for i, MongoDB), cloud deployment (AWS, Azure, GCP), and DevOps. He has worked on complete application development cycles at Deloitte and CHPF.`,
                tags: ['fullstack', 'frontend', 'backend', 'complete', 'cycle', 'development']
            },
            {
                id: 'cloud_expertise', question_type: 'expertise',
                text: `Cloud Expertise Question. Category: questions. Question: What is your cloud expertise? Answer: Marco specializes in cloud native architecture, serverless computing, containerization (Docker, Kubernetes), and FinOps. He is Azure Developer Associate certified and has deployed on AWS, Azure, and GCP. He also set up Kubernetes infrastructure at CHPF.`,
                tags: ['cloud', 'native', 'serverless', 'finops', 'aws', 'azure', 'gcp', 'kubernetes']
            },
            {
                id: 'problem_solving', question_type: 'problem_solving',
                text: `Problem Solving Question. Category: questions. Question: Can you give examples of complex problems you solved? Answer: Marco resolved complex bugs at JavaScript compiler level through reverse engineering, debugged IBM AS400/iSeries JDBC connectivity issues in Docker containers at CHPF, collaborated on cloud architecture decisions with high technical impact, and optimized applications for performance and cost (FinOps principles).`,
                tags: ['problem', 'solving', 'debugging', 'analysis', 'optimization', 'finops', 'as400', 'jdbc']
            }
        ];

        for (const faq of faqVectors) {
            const textEn = await this.ensureEnglish(faq.text);
            const embedding = await this.generateEmbedding(textEn);
            vectors.push({
                id: `faq_${faq.id}_${vectorId++}`,
                values: embedding,
                metadata: {
                    type: 'faq',
                    question_type: faq.question_type,
                    content: textEn,
                    category: faq.question_type === 'project' ? 'projects' : faq.question_type === 'education' ? 'education' : faq.question_type === 'certification' ? 'certifications' : faq.question_type === 'achievements' ? 'achievements' : faq.question_type === 'experience' ? 'experience' : 'skills',
                    name: `${faq.id.replace(/_/g, ' ')} FAQ`,
                    chunk_index: 0,
                    tags: this.normalizeTags(faq.tags)
                }
            });
            await this.delay(100);
        }

        // --- SKILLS OVERVIEW ---
        const skillsOverview = `Skills overview. Category: skills. Languages: ${portfolioData.skills.languages.join(', ')}. Frameworks: ${portfolioData.skills.frameworks.join(', ')}. Cloud: ${portfolioData.skills.cloud.join(', ')}. AI/ML: ${portfolioData.skills.aiMl.join(', ')}. Hardware: ${portfolioData.skills.hardware.join(', ')}. Specializations: ${portfolioData.skills.specializations.join(', ')}. Related questions: What are your skills? Tell me about your skills. What is your stack? Which technologies do you master?`;
        const skillsOverviewEn = await this.ensureEnglish(skillsOverview);
        const skillsOverviewEmbedding = await this.generateEmbedding(skillsOverviewEn);
        vectors.push({
            id: `skills_overview_${vectorId++}`,
            values: skillsOverviewEmbedding,
            metadata: {
                type: 'overview',
                name: 'Skills Overview',
                content: skillsOverviewEn,
                category: 'skills',
                chunk_index: 0,
                tags: this.normalizeTags([...tagsSkillsLanguagesEn, ...tagsSkillsFrameworksEn, ...tagsSkillsCloudEn, ...tagsSkillsSpecEn, ...tagsOverviewEn])
            }
        });
        await this.delay(100);

        // --- EDUCATION ---
        for (const edu of portfolioData.education) {
            const highlightsStr = edu.highlights ? ` Highlights: ${edu.highlights}` : '';
            const eduText = `Education | Degree | Studies. Category: education. Degree: ${edu.degree}. School: ${edu.school}. Period: ${edu.period}.${highlightsStr} Keywords: education, degree, studies, school.`;
            const eduTextEn = await this.ensureEnglish(eduText);
            const eduEmbedding = await this.generateEmbedding(eduTextEn);
            vectors.push({
                id: `education_${vectorId++}`,
                values: eduEmbedding,
                metadata: {
                    type: 'education',
                    degree: edu.degree,
                    content: eduTextEn,
                    category: 'education',
                    name: edu.degree,
                    chunk_index: 0,
                    tags: tagsEducationEn
                }
            });
            await this.delay(100);
        }

        const eduOverview = `Education overview. Category: education. Degrees: ${portfolioData.education.map(e => e.degree).join(', ')}. Related questions: What is your education? Which degrees do you have? Tell me about your studies.`;
        const eduOverviewEn = await this.ensureEnglish(eduOverview);
        const eduOverviewEmbedding = await this.generateEmbedding(eduOverviewEn);
        vectors.push({
            id: `education_overview_${vectorId++}`,
            values: eduOverviewEmbedding,
            metadata: {
                type: 'overview',
                name: 'Education Overview',
                content: eduOverviewEn,
                category: 'education',
                chunk_index: 0,
                tags: this.normalizeTags([...tagsEducationEn, ...tagsOverviewEn])
            }
        });
        await this.delay(100);

        // --- CERTIFICATIONS ---
        for (const cert of portfolioData.certifications) {
            const certText = `Certification | Accreditation | Badge. Category: certifications. Certification: ${cert.name}, Level: ${cert.level}, ID: ${cert.id}. Keywords: certification, badge, accreditation.`;
            const certTextEn = await this.ensureEnglish(certText);
            const certEmbedding = await this.generateEmbedding(certTextEn);
            vectors.push({
                id: `certification_${vectorId++}`,
                values: certEmbedding,
                metadata: {
                    type: 'certification',
                    name: cert.name,
                    content: certTextEn,
                    category: 'certifications',
                    chunk_index: 0,
                    tags: tagsCertificationsEn
                }
            });
            await this.delay(100);
        }

        const certOverview = `Certifications overview. Category: certifications. Certifications: ${portfolioData.certifications.map(c => c.name).join(', ')}. Related questions: What are your certifications? Do you have certifications?`;
        const certOverviewEn = await this.ensureEnglish(certOverview);
        const certOverviewEmbedding = await this.generateEmbedding(certOverviewEn);
        vectors.push({
            id: `certifications_overview_${vectorId++}`,
            values: certOverviewEmbedding,
            metadata: {
                type: 'overview',
                name: 'Certifications Overview',
                content: certOverviewEn,
                category: 'certifications',
                chunk_index: 0,
                tags: this.normalizeTags([...tagsCertificationsEn, ...tagsOverviewEn])
            }
        });
        await this.delay(100);

        // --- ACHIEVEMENTS ---
        for (const achievement of portfolioData.achievements) {
            const achievementText = `Achievements | Successes | Accomplishments. Category: achievements. Detail: ${achievement}. Keywords: achievements, successes, accomplishments.`;
            const achievementTextEn = await this.ensureEnglish(achievementText);
            const achievementEmbedding = await this.generateEmbedding(achievementTextEn);
            vectors.push({
                id: `achievement_${vectorId++}`,
                values: achievementEmbedding,
                metadata: {
                    type: 'achievement',
                    content: achievementTextEn,
                    category: 'achievements',
                    chunk_index: 0,
                    tags: tagsAchievementsEn
                }
            });
            await this.delay(100);
        }

        const achievementsOverview = `Achievements overview. Category: achievements. Achievements: ${portfolioData.achievements.join(' | ')}. Related questions: What are your achievements? Tell me about your successes.`;
        const achievementsOverviewEn = await this.ensureEnglish(achievementsOverview);
        const achievementsOverviewEmbedding = await this.generateEmbedding(achievementsOverviewEn);
        vectors.push({
            id: `achievements_overview_${vectorId++}`,
            values: achievementsOverviewEmbedding,
            metadata: {
                type: 'overview',
                name: 'Achievements Overview',
                content: achievementsOverviewEn,
                category: 'achievements',
                chunk_index: 0,
                tags: this.normalizeTags([...tagsAchievementsEn, ...tagsOverviewEn])
            }
        });
        await this.delay(100);

        console.log('Uploading to Pinecone...');
        await this.index.upsert(vectors);
        
        console.log(`Upload complete! ${vectors.length} items indexed`);
        this.displayUploadSummary(portfolioData, vectors.length);
        
        return vectors.length;
    }

    displayUploadSummary(data, totalVectors) {
        console.log('\nUpload Summary:');
        console.log(`Profile: ${data.general.name}`);
        console.log(`Experiences: ${data.experiences.length}`);
        console.log(`Projects: ${data.projects.length}`);
        console.log(`Skill categories: 7 (languages, frameworks, cloud, ai/ml, hardware, network, specializations)`);
        console.log(`Education entries: ${data.education.length}`);
        console.log(`Certifications: ${data.certifications.length}`);
        console.log(`Achievements: ${data.achievements.length}`);
        console.log(`Total vectors created: ${totalVectors}`);
        console.log('\nAll data has been structured and indexed successfully!');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getIndexStats() {
        try {
            const stats = await this.index.describeIndexStats();
            return stats;
        } catch (error) {
            console.error('Error retrieving stats:', error);
            return null;
        }
    }
}

async function createPineconeIndex() {
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    try {
        await pc.createIndex({
            name: 'portfolio-knowledge-base',
            dimension: 384,
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            }
        });
        console.log('Pinecone index created successfully');
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('Pinecone index already exists');
        } else {
            console.error('Error creating index:', error);
        }
    }
}

async function main() {
    try {
        console.log('Initializing upload system...');
        
        const uploader = new PortfolioDataUploader();
        await uploader.initialize();
        
        console.log('Starting structured data upload...');
        await uploader.uploadStructuredData();
        
        const stats = await uploader.getIndexStats();
        if (stats) {
            console.log('\nIndex Statistics:');
            console.log(`Total vectors: ${stats.totalVectorCount}`);
            console.log(`Dimension: ${stats.dimension}`);
        }
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

process.on('unhandledRejection', (error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});

if (require.main === module) {
    main();
}

module.exports = { PortfolioDataUploader, createPineconeIndex };