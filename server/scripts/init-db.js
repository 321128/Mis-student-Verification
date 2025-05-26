const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');

async function initDB() {
  try {
    const conn = await connectDB();
    
    // Create indexes
    console.log('Creating indexes...');
    
    // Job collection indexes
    await conn.connection.collection('jobs').createIndex({ jobId: 1 }, { unique: true });
    await conn.connection.collection('jobs').createIndex({ createdAt: -1 });
    await conn.connection.collection('jobs').createIndex({ status: 1 });
    
    // Student collection indexes
    await conn.connection.collection('students').createIndex({ email: 1 }, { unique: true });
    await conn.connection.collection('students').createIndex({ rollNumber: 1 }, { unique: true });
    
    // Report collection indexes
    await conn.connection.collection('reports').createIndex({ student: 1 });
    await conn.connection.collection('reports').createIndex({ jobId: 1 });
    await conn.connection.collection('reports').createIndex({ createdAt: -1 });
    
    console.log('Indexes created successfully');
    
    // Close connection
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDB();