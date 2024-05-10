import { CONST } from "../common/const.js";
import { getToken } from "../connect/getToken.js";
//import { getAllTransfer } from "../connect/allTransfer.js";

const getTokenInfo = async (res) => {
  const ca = res.params.ca;
  const method = res.params.method;
  let id = null;
  if (res.params.id) {
    id = res.params.id;
  }
  console.log("PARAMATOR CA:" + ca + "METHOD:" + method);
  console.log("UseChain" + CONST.RPC_URL);
  const result = await getToken(ca, method, id);
  return result;
};

const controller = {
  getTokenInfo,
};

export default controller;
