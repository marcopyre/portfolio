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
                status: "Seeking a permanent position post-graduation (2025)"
            },

            experiences: [
                {
                    company: "Deloitte",
                    location: "Grenoble",
                    position: "Cloud Developer Apprentice",
                    period: "September 2022 - PRESENT",
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
                    "NestJS", "Express", "Strapi", "AngularJS", "Next.js", "SwiftUI"
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

        // Skills overview
        const skillsOverview = `Skills overview. Category: skills. Languages: ${portfolioData.skills.languages.join(', ')}. Frameworks: ${portfolioData.skills.frameworks.join(', ')}. Cloud: ${portfolioData.skills.cloud.join(', ')}. Specializations: ${portfolioData.skills.specializations.join(', ')}. Related questions: What are your skills? Tell me about your skills. What is your stack? Which technologies do you master?`;
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