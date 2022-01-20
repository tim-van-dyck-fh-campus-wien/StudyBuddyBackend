const express=require('express');


const app = express();

const mongoose = require('mongoose');//for mongo db
const dotenv = require('dotenv');//used to securly store secret information inside .env
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');

dotenv.config();

//routes
const authRoute = require('./routes/auth');
const studyGroupsRoute = require('./routes/studyGroups');
const messageRoute = require('./routes/message');
const imagesRoute = require('./routes/images');
const appointmentsRoute = require('./routes/appointments');
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true, useUnifiedTopology:true}).then( () => console.log("connected to DB."))
.catch( err => console.log(err));
//middleware
app.use(express.json());//parse body 
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('common'));
app.use(session({//https://www.youtube.com/watch?v=J1qXK66k1y4
    secret:'top secret',//Store this in .env later
    resave:true,
    saveUninitialized:true,
    cookie:{
        maxAge:1000*60*60*24//24 hours
    }
}))
//Serve icons
app.use(express.static('Images'));
app.use(cors({
    origin:["http://localhost:4200"
], credentials: true
}));

app.get('/',(req,res)=>{
    res.send("ALL GOOD");
});
app.use('/api/auth',authRoute);
app.use('/api/studyGroups',studyGroupsRoute)
app.use('/api/message',messageRoute)
app.use('/api/images',imagesRoute);
app.use('/api/appointments',appointmentsRoute);
app.listen(3000,()=>{
    console.log("Server started on port 3000");
});