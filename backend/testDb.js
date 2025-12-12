require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');
        console.log('URI:', process.env.MONGODB_URI);
        
        const uri = process.env.MONGODB_URI.includes('?') 
            ? process.env.MONGODB_URI.replace('?', '/placifyDB?')
            : process.env.MONGODB_URI + '/placifyDB';
        
        console.log('Connecting to:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        
        const conn = await mongoose.connect(uri);
        
        console.log('✓ MongoDB Connected Successfully!');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        console.log('Ready State:', conn.connection.readyState);
        
        // Test creating a simple document
        const TestSchema = new mongoose.Schema({ test: String });
        const TestModel = mongoose.model('Test', TestSchema);
        
        const testDoc = await TestModel.create({ test: 'Connection test' });
        console.log('✓ Test document created:', testDoc._id);
        
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('✓ Test document deleted');
        
        await mongoose.connection.close();
        console.log('✓ Connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('✗ MongoDB Connection Failed:');
        console.error('Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

testConnection();
