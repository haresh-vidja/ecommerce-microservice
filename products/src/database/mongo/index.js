import mongoose from 'mongoose';  // Import mongoose for MongoDB interactions
import { addShutdownHandler } from '../../utils/graceful-shutdown.js';
export const init = async () => {

    try {
        // Attempt to connect to the MongoDB database using the URI from environment variables
        await mongoose.connect(process.env.MONGODB_URI);
        // If connection is successful, log a success message
        console.log('MongoDB connected')
        
        mongoose.connection.on('close', () => console.log('MongoDB connection closed'))
        mongoose.connection.on('disconnected', (error) => {
            console.log('MongoDB disconnected')
            process.kill(process.pid, "SIGINT");
        })

        //handle shutdown process
        addShutdownHandler(async () => {
            try {
                mongoose.disconnect();
            } catch (error) {
                console.log("Error in MongoDB disconnect");
            }
        });

    } catch (error) {
        // If there's an error during database connection, log the error
        console.error('MongoDb connection error', error);
    }
    return;
}