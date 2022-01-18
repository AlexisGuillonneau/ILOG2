import express from "express"
import HTTP from "./httpcodes"

const app = express()

// association d'une méthode (GET), d'une route (/book) 
app.get("/book", (req, resp) => {	
    let filePath =     
    resp.type("json")				    
    resp.download(filePath);		       
})