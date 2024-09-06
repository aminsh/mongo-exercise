const { ObjectId } = require("mongodb")
const client = require("./client")

const execute = async () => {
  await client.connect()

  const db = client.db()

  const customers = [
    {_id: new ObjectId(), name: 'cust-1'},
    {_id: new ObjectId(), name: 'cust-2'}
  ]

  const orders = [
    {_id: new ObjectId(), customerId: customers[0]._id, number: 1000},
    {_id: new ObjectId(), customerId: customers[0]._id, number: 1001},
    {_id: new ObjectId(), customerId: customers[1]._id, number: 1002},
    {_id: new ObjectId(), customerId: customers[1]._id, number: 1003},
    {_id: new ObjectId(), customerId: customers[0]._id, number: 1004},
  ]

  
  await db.collection('customer').deleteMany({})
  await db.collection('order').deleteMany({})

  await db.collection('customer').insertMany(customers)
  await db.collection('order').insertMany(orders)

  const ordersWithCustomerNames = await db.collection('order').aggregate([
    {
      $lookup: {
        from: 'customer',
        localField: 'customerId',
        foreignField: '_id',
        as: 'cust'
      }
    },
    { $unwind: '$cust' },
    {
      $project: {
        _id: 1,
        number: 1,
        customerName: '$cust.name'
      }
    }, 
    {
      $sort: {
        count: -1,
      }
    }
  ])
    .toArray()
}

execute()