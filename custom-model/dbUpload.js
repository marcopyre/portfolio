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
        // Use a multilingual embedding model to align FR/EN (and more) in the same vector space
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
        // Force English-only content in the DB by translating FR→EN when needed
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
                status: "Available for new opportunities (completed apprenticeship at Deloitte in September 2025)"
            },

            experiences: [
                {
                    company: "Deloitte",
                    location: "Grenoble",
                    position: "Cloud Developer Apprentice",
                    period: "September 2022 - September 2025",
                    description: "Fullstack and cloud development on multiple high-impact projects"
                },
                {
                    company: "Hurence",
                    location: "Grenoble",
                    position: "Intern",
                    period: "May 2021 - June 2021",
                    description: "Development of a massive data management interface using Big Data frameworks"
                },
                {
                    company: "Oracle",
                    location: "Grenoble",
                    position: "Intern",
                    period: "December 2015",
                    description: "Development of encryption software"
                }
            ],

            projects: [
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
                    stack: ["NextJS", "Strapi"],
                    type: "Professional",
                    description: "Development of modern interfaces, microservices integration, cloud native. Participated in architecture design and AWS cloud deployment."
                },
                {
                    name: "Deloitte - Neptune",
                    role: "Fullstack & Cloud Developer",
                    stack: ["Angular", "NestJS", "PostgreSQL"],
                    type: "Professional",
                    description: "Development of a modular SaaS, company's showcase project. AI assistant implementation and Azure cloud deployment supervision."
                },
                {
                    name: "Odyssee",
                    role: "Fullstack Developer",
                    stack: ["Angular", "NestJS", "PostgreSQL"],
                    type: "Professional",
                    description: "Complete rebuild of a SaaS used in educational context."
                },
                {
                    name: "Ostea38",
                    role: "Full Development",
                    stack: ["NextJS", "Azure", "CloudFlare"],
                    type: "Personal",
                    description: "Showcase website for an animal osteopath with FinOps optimization. Achieved first position in Google searches through extensive SEO work."
                },
                {
                    name: "iOS App with integrated Siri AI",
                    role: "Mobile Developer",
                    stack: ["Swift", "SwiftUI"],
                    type: "Personal",
                    description: "Intelligent mobile application with advanced voice commands."
                },
                {
                    name: "Custom PCB",
                    role: "Hardware/Firmware Developer",
                    stack: ["PCB Design", "Embedded C"],
                    type: "Personal",
                    description: "Development of an electronic board with embedded firmware."
                }
            ],

            skills: {
                languages: [
                    "TypeScript", "JavaScript", "C++", "C", "Python", "Java", 
                    "Scala", "Kotlin", "Swift", "C#", "R", "SQL", "CSS", "HTML"
                ],
                
                frameworks: [
                    "NestJS", "Express", "Strapi", "Angular", "AngularJS", "Next.js", "SwiftUI"
                ],
                
                tools: [
                    "Node.js", "Git", "VSCode", "XCode", "PlatformIO", "Knime", "Jest"
                ],
                
                cloud: [
                    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform"
                ],
                
                databases: {
                    sql: ["PostgreSQL", "MySQL", "SQLite"],
                    nosql: ["MongoDB"]
                },
                
                specializations: [
                    "Cloud native architecture", "Serverless", "FinOps", "Microservices",
                    "PCB development", "Firmware design", "Machine Learning", 
                    "Data Mining", "Big Data", "Agile methodologies"
                ]
            },

            education: [
                {
                    degree: "Master's in Computer Science and Information Systems",
                    school: "Epsi, Grenoble",
                    period: "2023 - 2025"
                },
                {
                    degree: "Bachelor's in Application Developer Designer",
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
                "Achieved first position in Google searches ahead of CMS sites through SEO optimization",
                "Successfully supervised Azure cloud deployment following AZ204 certification",
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
            // Handle 404 errors when database is already empty
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
        // Precompute canonical English tags per category to keep metadata consistent and multilingual-friendly
        const tagsProfileEn = this.normalizeTags(['profile','about','bio','contact','email','github']);
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

        const generalText = `Profile | About | Bio. Category: profile. Name: ${portfolioData.general.name}. Title: ${portfolioData.general.title}. Email: ${portfolioData.general.email}. GitHub: ${portfolioData.general.github}. Status: ${portfolioData.general.status}. Keywords: profile, about, bio, contact, email, github.`;
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

        for (const exp of portfolioData.experiences) {
            const expText = `Experience | Job | Work | Role. Category: experience. Company: ${exp.company}. Location: ${exp.location}. Position: ${exp.position}. Period: ${exp.period}. Description: ${exp.description}. Keywords: experience, work, job, role, company, mission.`;
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

        // Projects overview to match broad questions
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

        // Technology-specific entries for better detection
        const angularText = `Angular Framework | Frontend Technology. Category: skills. Technology: Angular. Context: Marco uses Angular extensively in professional projects including Pernod Ricard Data Portal, Deloitte Neptune, and Odyssee. Angular is a core frontend framework in his stack. Related questions: Do you use Angular? Do you know Angular? Can you work with Angular?`;
        const angularTextEn = await this.ensureEnglish(angularText);
        const angularEmbedding = await this.generateEmbedding(angularTextEn);
        vectors.push({
            id: `tech_angular_${vectorId++}`,
            values: angularEmbedding,
            metadata: {
                type: 'technology',
                technology: 'Angular',
                content: angularTextEn,
                category: 'skills',
                name: 'Angular Framework',
                chunk_index: 0,
                tags: this.normalizeTags(['angular', 'framework', 'frontend', 'javascript', 'typescript'])
            }
        });
        await this.delay(100);

        const nextjsText = `Next.js Framework | React Framework. Category: skills. Technology: Next.js. Context: Marco uses Next.js in professional projects like World Athletics Stats Zone Pro and personal projects like Ostea38. Next.js is a key React framework in his toolkit. Related questions: Do you use Next.js? Do you know Next.js? Can you work with Next.js?`;
        const nextjsTextEn = await this.ensureEnglish(nextjsText);
        const nextjsEmbedding = await this.generateEmbedding(nextjsTextEn);
        vectors.push({
            id: `tech_nextjs_${vectorId++}`,
            values: nextjsEmbedding,
            metadata: {
                type: 'technology',
                technology: 'Next.js',
                content: nextjsTextEn,
                category: 'skills',
                name: 'Next.js Framework',
                chunk_index: 0,
                tags: this.normalizeTags(['nextjs', 'react', 'framework', 'frontend', 'javascript', 'typescript'])
            }
        });
        await this.delay(100);

        const nestjsText = `NestJS Framework | Backend Framework. Category: skills. Technology: NestJS. Context: Marco uses NestJS extensively in multiple professional projects including Pernod Ricard Data Portal, Deloitte Neptune, and Odyssee. NestJS is his primary backend framework. Related questions: Do you use NestJS? Do you know NestJS? Can you work with NestJS?`;
        const nestjsTextEn = await this.ensureEnglish(nestjsText);
        const nestjsEmbedding = await this.generateEmbedding(nestjsTextEn);
        vectors.push({
            id: `tech_nestjs_${vectorId++}`,
            values: nestjsEmbedding,
            metadata: {
                type: 'technology',
                technology: 'NestJS',
                content: nestjsTextEn,
                category: 'skills',
                name: 'NestJS Framework',
                chunk_index: 0,
                tags: this.normalizeTags(['nestjs', 'nodejs', 'backend', 'framework', 'typescript'])
            }
        });
        await this.delay(100);

        // Add more technology-specific entries
        const awsText = `AWS Cloud Platform | Amazon Web Services. Category: skills. Technology: AWS. Context: Marco has extensive experience with AWS through his work on World Athletics Stats Zone Pro project where he participated in AWS cloud deployment. AWS is one of his main cloud platforms alongside Azure and GCP. Related questions: Do you use AWS? Do you know Amazon Web Services? Can you work with AWS?`;
        const awsTextEn = await this.ensureEnglish(awsText);
        const awsEmbedding = await this.generateEmbedding(awsTextEn);
        vectors.push({
            id: `tech_aws_${vectorId++}`,
            values: awsEmbedding,
            metadata: {
                type: 'technology',
                technology: 'AWS',
                content: awsTextEn,
                category: 'skills',
                name: 'AWS Cloud Platform',
                chunk_index: 0,
                tags: this.normalizeTags(['aws', 'cloud', 'amazon', 'infrastructure', 'devops'])
            }
        });
        await this.delay(100);

        const azureText = `Azure Cloud Platform | Microsoft Azure. Category: skills. Technology: Azure. Context: Marco has Azure Developer Associate certification (7AD53B-G21DD4) and supervised Azure cloud deployment for Deloitte Neptune project. He also used Azure for hosting personal projects like Ostea38. Azure is a core competency. Related questions: Do you use Azure? Do you know Microsoft Azure? Are you Azure certified?`;
        const azureTextEn = await this.ensureEnglish(azureText);
        const azureEmbedding = await this.generateEmbedding(azureTextEn);
        vectors.push({
            id: `tech_azure_${vectorId++}`,
            values: azureEmbedding,
            metadata: {
                type: 'technology',
                technology: 'Azure',
                content: azureTextEn,
                category: 'skills',
                name: 'Azure Cloud Platform',
                chunk_index: 0,
                tags: this.normalizeTags(['azure', 'microsoft', 'cloud', 'certification', 'infrastructure'])
            }
        });
        await this.delay(100);

        const typescriptText = `TypeScript Programming Language. Category: skills. Technology: TypeScript. Context: Marco uses TypeScript extensively across multiple projects and frameworks including Angular, NestJS, and Next.js. TypeScript is his primary language for both frontend and backend development. Related questions: Do you use TypeScript? Do you know TypeScript? Can you work with TypeScript?`;
        const typescriptTextEn = await this.ensureEnglish(typescriptText);
        const typescriptEmbedding = await this.generateEmbedding(typescriptTextEn);
        vectors.push({
            id: `tech_typescript_${vectorId++}`,
            values: typescriptEmbedding,
            metadata: {
                type: 'technology',
                technology: 'TypeScript',
                content: typescriptTextEn,
                category: 'skills',
                name: 'TypeScript Language',
                chunk_index: 0,
                tags: this.normalizeTags(['typescript', 'javascript', 'programming', 'language', 'frontend', 'backend'])
            }
        });
        await this.delay(100);

        const postgresqlText = `PostgreSQL Database. Category: skills. Technology: PostgreSQL. Context: Marco uses PostgreSQL in multiple professional projects including Pernod Ricard Data Portal, Deloitte Neptune, and Odyssee. PostgreSQL is his primary database choice for enterprise applications. Related questions: Do you use PostgreSQL? Do you know PostgreSQL? Can you work with databases?`;
        const postgresqlTextEn = await this.ensureEnglish(postgresqlText);
        const postgresqlEmbedding = await this.generateEmbedding(postgresqlTextEn);
        vectors.push({
            id: `tech_postgresql_${vectorId++}`,
            values: postgresqlEmbedding,
            metadata: {
                type: 'technology',
                technology: 'PostgreSQL',
                content: postgresqlTextEn,
                category: 'skills',
                name: 'PostgreSQL Database',
                chunk_index: 0,
                tags: this.normalizeTags(['postgresql', 'database', 'sql', 'data', 'backend'])
            }
        });
        await this.delay(100);

        // FAQ-style entries for common questions
        const frontendQuestionText = `Frontend Development Question. Category: questions. Question: What frontend technologies do you use? Answer: Marco is proficient in Angular and Next.js for frontend development, with extensive experience in TypeScript, JavaScript, HTML, and CSS. He has used these technologies in multiple professional projects.`;
        const frontendQuestionTextEn = await this.ensureEnglish(frontendQuestionText);
        const frontendQuestionEmbedding = await this.generateEmbedding(frontendQuestionTextEn);
        vectors.push({
            id: `faq_frontend_${vectorId++}`,
            values: frontendQuestionEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'frontend',
                content: frontendQuestionTextEn,
                category: 'skills',
                name: 'Frontend Technologies FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['frontend', 'angular', 'nextjs', 'react', 'javascript', 'typescript'])
            }
        });
        await this.delay(100);

        const backendQuestionText = `Backend Development Question. Category: questions. Question: What backend technologies do you use? Answer: Marco specializes in NestJS for backend development, working with Node.js, TypeScript, and PostgreSQL databases. He has extensive experience building APIs and serverless architectures.`;
        const backendQuestionTextEn = await this.ensureEnglish(backendQuestionText);
        const backendQuestionEmbedding = await this.generateEmbedding(backendQuestionTextEn);
        vectors.push({
            id: `faq_backend_${vectorId++}`,
            values: backendQuestionEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'backend',
                content: backendQuestionTextEn,
                category: 'skills',
                name: 'Backend Technologies FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['backend', 'nestjs', 'nodejs', 'api', 'serverless', 'database'])
            }
        });
        await this.delay(100);

        const cloudQuestionText = `Cloud Development Question. Category: questions. Question: What cloud platforms do you use? Answer: Marco is experienced with AWS, Azure, and GCP. He is Microsoft Azure certified and has deployed applications on all three platforms, with expertise in serverless, containerization, and infrastructure as code.`;
        const cloudQuestionTextEn = await this.ensureEnglish(cloudQuestionText);
        const cloudQuestionEmbedding = await this.generateEmbedding(cloudQuestionTextEn);
        vectors.push({
            id: `faq_cloud_${vectorId++}`,
            values: cloudQuestionEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'cloud',
                content: cloudQuestionTextEn,
                category: 'skills',
                name: 'Cloud Platforms FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['cloud', 'aws', 'azure', 'gcp', 'serverless', 'infrastructure', 'devops'])
            }
        });
        await this.delay(100);

        // EXPERIENCE-RELATED QUESTIONS
        const deloitteQuestionText = `Deloitte Experience Question. Category: questions. Question: Tell me about your experience at Deloitte. Answer: Marco worked as a Cloud Developer Apprentice at Deloitte Grenoble from September 2022 to September 2025. He worked on major projects including Pernod Ricard Data Portal, World Athletics Stats Zone Pro, Deloitte Neptune, and Odyssee. He specialized in fullstack and cloud development with Angular, NestJS, PostgreSQL stack.`;
        const deloitteQuestionTextEn = await this.ensureEnglish(deloitteQuestionText);
        const deloitteQuestionEmbedding = await this.generateEmbedding(deloitteQuestionTextEn);
        vectors.push({
            id: `faq_deloitte_${vectorId++}`,
            values: deloitteQuestionEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'experience',
                content: deloitteQuestionTextEn,
                category: 'experience',
                name: 'Deloitte Experience FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['deloitte', 'experience', 'cloud', 'apprentice', 'projects'])
            }
        });
        await this.delay(100);

        const currentRoleText = `Current Status Question. Category: questions. Question: What is your current position? Answer: Marco recently completed his Cloud Developer Apprentice position at Deloitte Grenoble (September 2022 - September 2025) and is now available for new opportunities. He has experience in fullstack development and cloud architecture for enterprise clients and is seeking a permanent position.`;
        const currentRoleTextEn = await this.ensureEnglish(currentRoleText);
        const currentRoleEmbedding = await this.generateEmbedding(currentRoleTextEn);
        vectors.push({
            id: `faq_current_role_${vectorId++}`,
            values: currentRoleEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'experience',
                content: currentRoleTextEn,
                category: 'experience',
                name: 'Current Role FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['current', 'position', 'role', 'deloitte', 'apprentice'])
            }
        });
        await this.delay(100);

        const yearsExpText = `Years of Experience Question. Category: questions. Question: How many years of experience do you have? Answer: Marco has been working since 2015 with internships at Oracle and Hurence, and completed a 3-year apprenticeship at Deloitte (2022-2025). He has extensive experience in fullstack development, cloud architecture, and enterprise applications spanning over 10 years.`;
        const yearsExpTextEn = await this.ensureEnglish(yearsExpText);
        const yearsExpEmbedding = await this.generateEmbedding(yearsExpTextEn);
        vectors.push({
            id: `faq_experience_years_${vectorId++}`,
            values: yearsExpEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'experience',
                content: yearsExpTextEn,
                category: 'experience',
                name: 'Years of Experience FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['experience', 'years', 'career', 'timeline', 'professional'])
            }
        });
        await this.delay(100);

        // PROJECT-SPECIFIC QUESTIONS
        const pernodRicardText = `Pernod Ricard Project Question. Category: questions. Question: Tell me about the Pernod Ricard project. Answer: Marco worked on the Pernod Ricard Data Portal, designing and developing a data management solution with cloud integration and serverless architecture. He used Angular, NestJS, PostgreSQL stack and also conducted training for new developers during handover.`;
        const pernodRicardTextEn = await this.ensureEnglish(pernodRicardText);
        const pernodRicardEmbedding = await this.generateEmbedding(pernodRicardTextEn);
        vectors.push({
            id: `faq_pernod_ricard_${vectorId++}`,
            values: pernodRicardEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'project',
                content: pernodRicardTextEn,
                category: 'projects',
                name: 'Pernod Ricard Project FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['pernod', 'ricard', 'data', 'portal', 'angular', 'nestjs', 'postgresql'])
            }
        });
        await this.delay(100);

        const worldAthleticsText = `World Athletics Project Question. Category: questions. Question: What did you do for World Athletics? Answer: Marco worked on World Athletics Stats Zone Pro, developing modern interfaces and microservices integration with cloud native architecture. He used Next.js and Strapi, participated in architecture design, DevOps, and AWS cloud deployment.`;
        const worldAthleticsTextEn = await this.ensureEnglish(worldAthleticsText);
        const worldAthleticsEmbedding = await this.generateEmbedding(worldAthleticsTextEn);
        vectors.push({
            id: `faq_world_athletics_${vectorId++}`,
            values: worldAthleticsEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'project',
                content: worldAthleticsTextEn,
                category: 'projects',
                name: 'World Athletics Project FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['world', 'athletics', 'stats', 'zone', 'nextjs', 'strapi', 'aws'])
            }
        });
        await this.delay(100);

        const neptuneText = `Neptune Project Question. Category: questions. Question: What is the Neptune project? Answer: Deloitte Neptune is a modular SaaS that Marco helped develop, adaptable to different clients and rapidly deployable. It's used as Deloitte's showcase project. Marco worked as fullstack and cloud developer, implemented AI assistant functionality, and supervised Azure cloud deployment following his AZ204 certification.`;
        const neptuneTextEn = await this.ensureEnglish(neptuneText);
        const neptuneEmbedding = await this.generateEmbedding(neptuneTextEn);
        vectors.push({
            id: `faq_neptune_${vectorId++}`,
            values: neptuneEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'project',
                content: neptuneTextEn,
                category: 'projects',
                name: 'Neptune Project FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['neptune', 'saas', 'modular', 'ai', 'assistant', 'azure', 'showcase'])
            }
        });
        await this.delay(100);

        const ostea38Text = `Ostea38 Project Question. Category: questions. Question: Tell me about Ostea38. Answer: Ostea38 is a personal project - a showcase website for an animal osteopath. Marco implemented it with cost limitation objectives while maximizing performance (FinOps). Developed in NextJS using CloudFlare as CDN, hosted on Azure. Extensive SEO work achieved first position in Google searches, ahead of CMS sites like WordPress and PrestaShop.`;
        const ostea38TextEn = await this.ensureEnglish(ostea38Text);
        const ostea38Embedding = await this.generateEmbedding(ostea38TextEn);
        vectors.push({
            id: `faq_ostea38_${vectorId++}`,
            values: ostea38Embedding,
            metadata: {
                type: 'faq',
                question_type: 'project',
                content: ostea38TextEn,
                category: 'projects',
                name: 'Ostea38 Project FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['ostea38', 'nextjs', 'seo', 'finops', 'cloudflare', 'azure', 'personal'])
            }
        });
        await this.delay(100);

        // EDUCATION QUESTIONS
        const educationText = `Education Question. Category: questions. Question: What is your educational background? Answer: Marco completed a Master's in Computer Science and Information Systems at Epsi, Grenoble (2023-2025) and has a Bachelor's in Application Developer Designer from the same school (2020-2023). He is now available for new opportunities.`;
        const educationTextEn = await this.ensureEnglish(educationText);
        const educationEmbedding = await this.generateEmbedding(educationTextEn);
        vectors.push({
            id: `faq_education_${vectorId++}`,
            values: educationEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'education',
                content: educationTextEn,
                category: 'education',
                name: 'Education Background FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['education', 'master', 'bachelor', 'epsi', 'grenoble', 'graduation'])
            }
        });
        await this.delay(100);

        const certificationText = `Azure Certification Question. Category: questions. Question: Do you have any certifications? Answer: Yes, Marco is Microsoft Certified: Azure Developer Associate (Level 2, Certification ID: 7AD53B-G21DD4). This certification validates his expertise in Azure cloud development and deployment.`;
        const certificationTextEn = await this.ensureEnglish(certificationText);
        const certificationEmbedding = await this.generateEmbedding(certificationTextEn);
        vectors.push({
            id: `faq_certification_${vectorId++}`,
            values: certificationEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'certification',
                content: certificationTextEn,
                category: 'certifications',
                name: 'Azure Certification FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['certification', 'azure', 'microsoft', 'developer', 'associate', 'cloud'])
            }
        });
        await this.delay(100);

        // PERSONAL/PROFILE QUESTIONS
        const contactText = `Contact Information Question. Category: questions. Question: How can I contact you? Answer: You can reach Marco Pyré at ytmarcopyre@gmail.com or check his GitHub profile at https://github.com/marcopyre. He is available for new opportunities having completed his apprenticeship at Deloitte in September 2025.`;
        const contactTextEn = await this.ensureEnglish(contactText);
        const contactEmbedding = await this.generateEmbedding(contactTextEn);
        vectors.push({
            id: `faq_contact_${vectorId++}`,
            values: contactEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'contact',
                content: contactTextEn,
                category: 'profile',
                name: 'Contact Information FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['contact', 'email', 'github', 'marco', 'pyre', 'reach'])
            }
        });
        await this.delay(100);

        const availabilityText = `Availability Question. Category: questions. Question: Are you available for hire? Answer: Yes, Marco is available for new opportunities having completed his apprenticeship at Deloitte in September 2025. He is seeking a permanent position in fullstack development, cloud architecture, or technical leadership roles.`;
        const availabilityTextEn = await this.ensureEnglish(availabilityText);
        const availabilityEmbedding = await this.generateEmbedding(availabilityTextEn);
        vectors.push({
            id: `faq_availability_${vectorId++}`,
            values: availabilityEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'availability',
                content: availabilityTextEn,
                category: 'profile',
                name: 'Availability FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['availability', 'hire', 'job', 'seeking', 'position', 'graduation'])
            }
        });
        await this.delay(100);

        const spokenLanguagesText = `Languages Question. Category: questions. Question: What languages do you speak? Answer: Marco is a native French speaker and is fluent in English (C2 level). This bilingual proficiency allows him to work effectively in international environments.`;
        const spokenLanguagesTextEn = await this.ensureEnglish(spokenLanguagesText);
        const spokenLanguagesEmbedding = await this.generateEmbedding(spokenLanguagesTextEn);
        vectors.push({
            id: `faq_languages_${vectorId++}`,
            values: spokenLanguagesEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'languages',
                content: spokenLanguagesTextEn,
                category: 'profile',
                name: 'Spoken Languages FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['languages', 'french', 'english', 'bilingual', 'native', 'fluent'])
            }
        });
        await this.delay(100);

        // TECHNICAL ACHIEVEMENTS QUESTIONS
        const achievementsText = `Technical Achievements Question. Category: questions. Question: What are your main technical achievements? Answer: Marco resolved complex bugs at JavaScript compiler level through reverse engineering, collaborated on cloud architecture decisions with high technical impact, achieved first position in Google searches through SEO optimization, and successfully supervised Azure cloud deployment following AZ204 certification.`;
        const achievementsTextEn = await this.ensureEnglish(achievementsText);
        const achievementsEmbedding = await this.generateEmbedding(achievementsTextEn);
        vectors.push({
            id: `faq_achievements_${vectorId++}`,
            values: achievementsEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'achievements',
                content: achievementsTextEn,
                category: 'achievements',
                name: 'Technical Achievements FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['achievements', 'javascript', 'compiler', 'cloud', 'architecture', 'seo'])
            }
        });
        await this.delay(100);

        const problemSolvingText = `Problem Solving Question. Category: questions. Question: Can you give examples of complex problems you solved? Answer: Marco resolved complex bugs at JavaScript compiler level through reverse engineering, which required deep technical analysis. He also collaborated on cloud architecture decisions with high technical impact and optimized applications for performance and cost (FinOps principles).`;
        const problemSolvingTextEn = await this.ensureEnglish(problemSolvingText);
        const problemSolvingEmbedding = await this.generateEmbedding(problemSolvingTextEn);
        vectors.push({
            id: `faq_problem_solving_${vectorId++}`,
            values: problemSolvingEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'problem_solving',
                content: problemSolvingTextEn,
                category: 'achievements',
                name: 'Problem Solving FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['problem', 'solving', 'debugging', 'analysis', 'optimization', 'finops'])
            }
        });
        await this.delay(100);

        // SPECIALIZATION QUESTIONS
        const cloudExpertiseText = `Cloud Expertise Question. Category: questions. Question: What is your cloud expertise? Answer: Marco specializes in cloud native architecture, serverless computing, and FinOps (cost optimization). He has experience with AWS, Azure, and GCP platforms, with particular expertise in Azure (certified Azure Developer Associate). He has deployed applications on all three platforms.`;
        const cloudExpertiseTextEn = await this.ensureEnglish(cloudExpertiseText);
        const cloudExpertiseEmbedding = await this.generateEmbedding(cloudExpertiseTextEn);
        vectors.push({
            id: `faq_cloud_expertise_${vectorId++}`,
            values: cloudExpertiseEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'expertise',
                content: cloudExpertiseTextEn,
                category: 'skills',
                name: 'Cloud Expertise FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['cloud', 'native', 'serverless', 'finops', 'aws', 'azure', 'gcp'])
            }
        });
        await this.delay(100);

        const fullstackText = `Fullstack Development Question. Category: questions. Question: Are you a fullstack developer? Answer: Yes, Marco is a fullstack developer with expertise in both frontend (Angular, Next.js) and backend (NestJS, Express) technologies. He has experience with databases (PostgreSQL, MongoDB), cloud deployment, and DevOps practices. He has worked on complete application development cycles.`;
        const fullstackTextEn = await this.ensureEnglish(fullstackText);
        const fullstackEmbedding = await this.generateEmbedding(fullstackTextEn);
        vectors.push({
            id: `faq_fullstack_${vectorId++}`,
            values: fullstackEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'expertise',
                content: fullstackTextEn,
                category: 'skills',
                name: 'Fullstack Development FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['fullstack', 'frontend', 'backend', 'complete', 'cycle', 'development'])
            }
        });
        await this.delay(100);

        const aiExperienceText = `AI Experience Question. Category: questions. Question: Do you have experience with AI? Answer: Yes, Marco implemented AI assistant functionality in the Deloitte Neptune project and has experience with Machine Learning, Data Mining, and Big Data. He also developed an iOS App with integrated Siri AI featuring advanced voice commands.`;
        const aiExperienceTextEn = await this.ensureEnglish(aiExperienceText);
        const aiExperienceEmbedding = await this.generateEmbedding(aiExperienceTextEn);
        vectors.push({
            id: `faq_ai_experience_${vectorId++}`,
            values: aiExperienceEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'ai',
                content: aiExperienceTextEn,
                category: 'skills',
                name: 'AI Experience FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['ai', 'artificial', 'intelligence', 'machine', 'learning', 'siri', 'assistant'])
            }
        });
        await this.delay(100);

        const hardwareText = `Hardware Experience Question. Category: questions. Question: Do you work with hardware? Answer: Yes, Marco has experience with hardware development. He developed a custom PCB (Printed Circuit Board) with embedded firmware, and has experience with firmware design and PCB development. He also uses tools like PlatformIO for embedded development.`;
        const hardwareTextEn = await this.ensureEnglish(hardwareText);
        const hardwareEmbedding = await this.generateEmbedding(hardwareTextEn);
        vectors.push({
            id: `faq_hardware_${vectorId++}`,
            values: hardwareEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'hardware',
                content: hardwareTextEn,
                category: 'skills',
                name: 'Hardware Experience FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['hardware', 'pcb', 'firmware', 'embedded', 'electronics', 'platformio'])
            }
        });
        await this.delay(100);

        // METHODOLOGY QUESTIONS
        const agileText = `Agile Methodology Question. Category: questions. Question: Do you work with Agile methodologies? Answer: Yes, Marco has experience with Agile methodologies and project management. His work at Deloitte involves collaborative development environments and iterative development processes typical of Agile frameworks.`;
        const agileTextEn = await this.ensureEnglish(agileText);
        const agileEmbedding = await this.generateEmbedding(agileTextEn);
        vectors.push({
            id: `faq_agile_${vectorId++}`,
            values: agileEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'methodology',
                content: agileTextEn,
                category: 'skills',
                name: 'Agile Methodology FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['agile', 'methodology', 'project', 'management', 'collaborative', 'iterative'])
            }
        });
        await this.delay(100);

        const devopsText = `DevOps Experience Question. Category: questions. Question: Do you have DevOps experience? Answer: Yes, Marco has extensive DevOps experience including Docker, Kubernetes, CI/CD pipelines, and Infrastructure as Code (Terraform). He participated in DevOps and AWS cloud deployment for World Athletics, and supervised Azure cloud deployment for Neptune project.`;
        const devopsTextEn = await this.ensureEnglish(devopsText);
        const devopsEmbedding = await this.generateEmbedding(devopsTextEn);
        vectors.push({
            id: `faq_devops_${vectorId++}`,
            values: devopsEmbedding,
            metadata: {
                type: 'faq',
                question_type: 'devops',
                content: devopsTextEn,
                category: 'skills',
                name: 'DevOps Experience FAQ',
                chunk_index: 0,
                tags: this.normalizeTags(['devops', 'docker', 'kubernetes', 'cicd', 'terraform', 'infrastructure'])
            }
        });
        await this.delay(100);

        // Skills overview
        const skillsOverview = `Skills overview. Category: skills. Languages: ${portfolioData.skills.languages.join(', ')}. Frameworks: ${portfolioData.skills.frameworks.join(', ')}. Cloud: ${portfolioData.skills.cloud.join(', ')}. Specializations: ${portfolioData.skills.specializations.join(', ')}. Related questions: What are your skills? Tell me about your skills. What is your stack? Which technologies do you master? Do you use Angular? Do you work with React? Do you know Next.js?`;
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

        for (const edu of portfolioData.education) {
            const eduText = `Education | Degree | Studies. Category: education. Degree: ${edu.degree}. School: ${edu.school}. Period: ${edu.period}. Keywords: education, degree, studies, school.`;
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

        // Education overview
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

        // Certifications overview
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

        // Achievements overview
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
        console.log(`Skill categories: 4`);
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