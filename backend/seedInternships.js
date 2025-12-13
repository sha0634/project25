// Script to seed sample internships in the database
const mongoose = require('mongoose');
require('dotenv').config();

const internshipSchema = new mongoose.Schema({
    title: String,
    company: String,
    companyId: mongoose.Schema.Types.ObjectId,
    location: String,
    type: String,
    duration: String,
    stipend: String,
    description: String,
    requirements: String,
    skills: [String],
    status: String,
    createdAt: Date
});

const Internship = mongoose.model('Internship', internshipSchema);

const sampleInternships = [
    {
        title: "Software Engineering Intern",
        company: "Google",
        companyId: new mongoose.Types.ObjectId(),
        location: "Bangalore, India",
        type: "On-site",
        duration: "3 months",
        stipend: "₹50,000/month",
        description: "Join Google's engineering team to work on cutting-edge technologies and scalable systems.",
        requirements: "Strong problem-solving skills, knowledge of data structures and algorithms",
        skills: ["JavaScript", "Python", "React", "Node.js"],
        status: "Active"
    },
    {
        title: "Data Analysis Intern",
        company: "Summit Consulting",
        companyId: new mongoose.Types.ObjectId(),
        location: "Remote",
        type: "Remote",
        duration: "6 months",
        stipend: "₹25,000/month",
        description: "Analyze complex datasets and create insightful reports for business decisions.",
        requirements: "Knowledge of SQL, Excel, and basic statistics",
        skills: ["SQL", "Python", "Excel", "Data Visualization"],
        status: "Active"
    },
    {
        title: "Marketing Intern",
        company: "Tech Innovations",
        companyId: new mongoose.Types.ObjectId(),
        location: "Hyderabad, India",
        type: "Hybrid",
        duration: "4 months",
        stipend: "₹20,000/month",
        description: "Support marketing campaigns, social media management, and content creation.",
        requirements: "Creative mindset, good communication skills",
        skills: ["Social Media", "Content Writing", "Marketing", "Canva"],
        status: "Active"
    },
    {
        title: "Product Management Intern",
        company: "DataTech Solutions",
        companyId: new mongoose.Types.ObjectId(),
        location: "Pune, India",
        type: "On-site",
        duration: "5 months",
        stipend: "₹35,000/month",
        description: "Work with product managers to define product roadmaps and feature specifications.",
        requirements: "Analytical thinking, user empathy, basic technical knowledge",
        skills: ["Product Management", "Jira", "User Research", "Agile"],
        status: "Active"
    },
    {
        title: "UI/UX Design Intern",
        company: "Creative Studios",
        companyId: new mongoose.Types.ObjectId(),
        location: "Mumbai, India",
        type: "Hybrid",
        duration: "3 months",
        stipend: "₹30,000/month",
        description: "Design beautiful and intuitive user interfaces for web and mobile applications.",
        requirements: "Portfolio showcasing design work, knowledge of design principles",
        skills: ["Figma", "Adobe XD", "UI Design", "UX Research"],
        status: "Active"
    },
    {
        title: "Full Stack Developer Intern",
        company: "StartupHub",
        companyId: new mongoose.Types.ObjectId(),
        location: "Remote",
        type: "Remote",
        duration: "6 months",
        stipend: "₹40,000/month",
        description: "Build end-to-end features for our SaaS platform using modern web technologies.",
        requirements: "Experience with MERN stack or similar technologies",
        skills: ["React", "Node.js", "MongoDB", "Express"],
        status: "Active"
    }
];

async function seedInternships() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing internships (optional)
        await Internship.deleteMany({});
        console.log('Cleared existing internships');

        // Insert sample internships
        const result = await Internship.insertMany(sampleInternships);
        console.log(`${result.length} internships added successfully!`);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding internships:', error);
        mongoose.connection.close();
    }
}

seedInternships();
