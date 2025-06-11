import dotenv from 'dotenv';
import { connetDB } from './db/index.js'
import { server } from './app.js';

dotenv.config({path:'./env'})

connetDB()
.then(()=>{
    
    server.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongo Db connection failed!!",err);
    
})
