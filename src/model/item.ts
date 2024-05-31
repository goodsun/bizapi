import { CONST } from "../common/const.js";
import utils from "../common/util.js";
import dynamoService from "../service/dynamo.js";
const TableName = CONST.DYNAMO_TABLE_PREFIX + "_item";
const PartitionName = "Items";

const CRUD = {
  create: {
    TableName: TableName,
    Item: {
      PartitionName: { S: PartitionName },
      Id: { N: "0" },
      Token: { S: "contractAddress/#" },
      Info: {},
      DeleteFlag: { BOOL: "false" },
      Created: { S: new Date() },
      Updated: { S: new Date() },
    },
  },
  read: {
    TableName: TableName,
    Key: {
      PartitionName: { S: PartitionName },
      Id: { N: "0" },
    },
  },
  update: {
    TableName: TableName,
    Key: {
      PartitionName: { S: PartitionName },
      Id: { N: "0" },
    },
    UpdateExpression: "SET Info = :newVal",
    ExpressionAttributeValues: {},
  },
  delete: {
    TableName: TableName,
    Key: {
      PartitionName: { S: PartitionName },
      Id: { N: "0" },
    },
  },
  query: {
    TableName: TableName,
    KeyConditionExpression: "#PartitionName = :PartitionName",
    FilterExpression: "#DeleteFlag = :DeleteFlag",
    ExpressionAttributeNames: {
      "#PartitionName": "PartitionName",
      "#DeleteFlag": "DeleteFlag",
    } as object,
    ExpressionAttributeValues: {
      ":PartitionName": { S: PartitionName },
      ":DeleteFlag": { BOOL: false },
    } as object,
  },
  scan: { TableName: TableName, Limit: 1000 },
};

const createTable = async (entity) => {
  let params = CRUD.create;
  params.TableName = TableName;
  params.Item.Id.N = String(entity.id);
  await dynamoService.putItem(params);
};

const getAllItems = async () => {
  return await dynamoService.getAllItems(TableName);
};

const getItem = async (id) => {
  let params = CRUD.read;
  params.TableName = TableName;
  params.Key.Id.N = id;
  return await dynamoService.getItem(params);
};

const deleteItem = async (entity) => {
  console.log("entity 削除 " + entity.Id.N + " name:" + entity.Name.S);
  let params = CRUD.delete;
  params.TableName = TableName;
  params.Key.Id.N = entity.Id.N;
  await dynamoService.deleteItem(params);
};

const updateItem = async (id: String, Column: String, Value: String) => {
  const item = await getItem(id);
  let params = CRUD.update;
  params.TableName = TableName;
  params.Key.Id.N = item.Id.N;
  params.UpdateExpression = "SET Info = :info, Updated = :updated";
  params.ExpressionAttributeValues = {
    ":info": { S: Value } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
  } as object;
  await dynamoService.updateItem(params);
};

const softDeleteItem = async (entity) => {
  let params = CRUD.update;
  params.TableName = TableName;
  params.Key.Id.N = entity.Id.N;
  params.UpdateExpression = "SET DeleteFlag = :newVal, Updated = :updated";
  params.ExpressionAttributeValues = {
    ":newVal": { BOOL: true } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
  };
  await dynamoService.updateItem(params);
};

const query = async () => {
  let params = CRUD.query;
  params.TableName = TableName;
  const result = await dynamoService.query(params);
  return result;
};

const itemModel = {
  createTable,
  getAllItems,
  getItem,
  updateItem,
  deleteItem,
  softDeleteItem,
  query,
};
export default itemModel;
