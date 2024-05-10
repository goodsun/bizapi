import { CONST } from "../common/const.js";
import { getToken } from "../connect/getToken.js";
import { getTba } from "../connect/getTba.js";
import { manager } from "../connect/manager.js";
//import { getAllTransfer } from "../connect/allTransfer.js";

const getTokenInfo = async (res) => {
  const ca = res.params.ca;
  const method = res.params.method;
  let id = null;
  if (res.params.id) {
    id = res.params.id;
  }
  const result = await getToken(ca, method, id);
  return result;
};

const getManager = async (res) => {
  const method = res.params.method;
  const result = await manager(method);
  return result;
};
const getTbaInfo = async (res) => {
  const cid = res.params.cid;
  const regca = res.params.rca;
  const accca = res.params.aca;
  const ca = res.params.ca;
  const id = res.params.id;
  const salt = res.params.salt;
  const result = await getTba(regca, accca, cid, ca, id, salt);
  return result;
};

const ethController = {
  getTokenInfo,
  getManager,
  getTbaInfo,
};

export default ethController;
