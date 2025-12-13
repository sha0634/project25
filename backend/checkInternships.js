// Script to check internships in database
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

async function checkInternships() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const count = await Internship.countDocuments();
        console.log(`Total internships in database: ${count}`);

        const internships = await Internship.find({});
        console.log('\nInternships:');
        internships.forEach((internship, index) => {
            console.log(`${index + 1}. ${internship.title} at ${internship.company} (${internship.status})`);
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('Error checking internships:', error);
        mongoose.connection.close();
    }
}

checkInternships();
