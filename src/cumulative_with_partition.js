const { ObjectId } = require("mongodb")
const client = require("./client")

const execute = async () => {
  await client.connect()

  const db = client.db()

  const inventory = [
    { _id: new ObjectId(), productId: 1, order: 1, status: 'input', quantity: 10 },
    { _id: new ObjectId(), productId: 1, order: 2, status: 'output', quantity: 5 },
    { _id: new ObjectId(), productId: 1, order: 3, status: 'input', quantity: 20 },
    { _id: new ObjectId(), productId: 1, order: 4, status: 'output', quantity: 10 },
    { _id: new ObjectId(), productId: 2, order: 5, status: 'input', quantity: 8 },
    { _id: new ObjectId(), productId: 2, order: 6, status: 'output', quantity: 2 },
    { _id: new ObjectId(), productId: 2, order: 7, status: 'output', quantity: 3 },
    { _id: new ObjectId(), productId: 2, order: 8, status: 'input', quantity: 12 },
  ]

  const collection = db.collection('inventory_cumulative_with_partition')
  await collection.deleteMany({})
  await collection.insertMany(inventory)

  const result = await collection.aggregate([
    {
      $addFields: {
        signedQuantity: {
          $cond: [
            { $eq: ["$status", "output"] },
            { $multiply: ["$quantity", -1] },
            "$quantity"
          ]
        }
      }
    },
    {
      $setWindowFields: {
        partitionBy: "$productId",
        sortBy: { order: 1 },
        output: {
          balance: {
            $sum: "$signedQuantity",
            window: {
              documents: ["unbounded", "current"]
            }
          }
        }
      }
    },
    {
      $project: {
        productId: 1,
        quantity: '$signedQuantity',
        balance: 1
      }
    }
  ])
    .toArray()

  console.log(result)

}

execute()