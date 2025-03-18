import express from "express"

const app = express()

const recipeRoutes = require('./routes/recipe');
const userRoutes = require('./routes/user');
const submitsRoutes = require('./routes/submits');
// etc. (import other route files if not using routes/index.js)

app.use(express.json())

app.listen(8800, ()=>{
    console.log("Listening")
})