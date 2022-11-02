const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Category = require('../models/Category');

const router = express.Router()

// User authentication
router.post('/auth/register', async (req, res) => {
    const { username, email, password, confirmpassword } = req.body;

    // Validations
    if (!username) { return res.status(422).json({ msg: "Missing username" }) }
    if (!email) { return res.status(422).json({ msg: "Missing email" }) }
    if (!password) { return res.status(422).json({ msg: "Missing password" }) }
    if (password !== confirmpassword) { return res.status(422).json({ msg: "passwords don't match" }) }

    const userExists = await User.findOne({ email: email });

    if (userExists) { return res.status(422).json({ msg: "Email already in use" }) }

    // Create Password
    const salt = await bcrypt.genSalt(12);
    const passHashed = await bcrypt.hash(password, salt);

    // Create User
    const user = new User({
        username,
        email,
        password: passHashed
    })

    try {
        const createdUser = await user.save();
        const secret = process.env.SECRET;
        const token = jwt.sign(
            { id: createdUser.id },
            secret,
        )
        res.status(201).json({ msg: "User created", userID: createdUser.id, token })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Server Error' })
    }

})

// User login
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Validations
    if (!email) { return res.status(422).json({ msg: "Missing email" }) }
    if (!password) { return res.status(422).json({ msg: "Missing password" }) }

    const user = await User.findOne({ email: email });
    if (!user) { return res.status(422).json({ msg: "Email not found" }) }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) { return res.status(422).json({ msg: "Wrong password" }) }

    try {
        const secret = process.env.SECRET;
        const token = jwt.sign(
            { id: user.id },
            secret,
        )

        res.status(200).json({ msg: "Authentication succeeded.", id: user.id, token })
    } catch (error) {
        console.log(error);

        res.status(500).json({ msg: "Server error. Try again later." })
    }
})

// Private Route
router.get("/testAPI", async (req, res) => {

    res.status(200).json({ msg: "Testing API" })
});

// Private Route
router.get("/user/:id", checkToken, async (req, res) => {
    const id = req.params.id;

    // Check if user exists
    const user = await User.findById(id, '-password');
    if (!user) { return res.status(404).json({ msg: "User not found" }) }

    res.status(200).json(user)
});

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) { return res.status(401).json({ msg: "Access denied" }) }

    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret);

        next();

    } catch (error) {
        res.status(400).json({ msg: "Invalid Token" })
    }
}

//Get homepage
router.get('/', async (req, res) => {
    try {
        res.json({ msg: 'É isso' })
    }
    catch (error) {
        res.status(500).json({ messvalue: error.messvalue })
    }
})

//Get by ID Method
router.get('/getOne/:id', async (req, res) => {
    try {
        const data = await Transaction.findById(req.params.id);
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ messvalue: error.messvalue })
    }
})

//Update by ID Method
router.patch('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Transaction.findByIdAndUpdate(
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
        const data = await Transaction.findByIdAndDelete(id)
        res.send(`Document with ${data.type} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ messvalue: error.messvalue })
    }
})

// Transaction Routes ===========================================================================================
router.get('/transactions/all/:id', checkToken, async (req, res) => {
    try {
        const data = await Transaction.find({ userID: req.params.id })
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ messvalue: error.messvalue })
    }
})

router.post('/transactions', checkToken, async (req, res) => {
    const [day, month, year] = req.body.date.split("/");
    const data = new Transaction({
        type: req.body.type,
        value: req.body.value,
        date: `${month}/${day}/${year}`,
        comment: req.body.comment,
        category: req.body.category,
        isInvestment: req.body.isInvestment,
        userID: req.body.userID
    })

    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ messvalue: error.messvalue })
    }
})

// Category Routes ===========================================================================================
router.get("/categories/all/:id", checkToken, async (req, res) => {

    // Check if user has categories
    const categories = await Category.find({ userID: req.params.id });
    if (!categories) { return res.status(404).json({ msg: "No category for this user" }) }

    res.status(200).json(categories)
});

router.get("/categories/:id", checkToken, async (req, res) => {
    const catID = req.params.id;

    // Check if category exists
    const categories = await Category.findById(catID, '-password');
    if (!categories) { return res.status(404).json({ msg: "No category found" }) }

    res.status(200).json(categories)
});

router.post("/categories", checkToken, async (req, res) => {
    const alreadyExist = await Category.findOne({ name: req.body.name, userID: req.body.userID });
    if (alreadyExist) { return res.status(422).json({ msg: "Category already exists." }) }

    const data = new Category({
        color: req.body.color,
        name: req.body.name,
        userID: req.body.userID
    })

    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({ messvalue: error.messvalue })
    }
});

router.patch("/categories/:name", checkToken, async (req, res) => {
    const alreadyExist = await Category.findOne({ name: req.params.name, userID: req.body.userID });
    if (!alreadyExist) { return res.status(422).json({ msg: "Category not found" }) }

    try {
        const id = alreadyExist.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Category.findByIdAndUpdate(
            id, updatedData, options
        )

        res.status(200).json({ msg: result })
    }
    catch (error) {
        res.status(400).json({ messvalue: error.messvalue })
    }
});

router.delete("/categories/:id", checkToken, async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Category.findByIdAndDelete(id);
        const alreadyExist = await Transaction.findOne({ name: req.body.name, userID: req.body.userID });
        if (alreadyExist) {
            res.json({ msg: "There is at least one transaction using this category" });
        } else {
            res.status(200).json({ msg: `Category ${data.name} has been deleted.` });
        }
    }
    catch (error) {
        res.status(400).json({ messvalue: error.messvalue })
    }
});

module.exports = router;