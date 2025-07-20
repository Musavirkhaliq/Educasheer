import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";
import scheduledTasksService from "./src/services/scheduledTasks.js";

const port = process.env.PORT || 5001;



connectDB()
.then(()=>{
    app.listen(port, () => {
                console.log(`Server running on port https://localhost:${port}`);

                // Start scheduled tasks after server is running
                console.log('Starting scheduled tasks for seat booking management...');
                scheduledTasksService.start();
            });
})
.catch(err=>{
    console.error("MongoDb connection failed",err)
})

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Graceful shutdown...');
    scheduledTasksService.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Graceful shutdown...');
    scheduledTasksService.stop();
    process.exit(0);
});






// DB Connection setting
// (async()=>{
// try {
//     await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
//     app.on("Error",(error)=>{
//         console.log("App error ", error)
//     })
//     app.listen(port, () => {
//         console.log(`Server running on port https://localhost:${port}`);
//     });
// } catch (error) {
//     console.error("ERROR", error)
//     throw new error("ERROR Connecting DB")
// }
// })();


