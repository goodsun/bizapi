import { CONST } from "../common/const.js";
import { Message } from "../types/message.js";

const getTokenInfo = async (res) => {
  const ca = res.params.ca;
  const id = res.params.id;
  console.log("PARAMATOR" + ca + id);
  return ca + id;
};

const controller = {
  getTokenInfo,
};

export default controller;
