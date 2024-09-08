const { ObjectId } = require("mongodb")
const client = require("./client")

const execute = async () => {
  await client.connect()

  const db = client.db()

  const inventory = [
    { _id: new ObjectId(), order: 1, quantity: 10 },
    { _id: new ObjectId(), order: 2, quantity: -5 },
    { _id: new ObjectId(), order: 3, quantity: 20 },
    { _id: new ObjectId(), order: 4, quantity: -10 },
  ]

  const collection = db.collection('inventory_cumulative')
  /*await collection.deleteMany({})
  await collection.insertMany(inventory) */

  const result = await collection.aggregate([
    {
      $setWindowFields: {
        sortBy: { order: 1 },
        output: {
          balance: {
            $sum: '$quantity',
            window: {
              documents: ['unbounded', 'current']
            }
          }
        }
      }
    }
  ])
    .toArray()

  console.log(result)

}

execute()