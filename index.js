const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbsccmb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    // strict: true,
    deprecationErrors: true,
  }
});

const spotCollection = client.db('touristSpots').collection('AllSpots')
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.post('/spot', async (req, res) => {
      const spot = req.body;
      const result = await spotCollection.insertOne(spot)
      res.send(result)
    })

    app.get('/spots', async (req, res) => {
      const home = req.query.home;
      const country = req.query.country;
      let result;
      if (req.query.home == 'true') {
        result = await spotCollection.find().limit(6).toArray()

      }
      else {
        let query = {}
        if (country != "null") {
          query = { countryName: country }
        }
        result = await spotCollection.find(query).toArray()

      }
      res.send(result)
    })

    app.get('/spot/details/:id', async (req, res) => {
      const id = req.params.id;
      const result = await spotCollection.findOne({ _id: new ObjectId(id) })
      res.send(result)
    })

    app.get('/spots/my/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await spotCollection.find(query).toArray()
      res.send(result)
    })

    app.patch('/spot/:id', async (req, res) => {
      const id = req.params.id;
      const updateSpot = req.body;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: updateSpot
      }
      const result = await spotCollection.updateOne(filter, updateDoc)
      res.send(result)

    })

    app.delete("/spot/:id", async (req, res) => {
      const id = req.params.id;
      const result = await spotCollection.deleteOne({ _id: new ObjectId(id) })
      res.send(result)
    })

    app.get("/countries", async (req, res) => {
      const countries = []
      const countrNameList = await spotCollection.distinct("countryName")
      const allSpots = await spotCollection.find().toArray()
      countrNameList.map(list => {
        const findCountry = allSpots.find(spot => spot.countryName == list)
        countries.push(findCountry)
      })
      res.send(countries)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("tourism-management server running")
})

app.listen(port, () => {
  console.log(`tourism-management server running on port: ${port}`)
})