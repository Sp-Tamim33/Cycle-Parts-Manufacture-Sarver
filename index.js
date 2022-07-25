const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 5000 || process.env.PORT;

// Middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ugwnw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const CycleProducts = client.db('cycledb').collection('cycleproducts');
        console.log("CycleDB Connected")

        // get Cycle Products
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = CycleProducts.find(query);
            const products = await cursor.toArray();
            res.send(products)
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