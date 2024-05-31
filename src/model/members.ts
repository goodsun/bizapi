import { CRUD } from "../types/crud.js";
import { CONST } from "../common/const.js";
import utils from "../common/util.js";
import dynamoService from "../service/dynamo.js";
const TableName = CONST.DYNAMO_TABLE_PREFIX + "_member";

const memberSetSecret = async (id: String, tmpEoa: String, secret: String) => {
  const member = await getMember(id);
  let params = CRUD.update;
  params.TableName = TableName;
  params.Key.DiscordId.N = member.DiscordId.N;
  params.UpdateExpression =
    "SET Secret = :secret, Expired = :expired, TmpEoa = :tmpEoa, Updated = :updated";
  params.ExpressionAttributeValues = {
    ":secret": { S: secret } as object,
    ":tmpEoa": { S: tmpEoa } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
    ":expired": {
      S: new Date(new Date().getTime() + 10 * 60 * 1000),
    } as object,
  };
  await dynamoService.updateItem(params);

  const detail =
    "dynamo あいことば登録 " +
    id +
    // member.DiscordId.N +
    " name:" +
    //member.Name.S +
    " あいことば：" +
    secret;
  return detail;
};

const memberSetEoa = async (id: String, eoa: String, secret: String) => {
  try {
    const member = await getMember(id);
    const expired = utils.str2unixtime(member.Expired.S);
    const now = utils.str2unixtime(new Date().getTime());
    let result = "取得後結果確認";
    if (
      utils.isAddressesEqual(member.TmpEoa.S, String(eoa)) &&
      member.Secret.S == secret &&
      now < expired
    ) {
      let params = CRUD.update;
      params.TableName = TableName;
      params.Key.DiscordId.N = member.DiscordId.N;
      params.UpdateExpression = "SET Eoa = :newVal, Updated = :updated";
      params.ExpressionAttributeValues = {
        ":newVal": { S: eoa } as object,
        ":updated": { S: new Date(new Date().getTime()) } as object,
      };
      await dynamoService.updateItem(params);
      result += " 承認OK";
    } else {
      result += " 承認NG";
    }

    return result;
  } catch (error) {
    return "エラーが発生しました。";
  }
};

const getMemberList = async () => {
  let params = CRUD.query;
  params.TableName = TableName;
  const result = await dynamoService.query(params);
  return result;
};

const getAllList = async () => {
  return await dynamoService.getAllItems(TableName);
};

const getMember = async (id) => {
  let params = CRUD.read;
  params.TableName = TableName;
  params.Key.DiscordId.N = id;
  return await dynamoService.getItem(params);
};

const getMemberByEoa = async (eoa) => {
  let params = CRUD.query;
  params.TableName = TableName;
  params.KeyConditionExpression = "#PartitionName = :PartitionName";
  params.FilterExpression = "#DeleteFlag = :DeleteFlag and #Eoa = :Eoa";
  params.ExpressionAttributeNames = {
    "#PartitionName": "PartitionName",
    "#DeleteFlag": "DeleteFlag",
    "#Eoa": "Eoa",
  } as object;
  params.ExpressionAttributeValues = {
    ":PartitionName": { S: "Users" },
    ":DeleteFlag": { BOOL: false },
    ":Eoa": { S: eoa },
  } as object;
  const result = await dynamoService.query(params);
  if (result.Count == 1) {
    let user = result.Items[0];
    delete user.TmpEoa;
    delete user.Secret;
    console.dir(user);
    return user;
  } else if (result.Count == 0) {
    return { message: "member not found" };
  } else {
    return { message: "many member" };
  }
};

const getDisplayMember = async (req) => {
  const member = await getMember(req.params.id);
  let result = "<div>";
  if (member != undefined) {
    result = result + "<img src='" + member.Icon.S + "' />";
    result = result + "<br />id : " + req.params.id;
    result = result + "<br /> name : " + member.Name.S;
    result = result + "<br /> roles : " + member.Roles.SS;
    result = result + "<br /> join : " + member.Join.S;
    result = result + "<br /> exit : " + member.DeleteFlag.BOOL;
    result = result + "<br /> update : " + member.Updated.S;
    if (member.Eoa) {
      result = result + "<br /> eoa : " + member.Eoa.S;
    }
  }
  result = result + "</div>";
  return result;
};

const getDisplayData = async () => {
  const list = await getMemberList();
  if (list == undefined) {
    let params = CRUD.create;
    params.TableName = TableName;
    dynamoService.createTable(params);
    return "TABLE CREATE : " + TableName;
  } else {
    let result = "<div>";
    for (let key in list.Items) {
      const data = list.Items[key];
      result =
        result +
        key +
        " | " +
        'Id: <b><a href="/dynamo/member/' +
        data.DiscordId.N +
        '">' +
        data.DiscordId.N +
        "</a></b>" +
        " name: <b>" +
        data.Name.S +
        "</b><br />";
    }
    result = result + "</div>";
    return result;
  }
};

const memberCreate = async (member) => {
  let params = CRUD.write;
  params.TableName = TableName;
  params.Item.DiscordId.N = String(member.id);
  params.Item.Name.S = member.name;
  params.Item.Icon.S = member.icon;
  params.Item.Join.S = member.join;
  if (member.roles.length == 0) {
    params.Item.Roles.SS = [""];
  } else {
    params.Item.Roles.SS = member.roles;
  }
  await dynamoService.putItem(params);
};

const memberUpdate = async (member) => {
  let params = CRUD.write;
  params.TableName = TableName;
  params.Item.DiscordId.N = String(member.id);
  params.Item.Name.S = member.name;
  params.Item.Icon.S = member.icon;
  if (member.roles.length == 0) {
    params.Item.Roles.SS = [""];
  } else {
    params.Item.Roles.SS = member.roles;
  }
  await dynamoService.putItem(params);
};

const memberDelete = async (member) => {
  let params = CRUD.delete;
  params.TableName = TableName;
  params.Key.DiscordId.N = member.DiscordId.N;
  await dynamoService.deleteItem(params);
};

const memberSoftDelete = async (member) => {
  let params = CRUD.update;
  params.TableName = TableName;
  params.Key.DiscordId.N = member.DiscordId.N;
  params.UpdateExpression = "SET DeleteFlag = :newVal, Updated = :updated";
  params.ExpressionAttributeValues = {
    ":newVal": { BOOL: true } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
  };
  await dynamoService.updateItem(params);
};

const memberListUpdate = async (discordList, dynamoList) => {
  let addCnt = 0;
  let updateCnt = 0;
  let delCnt = 0;
  for (let key in discordList) {
    const member = discordList[key];
    const filteredItems = dynamoList.filter(
      (item) => parseInt(item.DiscordId.N) === member.id
    );
    if (filteredItems.length == 0) {
      addCnt++;
      await memberModel.memberCreate(member);
    } else {
      const dcRoles = JSON.stringify(
        member.roles.filter((role) => role !== "").sort()
      );
      const dyRoles = JSON.stringify(
        filteredItems[0].Roles.SS.filter((role) => role !== "").sort()
      );
      if (
        member.name !== filteredItems[0].Name.S ||
        member.icon !== filteredItems[0].Icon.S ||
        dcRoles !== dyRoles
      ) {
        updateCnt++;
        await memberModel.memberUpdate(member);
      }
    }
  }

  for (let key in dynamoList) {
    const member = dynamoList[key];
    if (member) {
      const filteredItems = discordList.filter(
        (item) => item.id === parseInt(member.DiscordId.N)
      );
      if (filteredItems.length == 0) {
        delCnt++;
        if (CONST.DYNAMO_SOFT_DELETE == "true") {
          await memberModel.memberSoftDelete(member);
        } else {
          await memberModel.memberDelete(member);
        }
      }
    }
  }
  console.log("dis:" + discordList.length + " dyn:" + dynamoList.length);
  console.log("add:" + addCnt + " update:" + updateCnt + " del:" + delCnt);
};

const discordId2eoa = async (discordId) => {
  const member = await getMember(discordId);
  if (member) {
    return member.Eoa.S;
  } else {
    return "0x";
  }
};

const memberModel = {
  getAllList,
  getMemberList,
  getMember,
  getMemberByEoa,
  memberCreate,
  memberUpdate,
  memberDelete,
  memberSoftDelete,
  memberListUpdate,
  getDisplayData,
  getDisplayMember,
  memberSetSecret,
  memberSetEoa,
  discordId2eoa,
};
export default memberModel;
