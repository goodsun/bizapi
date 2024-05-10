import { ethers } from "ethers";
import { CONST } from "../common/const.js";
export const getAllTransfer = (ca: string, Address: string) => {
  console.log("getAllTransfer runninng");
  const getCollection = async (holderAddress: string): Promise<number[]> => {
    // アドレスが同値かどうかを判定する関数
    const isAddressesEqual = (address1: string, address2: string) => {
      return address1.toLowerCase() === address2.toLowerCase();
    };

    // 設定値： ABI(Transferイベントのみ抽出)
    const Abi = [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
    ];

    const rpc_url = CONST.RPC_URL;
    const provider = new ethers.JsonRpcProvider(rpc_url);

    console.log("2 contract:" + ca);
    // ② 　Contract インスタンスを作成する。
    const token = new ethers.Contract(ca as string, Abi, provider);

    console.log("3 送信イベント:" + holderAddress);
    // ③ 調べたいホルダーのウォレットの過去のtokenIdの送信イベントログすべて取得する。
    const sentLogs = await token.queryFilter(
      token.filters.Transfer(holderAddress, null)
    );

    console.log("4 受診イベント:" + holderAddress);
    // ④ 調べたいホルダーのウォレットの過去のtokenIdの受信イベントログすべて取得する。
    const receivedLogs = await token.queryFilter(
      token.filters.Transfer(null, holderAddress)
    );

    console.log("5");
    // ⑤ ③と④のログを結合し、EventLogを時間が古いものから順に時系列で並べる。
    const logs = sentLogs
      .concat(receivedLogs)
      .sort(
        (a, b) =>
          a.blockNumber - b.blockNumber ||
          a.transactionIndex - b.transactionIndex
      );

    // ⑥ ⑤のログを操作して、調べたいウォレットが最終的に持っている最新のtokenIdを取得する
    const owned = new Set<number>();

    for (const log of logs) {
      console.dir(log);
      /*
      if (log.args) {
        const { from, to, tokenId } = log.args;

        if (isAddressesEqual(to, holderAddress)) {
          owned.add(Number(tokenId));
        } else if (isAddressesEqual(from, holderAddress)) {
          owned.delete(Number(tokenId));
        }
      }
      */
    }

    // ⑦ Setをarrayに戻して返却
    return Array.from(owned);
  };

  // 実行
  getCollection(Address as string).then((result) => {
    console.log("一覧取得");
    console.log("result", result);
    return result;
  });
};
