import { CONST } from "./common/const.js";
import utils from "./common/util.js";
import { configure } from "@vendia/serverless-express";
import controller from "./controller/controller.js";
import ethController from "./controller/etherium.js";
import getDonate from "./connect/getDonate.js";
import getOwn from "./connect/getOwn.js";
import constConnect from "./connect/const.js";
import contentsConnect from "./connect/contents.js";
import discordConnect from "./connect/discord.js";
import memberModel from "./model/members.js";
import shopModel from "./model/shops.js";
import itemModel from "./model/items.js";
import contentModel from "./model/content.js";
import express from "express";
import {
  verifyKeyMiddleware,
  InteractionType,
  InteractionResponseType,
} from "discord-interactions";

if (CONST.API_ENV == undefined) {
  console.log("SETTING ERROR");
  process.exit(1);
}
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.get("/", async (_, res) => {
  const result = "<h1>BIZBOT API ver." + CONST.VERSION + "</h1>";
  res.send(result);
});

app.get("/discord", async (_, res) => {
  const result = "<h1>discordList</h1>";
  const list = await controller.discordList();
  res.send(result + list);
});

app.get("/notion", async (_, res) => {
  const result = "<h1>notionList</h1>";
  const list = await controller.notionList();
  res.send(result + list);
});

app.get("/dynamo", async (_, res) => {
  const result = "<h1>dynamoList</h1>";
  const list = await controller.dynamoList();
  res.send(result + list);
});

app.get("/item", async (_, res) => {
  const list = await controller.itemList();
  res.send(list);
});

app.get("/item/add/:id/:ca/:num", async (req, res) => {
  await itemModel.createItem(req.params);
  const list = await controller.itemList();
  res.send(list);
});

app.get("/shop", async (_, res) => {
  const response = await controller.shopList();
  res.send(response);
});

app.get("/shop/id/:id", async (req, res) => {
  const response = await shopModel.getItem(req.params.id);
  res.send(response);
});

app.get("/shop/eoa/:eoa", async (req, res) => {
  const response = await shopModel.getItemByEoa(req.params.eoa);
  res.send(response);
});

app.post("/shop/add", async (req, res) => {
  let body = req.body;
  body.id = await shopModel.getNewId();
  console.log("post shop add body(+ newid)");
  console.dir(body);
  const result = await shopModel.createItem(body);
  res.send(body);
});

app.post("/shop/delete", async (req, res) => {
  const body = req.body;
  console.log("post shop body");
  console.dir(body);
  if (CONST.DYNAMO_SOFT_DELETE == "true") {
    await shopModel.softDeleteItem(body.id);
  } else {
    await shopModel.deleteItem(body.id);
  }
  res.send(body);
});

app.post("/shop/update/:id", async (req, res) => {
  const body = req.body;
  body.id = req.params.id;
  console.dir(body);
  const result = await shopModel.createItem(body);
  res.send(result);
});

app.get("/item", async (_, res) => {
  const response = await controller.itemList();
  res.send(response);
});

app.get("/item/id/:id", async (req, res) => {
  const response = await itemModel.getItem(req.params.id);
  res.send(response);
});

app.get("/item/eoa/:eoa", async (req, res) => {
  const response = await itemModel.getItemByEoa(req.params.eoa);
  res.send(response);
});

app.post("/item/add", async (req, res) => {
  let body = req.body;
  body.id = await itemModel.getNewId();
  const result = await itemModel.createItem(body);
  res.send(body);
});

app.post("/item/delete", async (req, res) => {
  const body = req.body;
  if (CONST.DYNAMO_SOFT_DELETE == "true") {
    await itemModel.softDeleteItem(body.id);
  } else {
    await itemModel.deleteItem(body.id);
  }
  res.send(body);
});

app.post("/item/update/:id", async (req, res) => {
  const body = req.body;
  body.id = req.params.id;
  console.dir(body);
  const result = await itemModel.createItem(body);
  res.send(result);
});

app.get("/ownlist/:eoa", async (req, res) => {
  const ownlist = await getOwn.getOwnByEoa(req.params.eoa);
  let responseMes = "";
  if (ownlist.nftList.length > 0) {
    responseMes += "NFT LIST\n";
    for (let key in ownlist.nftList) {
      console.log(ownlist.nftList[key]);
      responseMes +=
        ownlist.nftList[key][0] + ":" + ownlist.nftList[key][1] + " tokens\n";
    }
  }

  if (ownlist.nftList.length > 0) {
    responseMes += "SBT LIST\n";
    for (let key in ownlist.nftList) {
      console.log(ownlist.nftList[key]);
      responseMes +=
        ownlist.nftList[key][0] + ":" + ownlist.nftList[key][1] + " tokens\n";
    }
  }

  res.send({ message: responseMes, list: ownlist });
});

app.get("/member/:eoa", async (req, res) => {
  const detail = await memberModel.getMemberByEoa(req.params.eoa);
  res.send(detail);
});

app.get("/discord/:id", async (req, res) => {
  const detail = await memberModel.discordId2eoa(req.params.id);
  res.send(detail);
});

app.get("/dynamo/member/:id", async (req, res) => {
  const result = "<h1>dynamoList</h1>";
  const detail = await memberModel.getDisplayMember(req);
  res.send(result + detail);
});

app.get("/token/:method/:ca", async (req, res) => {
  let result = "<h1>Get Token</h1>";
  const detail = await ethController.getTokenInfo(req);
  result = result + "<p>CA:" + req.params.ca + "</p>";
  result = result + "<p>method:" + req.params.method + "</p>";
  res.send(result + detail);
});

app.get("/token/:method/:ca/:id", async (req, res) => {
  const detail = await ethController.getTokenInfo(req);
  let result = "<h1>Get Token</h1>";
  result = result + "<p>CA:" + req.params.ca + "</p>";
  result = result + "<p>ID:" + req.params.ca + "</p>";
  result = result + "<p>method:" + req.params.method + "</p>";
  res.send(result + JSON.stringify(detail));
});

app.get("/manager/:method", async (req, res) => {
  const detail = await ethController.getManager(req);
  res.send(detail);
});

app.post("/regist", async (req, res) => {
  const body = req.body;
  const result = await memberModel.memberSetEoa(
    body.discordId,
    body.eoa,
    body.secret
  );
  res.send({ message: result });
});

app.get("/tba/:cid/:rca/:aca/:ca/:id/:salt", async (req, res) => {
  const detail = await ethController.getTbaInfo(req);
  res.send(detail);
});

app.get("/own/:eoa/:ca", async (req, res) => {
  const list = await ethController.getOwnInfo(req);
  let result = "";
  for (let key in list) {
    result += list[key].tokenURI + "<br />";
  }
  res.send(result);
});

app.get("/contents", async (req, res) => {
  const detail = await contentModel.getItems("count");
  res.send(detail);
});

app.get("/contents/path", async (req, res) => {
  const detail = await contentModel.getItems("path");
  res.send(detail);
});

app.get("/contents/get/:lang", async (req, res) => {
  const detail = await contentModel.beginWithScan(req.params.lang, "count");
  res.send(detail);
});

app.get("/contents/new/:lang", async (req, res) => {
  const detail = await contentModel.beginWithScan(req.params.lang, "created");
  res.send(detail);
});

app.get("/contents/path/:lang", async (req, res) => {
  const detail = await contentModel.beginWithScan(req.params.lang, "path");
  res.send(detail);
});

app.get("/contents/get/:lang/:dir/", async (req, res) => {
  const detail = await contentModel.beginWithScan(
    req.params.lang + "/" + req.params.dir,
    "count"
  );
  res.send(detail);
});

app.get("/contents/new/:lang/:dir/", async (req, res) => {
  const detail = await contentModel.beginWithScan(
    req.params.lang + "/" + req.params.dir,
    "created"
  );
  res.send(detail);
});

app.get("/contents/path/:lang/:dir/", async (req, res) => {
  const detail = await contentModel.beginWithScan(
    req.params.lang + "/" + req.params.dir,
    "path"
  );
  res.send(detail);
});

app.get("/contents/get/:lang/:dir/:md", async (req, res) => {
  const detail = await contentsConnect.getContent(req.params);
  res.send(detail);
});

app.get("/contents/create/:title", async (req, res) => {
  const params = {
    path: "ja/common/" + req.params.title,
    title: req.params.title,
    imgurl: CONST.PROVIDER_URL + "/img/dummy.jpg",
  };
  const detail = await contentModel.createItem(params);
  res.send(detail);
});

app.get("/contents/get/:id", async (req, res) => {
  const detail = await contentModel.getItem(req.params.id);
  res.send(detail);
});

app.get("/genre", async (req, res) => {
  const detail = await constConnect.getGenre();
  res.send(detail);
});

app.get("/type", async (req, res) => {
  const detail = await constConnect.getType();
  res.send(detail);
});

app.get("/discordMember/:id", async (req, res) => {
  const member = await discordConnect.memberInfo(req.params.id);
  memberModel.memberUpdate(member);
  const role = await discordConnect.setRoleId(req.params.id, "Holder &Fan");
  res.send({ member: member, role: role });
});

app.get("/killMember/:id", async (req, res) => {
  memberModel.memberDelete(req.params.id);
  res.send({ message: "削除しました" });
});

app.post("/transrequest", async (req, res) => {
  let body = req.body;
  const hashInfo = await utils.getShortHash(body.ca + "/" + body.id);
  if (hashInfo.shortHash == body.secret) {
    const ownerDiscord = await memberModel.getMemberByEoa(body.eoa);
    const creatorDiscord = await memberModel.getMemberByEoa(hashInfo.eoa);
    let OwnerID = body.eoa;
    let CreatorID = hashInfo.eoa;
    let ChannelId = CONST.DISCORD_CHANNEL_ID;

    if (ownerDiscord.DiscordId) {
      OwnerID = "<@" + ownerDiscord.DiscordId + ">";
    }
    if (creatorDiscord.DiscordId) {
      CreatorID = "<@" + creatorDiscord.DiscordId + ">";
    }
    if (hashInfo.channelId) {
      ChannelId = hashInfo.channelId;
    }

    const message =
      CreatorID +
      " さん。\n" +
      OwnerID +
      " さんのNFT購入[ " +
      hashInfo.name +
      " ]が認証されました。\n以下のURLよりこちらのNFTを\n" +
      body.eoa +
      "\nにお送りください。\n" +
      CONST.PROVIDER_URL +
      "/donate/" +
      body.eoa +
      "/" +
      body.ca +
      "/" +
      body.id;

    await controller.sqsSend({
      function: "discord-meessage",
      params: {
        message: message,
        channelId: ChannelId,
      },
    });

    res.send({
      message: "Your request has been approved.",
      requestInfo: {
        ca: body.ca,
        id: body.id,
        name: hashInfo.name,
        image: hashInfo.image,
        owner: body.eoa,
        creator: hashInfo.eoa,
      },
    });
  }
  res.send({ message: body.eoa + "から不正なsecretが送信されました。" });
});

app.post(
  "/interactions",
  verifyKeyMiddleware(CONST.DISCORD_PUB_KEY),
  async (req, res) => {
    const message = req.body;
    if (message.type === InteractionType.APPLICATION_COMMAND) {
      console.log("slash command request" + JSON.stringify(message));

      //=============================================================
      if (message.data.name === "gm") {
        discordConnect.setRoleId(message.member.user.id, "Supporter");
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `${message.member.user.global_name}さんGM!\n挨拶のできるあなたをSUPPORTERに任命します!`,
            flags: 64,
          },
        });
      }

      if (message.data.name === "work") {
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              message.member.user.global_name +
              "\n USERID:" +
              message.member.user.id +
              "\n command:" +
              message.data.name +
              "\n value :" +
              JSON.stringify(message.data.options) +
              "\n",
            flags: 64,
          },
        });
      }
      if (message.data.name === "regist") {
        const member = await discordConnect.memberInfo(message.member.user.id);
        memberModel.memberUpdate(member);

        const secret = utils.generateRandomString(12);
        await memberModel.memberSetSecret(
          message.member.user.id,
          message.data.options[0].value,
          secret
        );
        const eoa = message.data.options[0].value;
        const isEOA = await getDonate.isEOA(eoa);
        if (isEOA) {
          const balance = await getDonate.getBalance(eoa);
          let donateBalance = await getDonate.getDonate("balance", eoa);
          if (donateBalance == undefined) {
            donateBalance = "0";
          }
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                message.member.user.global_name +
                "のアカウントを以下のウォレットアドレスに紐づけます \n EOA:" +
                eoa +
                "\n" +
                balance +
                " matic\n" +
                donateBalance +
                " donatePoint\n" +
                "\n<ご注意>:" +
                "\n登録されたウォレットアドレスに入っているトークンによりロールが付与されます。" +
                "\nウォレットアドレスを変更すると別の人とみなされますのでご注意ください" +
                "\n" +
                "\n以下のURLにアクセスし、「SECRET」を入力して登録を完了してください。" +
                "\nURL: " +
                CONST.PROVIDER_URL +
                "/regist/" +
                message.member.user.id +
                "\n SECRET:" +
                secret,
              flags: 64,
            },
          });
        } else {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "こちらのアドレスはEOAではありません。 \n EOA:" + eoa,
              flags: 64,
            },
          });
        }
      }

      if (message.data.name === "apply") {
        const eoa = await memberModel.discordId2eoa(message.member.user.id);
        const ownlist = await getOwn.getOwnByEoa(eoa);
        let responseMes = "";
        let tokenCount = 0;

        if (ownlist.nftList.length > 0) {
          responseMes = responseMes + "NFT LIST\n";
          for (let key in ownlist.nftList) {
            tokenCount++;
            responseMes =
              responseMes +
              ownlist.nftList[key][0] +
              ":" +
              ownlist.nftList[key][1] +
              " tokens\n";
          }
        }

        if (ownlist.sbtList.length > 0) {
          responseMes = responseMes + "SBT LIST\n";
          for (let key in ownlist.sbtList) {
            tokenCount++;
            responseMes =
              responseMes +
              ownlist.sbtList[key][0] +
              ":" +
              ownlist.sbtList[key][1] +
              " tokens\n";
          }
        }

        if (tokenCount > 0) {
          discordConnect.setRoleId(message.member.user.id, "Holder &Fan");
          responseMes =
            "あなたは有効なNFTの所有者です。\n" +
            "Holder & FAN ロールが付与されました。\n" +
            "あなたの持っているNFT\n" +
            responseMes;
        } else {
          responseMes = "あなたは有効なNFTを持っていません";
        }

        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: responseMes,
            flags: 64,
          },
        });
      }

      if (message.data.name === "sync") {
        if (message.member.roles.includes(CONST.DISCORD_SYNC_ROLE)) {
          let synctype = message.data.options[0].value ?? "";
          console.log("SYNC TYPE" + synctype);
          let returnmes = "";
          switch (synctype) {
            case "notion":
              await controller.sqsSend({
                function: "notion-sync",
                params: {
                  user_id: message.member.user.id,
                  user_name: message.member.user.global_name,
                },
              });
              returnmes = "メンバーをnotionに連携しました。";
              break;
            case "dynamo":
              await controller.sqsSend({
                function: "dynamo-sync",
                params: {
                  user_id: message.member.user.id,
                  user_name: message.member.user.global_name,
                },
              });
              returnmes = "メンバーをdynamoに連携しました。";
              break;
            default:
              returnmes = "指定タイプが不明です:" + synctype;
          }
          console.log(returnmes);
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: returnmes, flags: 64 },
          });
        } else {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: "syncの権限がありません。", flags: 64 },
          });
        }
      }
      if (message.data.name === "getkey") {
        const hashInfo = await utils.getShortHash(
          message.data.options[0].value
        );
        const eoa = await memberModel.discordId2eoa(message.member.user.id);
        if (hashInfo.eoa == eoa) {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                "secretkey : " +
                hashInfo.shortHash +
                "\nCreator : " +
                hashInfo.gallaryName +
                "\nNFT contract : " +
                hashInfo.contractInfo +
                " #" +
                hashInfo.pathInfo +
                "\nNFT path : " +
                hashInfo.pathInfo +
                message.data.options[0].value +
                "\nNFT name : " +
                hashInfo.name +
                "\n" +
                hashInfo.image +
                "\n" +
                message.data.options[0].value,
              flags: 64,
            },
          });
        } else {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                "NFT:" +
                hashInfo.name +
                "のsecretKeyを取得する権限がありません。",
              flags: 64,
            },
          });
        }
      }
    }
  }
);

if (process.env.NODE_ENV === `develop`) app.listen(8080);

const server = configure({ app });
export const handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return server(event, context);
};
