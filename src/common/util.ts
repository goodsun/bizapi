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
  Url = Url.replace("ipfs://", "https://ipfs.io/ipfs/");
  console.log(getLocalTime() + " fetchData:" + Url);
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

// アドレスが同値かどうかを判定する関数
export const isAddressesEqual = (address1: string, address2: string) => {
  return address1.toLowerCase() === address2.toLowerCase();
};

const utils = {
  sleep,
  fetchData,
  isAddressesEqual,
};

export default utils;
