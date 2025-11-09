const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = process.env.PORT || 3000

// middleware
app.use(cors());
app.use(express.json())
// TripWiseUser
// FeIbvw0xK5xQXEf1
const uri = "mongodb+srv://TripWiseUser:FeIbvw0xK5xQXEf1@simpleapp.suaq6bu.mongodb.net/?appName=simpleapp";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Tripwise server is running...')
})

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
      
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Tripwise server is running on port: ${port}`)
})
