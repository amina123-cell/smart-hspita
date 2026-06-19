const connectDB = require("../../database/dbconnection");
const Admin = require("../../models/AdminModel");
const express = require("express");

const router = express.Router();

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  connectDB();

  try {
    const del = await Admin.findByIdAndDelete( id );
    if (!del) {
      return res.send("This admin is not in the database");
    }
    res.send("Admin deleted successfully");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;