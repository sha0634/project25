const { PDFParse } = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

/**
 * Parse CV and extract relevant information
 * @param {string} filePath - Path to the CV file
 * @returns {Object} - Extracted information including skills, education, etc.
 */
async function parseCV(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        
        console.log('=== BEFORE PDF PARSE ===');
        console.log('Buffer length:', dataBuffer.length);
        console.log('========================');
        
        // Parse PDF using PDFParse class
        const pdfParser = new PDFParse({ data: dataBuffer });
        const result = await pdfParser.getText();
        const text = result.text;

        console.log('=== PDF PARSER DEBUG ===');
        console.log('Text extracted from PDF:', text ? 'YES' : 'NO');
        console.log('Text length:', text?.length);
        console.log('Text type:', typeof text);
        console.log('========================');
        console.log('FULL PDF TEXT:');
        console.log(text);
        console.log('========================');

        // Extract information
        const extractedData = {
            rawText: text, // Include the raw text
            skills: extractSkills(text),
            education: extractEducation(text),
            bio: extractBio(text)
        };

        console.log('=== EXTRACTED DATA DEBUG ===');
        console.log('rawText in object:', extractedData.rawText ? 'EXISTS' : 'UNDEFINED');
        console.log('rawText length in object:', extractedData.rawText?.length);
        console.log('============================');

        return extractedData;
    } catch (error) {
        console.error('Error parsing CV:', error);
        throw new Error('Failed to parse CV');
    }
}

/**
 * Extract skills from CV text
 */
function extractSkills(text) {
    const skills = [];
    const skillsSection = text.toLowerCase();

    // Common programming languages
    const programmingLanguages = [
        'javascript', 'python', 'java', 'c\\+\\+', 'c#', 'php', 'ruby', 'swift',
        'kotlin', 'go', 'rust', 'typescript', 'scala', 'perl', 'r', 'matlab',
        'sql', 'html', 'css'
    ];

    // Frameworks and libraries
    const frameworks = [
        'react', 'angular', 'vue', 'node\\.?js', 'express', 'django', 'flask',
        'spring', 'laravel', '.net', 'asp\\.net', 'jquery', 'bootstrap', 'tailwind',
        'next\\.?js', 'gatsby', 'svelte', 'fastapi', 'rails'
    ];

    // Databases
    const databases = [
        'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra', 'oracle',
        'sqlite', 'mariadb', 'dynamodb', 'firebase', 'elasticsearch'
    ];

    // Tools and technologies
    const tools = [
        'git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp',
        'linux', 'unix', 'agile', 'scrum', 'jira', 'confluence', 'webpack',
        'babel', 'npm', 'yarn', 'maven', 'gradle', 'api', 'rest', 'graphql',
        'microservices', 'ci/cd', 'devops', 'machine learning', 'deep learning',
        'artificial intelligence', 'data science', 'analytics', 'tableau',
        'power bi', 'excel', 'photoshop', 'illustrator', 'figma', 'sketch',
        'ui/ux', 'android', 'ios', 'react native', 'flutter'
    ];

    // Combine all skill keywords
    const allSkills = [...programmingLanguages, ...frameworks, ...databases, ...tools];

    // Search for each skill in the text
    allSkills.forEach(skill => {
        const regex = new RegExp(`\\b${skill}\\b`, 'gi');
        if (regex.test(skillsSection)) {
            // Capitalize properly
            const formattedSkill = skill
                .replace(/\\/g, '')
                .replace(/\./g, '')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            
            if (!skills.includes(formattedSkill)) {
                skills.push(formattedSkill);
            }
        }
    });

    return skills.slice(0, 20); // Limit to 20 skills
}

/**
 * Extract education information from CV text
 */
function extractEducation(text) {
    const education = [];
    const lines = text.split('\n');

    // Common degree patterns
    const degreePatterns = [
        /\b(Bachelor(?:'s)?|B\.?S\.?|B\.?A\.?|B\.?Tech|B\.?E\.?)\s+(?:of\s+)?(?:Science|Arts|Technology|Engineering)?(?:\s+in\s+)?([A-Za-z\s&,]+)/gi,
        /\b(Master(?:'s)?|M\.?S\.?|M\.?A\.?|M\.?Tech|MBA|M\.?E\.?)\s+(?:of\s+)?(?:Science|Arts|Technology|Engineering|Business Administration)?(?:\s+in\s+)?([A-Za-z\s&,]+)/gi,
        /\b(Ph\.?D\.?|Doctorate)\s+(?:in\s+)?([A-Za-z\s&,]+)/gi,
        /\b(Associate|Diploma)\s+(?:in\s+)?([A-Za-z\s&,]+)/gi
    ];

    const universityKeywords = ['university', 'college', 'institute', 'school', 'academy'];

    let currentEducation = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check for degree
        for (const pattern of degreePatterns) {
            const match = line.match(pattern);
            if (match) {
                const degree = match[0].trim();
                let fieldOfStudy = '';
                
                // Try to extract field of study
                const fieldMatch = match[2]?.trim();
                if (fieldMatch) {
                    fieldOfStudy = fieldMatch;
                }

                currentEducation = {
                    degree: degree,
                    fieldOfStudy: fieldOfStudy,
                    institution: '',
                    startDate: '',
                    endDate: '',
                    current: false
                };

                // Look for university in nearby lines
                for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 3); j++) {
                    const nearbyLine = lines[j].toLowerCase();
                    if (universityKeywords.some(keyword => nearbyLine.includes(keyword))) {
                        currentEducation.institution = lines[j].trim();
                        break;
                    }
                }

                // Look for years (e.g., 2018-2022, 2019-Present)
                const yearPattern = /\b(19|20)\d{2}\b/g;
                const years = line.match(yearPattern);
                if (years && years.length > 0) {
                    currentEducation.startDate = years[0];
                    if (years.length > 1) {
                        currentEducation.endDate = years[1];
                    }
                }

                // Check for "Present", "Current", "Ongoing"
                if (/\b(present|current|ongoing)\b/i.test(line)) {
                    currentEducation.current = true;
                }

                if (currentEducation && currentEducation.degree) {
                    education.push(currentEducation);
                    currentEducation = null;
                }
                break;
            }
        }
    }

    return education.slice(0, 5); // Limit to 5 education entries
}

/**
 * Extract bio/summary from CV text
 */
function extractBio(text) {
    const lines = text.split('\n');
    const summaryKeywords = ['summary', 'profile', 'objective', 'about', 'bio', 'introduction'];
    
    let bioStartIndex = -1;
    let bioEndIndex = -1;

    // Find summary section
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().trim();
        
        if (summaryKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
            bioStartIndex = i + 1;
            break;
        }
    }

    if (bioStartIndex !== -1) {
        // Extract next few lines as bio (until empty line or next section)
        const bioLines = [];
        const sectionHeaders = ['experience', 'work', 'education', 'skills', 'projects', 'certifications'];
        
        for (let i = bioStartIndex; i < Math.min(bioStartIndex + 10, lines.length); i++) {
            const line = lines[i].trim();
            
            // Stop at empty line or section header
            if (!line || sectionHeaders.some(header => 
                line.toLowerCase().includes(header) && line.length < 50
            )) {
                break;
            }
            
            bioLines.push(line);
        }

        const bio = bioLines.join(' ').trim();
        
        // Return bio if it's reasonable length (between 20 and 500 characters)
        if (bio.length >= 20 && bio.length <= 500) {
            return bio;
        }
    }

    return ''; // Return empty string if no suitable bio found
}

module.exports = {
    parseCV,
    extractSkills,
    extractEducation,
    extractBio
};
