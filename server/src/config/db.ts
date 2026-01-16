import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Configure global toJSON/toObject transformation
mongoose.plugin((schema) => {
    const transform = (doc: any, ret: any) => {
        ret.id = ret._id;
        return ret;
    };
    schema.set('toJSON', {
        virtuals: true,
        versionKey: false,
        transform,
    });
    schema.set('toObject', {
        virtuals: true,
        versionKey: false,
        transform,
    });
});

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_ts';

        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected...');
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;
