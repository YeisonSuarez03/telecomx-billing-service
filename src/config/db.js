import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set; skipping MongoDB connection (useful for local dev without DB)');
    return;
  }

  console.log('Connecting to MongoDB', { uri: uri.startsWith('mongodb://') ? uri.split('@').pop() : uri });

  try {
    await mongoose.connect(uri);
    // expose mongoose connection globally for other modules if needed
    globalThis.mongo = mongoose;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
