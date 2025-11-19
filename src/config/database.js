const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/supply_app';

    console.log('   📍 Connecting to:', dbUrl.replace(/\/\/.*@/, '//***@'));

    const conn = await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`   ✅ MongoDB Connected Successfully!`);
    console.log(`   📦 Database: ${conn.connection.name}`);
    console.log(`   🖥️  Host: ${conn.connection.host}`);
  } catch (error) {
    console.error('');
    console.error('   ❌ MongoDB Connection Failed!');
    console.error('   💡 Make sure MongoDB is running on your computer');
    console.error('   💡 Check your MONGODB_URI in .env file');
    console.error(`   📝 Error: ${error.message}`);
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;
