const express = require("express");

const cors = require("cors");
const admin = require("firebase-admin");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config()
const app = express();
const port = process.env.PORT || 3000;


const serviceAccount = require("./tripwise-firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// middleware
app.use(cors());
app.use(express.json());

const verifyFirebaseToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  console.log(token);

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("inside token", decoded);
    req.token_email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: "unauthorized access" });
  }
};
// TripWiseUser
// FeIbvw0xK5xQXEf1
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simpleapp.suaq6bu.mongodb.net/?appName=simpleapp`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Tripwise server is running...");
});

async function run() {
  try {
    // await client.connect();
    const myDB = client.db("TripWiseUser");

    const productsCollection = myDB.collection("products");
    const bookProductCollection = myDB.collection("bookProducts");

    // products get api for get all product
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // products get api for get single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    // products Post api
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });
    // products patch api
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const updateProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          vehicleName: updateProduct.vehicleName,
          owner: updateProduct.owner,
          category: updateProduct.category,
          pricePerDay: updateProduct.pricePerDay,
          location: updateProduct.location,
          availability: updateProduct.availability,
          coverImage: updateProduct.coverImage,
          userEmail: updateProduct.userEmail
        },
      };
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });
    // products Delete api
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { _id:new ObjectId( id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    // bookProducts post api
    app.post("/bookProducts", async (req, res) => {
      const newProduct = req.body;
      const result = await bookProductCollection.insertOne(newProduct);
      res.send(result);
    });
    app.get("/userProducts", verifyFirebaseToken, async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.userEmail = email;
        if (email !== req.token_email) {
          return res.status(403).send({ message: "forbidded access" });
        }
      }

      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/bookProducts", verifyFirebaseToken, async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.userEmail = email;
        if (email !== req.token_email) {
          return res.status(403).send({ message: "forbidded access" });
        }
      }

      const cursor = bookProductCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Tripwise server is running on port: ${port}`);
});
