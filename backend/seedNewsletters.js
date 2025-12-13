// Script to seed sample newsletters in the database
const mongoose = require('mongoose');
require('dotenv').config();

const newsletterSchema = new mongoose.Schema({
    title: String,
    company: String,
    companyId: mongoose.Schema.Types.ObjectId,
    summary: String,
    content: String,
    date: Date,
    status: String
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

const sampleNewsletters = [
    {
        title: "Google Summer Internship Updates",
        company: "Google",
        companyId: new mongoose.Types.ObjectId(),
        summary: "Latest batch timelines, roles, and eligibility.",
        date: new Date("2025-12-10"),
        content: `
          <h3>Exciting News for Aspiring Googlers!</h3>
          <p>We're thrilled to announce our Summer 2026 Internship Program is now open for applications. This year, we're expanding our program to include more diverse roles across engineering, product, design, and business teams.</p>
          
          <h4>Key Highlights:</h4>
          <ul>
            <li><strong>Duration:</strong> 10-12 weeks (May - August 2026)</li>
            <li><strong>Locations:</strong> Bangalore, Hyderabad, Mumbai, and Gurgaon</li>
            <li><strong>Stipend:</strong> Competitive compensation package</li>
            <li><strong>Application Deadline:</strong> January 15, 2026</li>
          </ul>
          
          <h4>Available Roles:</h4>
          <ul>
            <li>Software Engineering Intern</li>
            <li>Product Management Intern</li>
            <li>UX Design Intern</li>
            <li>Data Science Intern</li>
            <li>Business Analyst Intern</li>
          </ul>
          
          <h4>Eligibility:</h4>
          <p>Students pursuing Bachelor's or Master's degrees in Computer Science, Engineering, Business, or related fields. Strong problem-solving skills and passion for technology are essential.</p>
          
          <p><strong>Ready to apply?</strong> Visit our careers portal and submit your application along with your resume and cover letter. Selected candidates will be contacted for technical and behavioral interviews.</p>
        `,
        status: "Published"
    },
    {
        title: "Tech Innovations Hiring Drive",
        company: "Tech Innovations",
        companyId: new mongoose.Types.ObjectId(),
        summary: "Marketing + Product roles for freshers.",
        date: new Date("2025-12-08"),
        content: `
          <h3>Join Tech Innovations - We're Hiring!</h3>
          <p>Tech Innovations is conducting a campus hiring drive for passionate freshers looking to kickstart their careers in Marketing and Product Management.</p>
          
          <h4>Why Join Us?</h4>
          <ul>
            <li>Work on cutting-edge SaaS products</li>
            <li>Mentorship from industry leaders</li>
            <li>Flexible work culture (Hybrid model)</li>
            <li>Fast-track career growth opportunities</li>
          </ul>
          
          <h4>Open Positions:</h4>
          <p><strong>1. Marketing Intern</strong></p>
          <ul>
            <li>Content creation and social media management</li>
            <li>Campaign planning and execution</li>
            <li>Market research and competitor analysis</li>
            <li>Stipend: ₹20,000/month</li>
          </ul>
          
          <p><strong>2. Product Management Intern</strong></p>
          <ul>
            <li>Feature ideation and roadmap planning</li>
            <li>User research and feedback analysis</li>
            <li>Cross-functional team collaboration</li>
            <li>Stipend: ₹35,000/month</li>
          </ul>
          
          <h4>Selection Process:</h4>
          <p>Online Assessment → Group Discussion → HR Interview → Final Offer</p>
          
          <p>Applications close on December 31, 2025. Don't miss this opportunity!</p>
        `,
        status: "Published"
    },
    {
        title: "Summit Consulting Data Week",
        company: "Summit Consulting",
        companyId: new mongoose.Types.ObjectId(),
        summary: "Workshops and internship program for analysts.",
        date: new Date("2025-12-05"),
        content: `
          <h3>Summit Consulting Data Week 2026</h3>
          <p>We're excited to invite students to our annual Data Week - a series of workshops, masterclasses, and networking sessions focused on data analytics and consulting.</p>
          
          <h4>Event Schedule:</h4>
          <p><strong>Day 1 (Jan 15):</strong> Introduction to Data Analytics in Consulting</p>
          <p><strong>Day 2 (Jan 16):</strong> SQL and Python for Business Analysis</p>
          <p><strong>Day 3 (Jan 17):</strong> Data Visualization with Tableau & Power BI</p>
          <p><strong>Day 4 (Jan 18):</strong> Case Study Competition</p>
          <p><strong>Day 5 (Jan 19):</strong> Networking & Internship Offers</p>
          
          <h4>Internship Opportunities:</h4>
          <p>Top performers in the case study competition will receive pre-placement offers for our 6-month Data Analyst Internship Program.</p>
          
          <h4>Internship Benefits:</h4>
          <ul>
            <li>Stipend: ₹25,000/month</li>
            <li>Remote work option available</li>
            <li>Real client projects exposure</li>
            <li>Certification upon completion</li>
            <li>PPO (Pre-Placement Offer) for high performers</li>
          </ul>
          
          <h4>Registration:</h4>
          <p>Limited seats available! Register by December 20, 2025. Participation is free for all registered students.</p>
          
          <p><em>This is a great opportunity to learn, network, and secure your first internship in the consulting industry!</em></p>
        `,
        status: "Published"
    }
];

async function seedNewsletters() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing newsletters (optional)
        await Newsletter.deleteMany({});
        console.log('Cleared existing newsletters');

        // Insert sample newsletters
        const result = await Newsletter.insertMany(sampleNewsletters);
        console.log(`${result.length} newsletters added successfully!`);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding newsletters:', error);
        mongoose.connection.close();
    }
}

seedNewsletters();
