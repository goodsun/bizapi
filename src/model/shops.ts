import { CONST } from "../common/const.js";
import utils from "../common/util.js";
import dynamoService from "../service/dynamo.js";
const TableName = CONST.DYNAMO_TABLE_PREFIX + "_shop";
const PartitionName = "Shops";

const CRUD = {
  create: {
    TableName: TableName,
    AttributeDefinitions: [
      { AttributeName: "PartitionName", AttributeType: "S" },
      { AttributeName: "Id", AttributeType: "N" },
    ],
    KeySchema: [
      { AttributeName: "PartitionName", KeyType: "HASH" },
      { AttributeName: "Id", KeyType: "RANGE" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  write: {
    TableName: TableName,
    Item: {
      PartitionName: { S: PartitionName },
      Id: { N: "0" },
      Eoa: { S: "GallaryName" },
      Name: { S: "Hino Kawashima" },
      Imgurl: { S: "https://example.com/test.png" },
      Type: { N: "1" },
      Status: { S: "INFO" },
      Json: {
        S: '{"en":{"name":"Hino Kawashima","profile":"BizenDAO founder","workplace":"Department of Food and Nutrition professor, Toita Womens Junior College","location":"2-21-17 Shiba, Minato-ku, Tokyo","station":"Toei Subway Mita Line/Asakusa Line Mita Station"},"ja":{"name":"川嶋 比野","profile":"BizenDAO ファウンダー 食器の色と絵柄と美味しさの関係の研究・学会へ研究発表を続け、2019年にそれらの研究結果をまとめ、実践女子大学大学院にて博士(食物栄養学)の学位を取得。","workplace":"戸板女子短期大学 食物栄養学博士 教授","location":"東京都港区芝2-21-17","station":"都営地下鉄三田線・浅草線 三田駅"}}',
      },
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

const createTable = async () => {
  let params = CRUD.create;
  params.TableName = TableName;
  const result = await dynamoService.createTable(params);
  console.dir(result);
  return "TABLE CREATE : " + TableName;
};

const getAllItems = async () => {
  return await dynamoService.getAllItems(TableName);
};

const getItems = async () => {
  let params = CRUD.query;
  params.TableName = TableName;
  const result = await dynamoService.query(params);
  if (result == undefined) {
    return createTable();
  }
  return result;
};

const getItem = async (id) => {
  let params = CRUD.read;
  params.TableName = TableName;
  params.Key.Id.N = id;
  return await dynamoService.getItem(params);
};

const createItem = async (entity) => {
  let params = CRUD.write;
  params.TableName = TableName;
  params.Item.Id.N = String(entity.id);
  params.Item.Eoa.S = String(entity.eoa);
  params.Item.Name.S = String(entity.name);
  params.Item.Imgurl.S = String(entity.imgurl);
  params.Item.Type.N = String(entity.type);
  params.Item.Json.S = String(entity.json);
  console.dir(params);
  await dynamoService.putItem(params);
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

const shopModel = {
  CRUD,
  createTable,
  getAllItems,
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  softDeleteItem,
  query,
};
export default shopModel;
