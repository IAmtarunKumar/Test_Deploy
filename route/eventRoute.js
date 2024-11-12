const express = require("express")
const {auth} = require("../Middleware/authorization");
const route = express.Router()
const dotenv = require("dotenv")
dotenv.config()
const { logger } = require("../utils/logger");
const Event = require("../model/eventModel");
 


// Route to get all events 

route.get('/get', auth,  async (req, res) => {
    try {
        // Fetch all projects
        const events = await Event.find().sort({ _id: -1 });
        //   console.log("projects", projects);
        res.status(200).send(events)
    } catch (error) {
      logger.error(`Error managing encryption keys: ${error.message}`);
        res.status(400).send(`Internal server error: ${error.message}`);
    }
});


// Route to create events 
route.post("/post",auth , async (req,res)=>{
    try {
        const createEvent = new Event(req.body)
        console.log("frontend data",req.body)
        await createEvent.save()
        return res.status(200).json({
            message: "Event created successfully!",
            event: createEvent   })
         } catch (error) {
      logger.error(`Error managing encryption keys: ${error.message}`);
        return res.status(400).send(`Internal server error : ${error.message}`)
    }
})


// Route to update events 
route.post("/update", auth, async (req, res) => {
    try {
      const { _id, name , date , category } = req.body;

      const updatedEvent = await Event.findByIdAndUpdate(_id, {name , date , category});
  
      if (!updatedEvent) {
        return res.status(404).send("Event not found.");
      }
  
      return res.status(200).send(updatedEvent);
    } catch (error) {
      logger.error(`Error managing encryption keys: ${error.message}`);
      return res.status(500).send(`Internal server error: ${error.message}`);
    }
  });
  

// Route to delete events 
route.post("/delete", auth, async (req, res) => {
    try {
      const { _id } = req.body;

      const deletedEvent = await Event.findByIdAndDelete(_id);
  
      if (!deletedEvent) {
        return res.status(400).send("Event not found.");
      }
  
      return res.status(200).send(deletedEvent);
    } catch (error) {
      logger.error(`Error managing encryption keys: ${error.message}`);
      return res.status(500).send(`Internal server error: ${error.message}`);
    }
  });


 

module.exports = route
