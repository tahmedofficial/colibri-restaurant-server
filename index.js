const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.ufkobjs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // Database Collection
        const database = client.db("foodDB");
        const foodCollection = database.collection("food");
        const orderCollection = database.collection("order");

        // Food related apis
        app.get("/food", async (req, res) => {
            const cursor = foodCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/searchedFood", async (req, res) => {
            const fooditem = req.query.foodItem;
            let query = { foodName: fooditem };
            const result = await foodCollection.find(query).toArray();
            res.send(result)
        })

        app.get("/food/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodCollection.findOne(query);
            res.send(result);
        })

        app.get("/myFood/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await foodCollection.find(query).toArray();
            res.send(result);
        })

        app.post("/food", async (req, res) => {
            const data = req.body;
            const result = await foodCollection.insertOne(data)
            res.send(result)
        })

        app.put("/food/:id", async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateData = {
                $set: {
                    image: updateInfo.image,
                    foodName: updateInfo.foodName,
                    price: updateInfo.price,
                    madeBy: updateInfo.madeBy,
                    foodCategory: updateInfo.foodCategory,
                    description: updateInfo.description,
                    foodOrigin: updateInfo.foodOrigin,
                    quantity: updateInfo.quantity,
                }
            }
            const result = await foodCollection.updateOne(filter, updateData, options);
            res.send(result);
        })

        // Ordered related api

        app.get("/foodOrder/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await orderCollection.find(query).toArray();
            res.send(result);
        })

        app.post("/foodOrder", async (req, res) => {
            const data = req.body;
            const result = await orderCollection.insertOne(data);
            res.send(result);
        })

        app.put("/countOrder/:id", async (req, res) => {
            const count = req.body;
            const id = req.params.id;
            const totalcount = parseInt(count.totalOrders) + 1;
            const totalCountStr = JSON.stringify(totalcount);
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateinfo = {
                $set: {
                    totalOrders: totalCountStr
                }
            }
            const result = await foodCollection.updateOne(query, updateinfo, options);
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Colibri server is running")
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})