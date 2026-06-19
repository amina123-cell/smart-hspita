const connectDB = require("../../database/dbconnection");
const Doctor = require("../../models/doctorModel");
const express = require("express");

const router = express.Router();

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  connectDB();

  try {
    /*const deletedDoctor = await Doctor.findOneAndDelete({ id: id });*/
    const deletedDoctor = await Doctor.findByIdAndDelete(id);


    if (!deletedDoctor) {
      return res.send("This doctor is not in the database");
    }

    res.send("Doctor deleted successfully");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;