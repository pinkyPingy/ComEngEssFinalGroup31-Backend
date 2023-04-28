const dotenv = require("dotenv");
dotenv.config();
const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  PutCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const docClient = new DynamoDBClient({ regions: process.env.AWS_REGION });
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
// exports.getGroupMembers = async (req, res) => {
//   const params = {
//     TableName: process.env.aws_group_members_table_name,
//   };
//   try {
//     const data = await docClient.send(new ScanCommand(params));
//     res.send(data.Items);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// };

// TODO #1.1: Get items from DynamoDB
exports.getItems = async (req, res) => {
  // You should change the response below.
  const params = {
    TableName: process.env.aws_items_table_name,
  };
  try {
    // res.send("This route should get all items in DynamoDB.");
    const data = await docClient.send(new ScanCommand(params));
    res.send(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

// TODO #1.2: Add an item to DynamoDB
exports.addItem = async (req, res) => {
  const item_id = uuidv4();
  // const created_date = Date.now();
  const item = { item_id: item_id, ...req.body };

  // You should change the response below.
  // res.send("This route should add an item in DynamoDB.");
  const params = {
    TableName: process.env.aws_items_table_name,
    Item: item
  };
  try {
    const data = await docClient.send(new PutCommand(params));
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

// TODO #1.3: Delete an item from DynamDB
exports.deleteItem = async (req, res) => {
  const item_id = req.params.item_id;

  // You should change the response below.
  // res.send("This route should delete an item in DynamoDB with item_id.");
  const params = {
    TableName: process.env.aws_items_table_name,
    Key: {
      item_id: item_id
    }
  };
  try {
    const data = await docClient.send(new DeleteCommand(params));
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

exports.editItem = async (req, res) => {
  const item_id = req.params.item_id;
  const updatedItem = req.body;

  const expressionAttributeValues = {};
  const expressionAttributeNames = {};
  const updateExpression = [];

  for (const [key, value] of Object.entries(updatedItem)) {
    expressionAttributeValues[`:${key}`] = value;
    expressionAttributeNames[`#${key}`] = key;
    updateExpression.push(`#${key} = :${key}`);
  }

  const params = {
    TableName: process.env.aws_items_table_name,
    Key: { item_id },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW'
  };

  try {
    const data = await docClient.send(new UpdateCommand(params));
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const { GetItemCommand } = require("@aws-sdk/client-dynamodb");

exports.getItemById = async (req, res) => {
  const item_id = req.params.item_id;

  const params = {
    TableName: process.env.aws_items_table_name,
    Key: {
      item_id: { S: item_id }
    }
  };
  try {
    const data = await docClient.send(new GetItemCommand(params));
    if (data.Item) {
      res.send(data.Item);
    } else {
      res.status(404).send("Item not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};


