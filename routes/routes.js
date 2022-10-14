const express = require('express');
const Model = require('../models/model');

const router = express.Router()

//Post Method
router.post('/transactions', async (req, res) => {
    const data = new Model({
        type: req.body.type,
        value: req.body.value,
        date: req.body.date,
        comment: req.body.comment,
        category: req.body.category,
        isInvestment: req.body.isInvestment
    })

    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({messvalue: error.messvalue})
    }
})

//Get all Method
router.get('/transactions', async (req, res) => {
    try{
        const data = await Model.find();
        res.json(data)
    }
    catch(error){
        res.status(500).json({messvalue: error.messvalue})
    }
})

//Get by ID Method
router.get('/getOne/:id', async (req, res) => {
    try{
        const data = await Model.findById(req.params.id);
        res.json(data)
    }
    catch(error){
        res.status(500).json({messvalue: error.messvalue})
    }
})

//Update by ID Method
router.patch('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Model.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ messvalue: error.messvalue })
    }
})

//Delete by ID Method
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Model.findByIdAndDelete(id)
        res.send(`Document with ${data.type} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ messvalue: error.messvalue })
    }
})

module.exports = router;