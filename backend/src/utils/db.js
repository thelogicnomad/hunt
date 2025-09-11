import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not defined');
    cached.promise = mongoose.connect(uri).then((conn) => conn);
  }
  cached.conn = await cached.promise;
  return cached.conn;
};
