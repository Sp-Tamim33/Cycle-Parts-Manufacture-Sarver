const express = require('express');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 5000 || process.env.PORT;

// Middleware
app.use(cors())
app.use(express.json())

function varifyJWT(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ message: "UnAuthorization Access" })
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" })
        }
        req.decoded = decoded;
        next()
    });
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ugwnw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const CycleProducts = client.db('cycledb').collection('cycleproducts');
        const productsOrder = client.db('cycledb').collection('productsorder');
        const users = client.db('cycledb').collection('users');
        const rivews = client.db('cycledb').collection('reviews');
        console.log("CycleDB Connected")

        // get Cycle Products
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = CycleProducts.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })

        // Post Cycle Products
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await CycleProducts.insertOne(product);
            res.send(result);
        })

        //get single product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await CycleProducts.findOne(query);
            res.send(product)
        })

        // Collect All orders
        app.post('/orders', async (req, res) => {
            const body = req.body;
            const orders = await productsOrder.insertOne(body);
            res.send(orders)
        })


        //get order by email
        app.get('/orders', varifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const result = await productsOrder.find(query).toArray();
                return res.send(result)
            }
            else {
                return res.status(403).send({ message: "Forbidden Access" })
            }
        })

        // delete order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsOrder.deleteOne(query);
            res.send(result)
        })


        // Create users
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true }
            const updatedDoc = {
                $set: user,
            }
            const result = await users.updateOne(filter, updatedDoc, options);
            const token = jwt.sign({ email: email }, process.env.TOKEN_SECRET, { expiresIn: '2h' })
            res.send({ result, token })
        })

        // get all users
        app.get('/users', varifyJWT, async (req, res) => {
            const user = await users.find().toArray();
            res.send(user)
        })


        // get user info 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await users.findOne(query);
            res.send(result);
        })


        // get riviews
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = rivews.find(query);
            const review = await cursor.toArray();
            res.send(review)
        })

        // send review
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await rivews.insertOne(newReview)
            res.send(result)
        })


        // create admin
        app.put('/users/admin/:email', varifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await users.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email }
                const updatedDoc = {
                    $set: { role: 'admin' },
                }
                const result = await users.updateOne(filter, updatedDoc);
                res.send(result)
            }
            else {
                res.status(403).send({ message: 'Forbidden' })
            }

        })


        // get admin 
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await users.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })



    } finally {

    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('CycleParts -- Backend Running !')
})

app.listen(port, () => {
    console.log(`CycleParts Running`)
})