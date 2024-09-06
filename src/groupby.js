const { ObjectId } = require("mongodb")
const client = require("./client")

const execute = async () => {
  await client.connect()

  const db = client.db()

  /* const customers = [
    {_id: new ObjectId(), name: 'cust-1'},
    {_id: new ObjectId(), name: 'cust-2'}
  ]

  const orders = [
    {_id: new ObjectId(), customerId: customers[0]._id, number: 1000},
    {_id: new ObjectId(), customerId: customers[0]._id, number: 1001},
    {_id: new ObjectId(), customerId: customers[1]._id, number: 1002},
    {_id: new ObjectId(), customerId: customers[1]._id, number: 1003},
  ]

  
  await db.collection('customer').deleteMany({})
  await db.collection('order').deleteMany({})

  await db.collection('customer').insertMany(customers)
  await db.collection('order').insertMany(orders) */

  const groupByOrdersByCustomer = await db.collection('order').aggregate([
    {
      $group: {
        _id: '$customerId',
        count: { $count: {} }
      }
    },
    {
      $lookup: {
        from: 'customer',
        localField: '_id',
        foreignField: '_id',
        as: 'cust'
      }
    },
    { $unwind: '$cust' },
    {
      $project: {
        _id: 0,
        customerId: '$_id',
        customerName: '$cust.name',
        count: 1
      }
    }
  ])
    .toArray()

    console.log(groupByOrdersByCustomer)
}

execute()