export const getLocalTime = () => {
  return new Date().toLocaleTimeString();
};

export const sleep = (waitTime) => {
  if (waitTime < 1) {
    return;
  }
  const startTime = Date.now();
  while (Date.now() - startTime < waitTime);
};

export const fetchData = async (Url) => {
  // IPSFの場合URLを置換
  /*
  Url = Url.replace("ipfs://", "https://ipfs.io/ipfs/");
  console.log(getLocalTime() + " fetchData:" + Url);
  */
  try {
    const response = await fetch(Url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// アドレスが同値かどうかを判定する関数
export const isAddressesEqual = (address1: string, address2: string) => {
  return address1.toLowerCase() === address2.toLowerCase();
};

const str2unixtime = (dateString) => {
  const date = new Date(dateString);
  const unixTime = Math.floor(date.getTime() / 1000);
  return unixTime;
};

const utils = {
  sleep,
  fetchData,
  isAddressesEqual,
  generateRandomString,
  str2unixtime,
};

export default utils;
