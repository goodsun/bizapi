import { CONST } from "./common/const.js";
import utils from "./common/util.js";
import { configure } from "@vendia/serverless-express";
import controller from "./controller/controller.js";
import ethController from "./controller/etherium.js";
import getDonate from "./connect/getDonate.js";
import getOwn from "./connect/getOwn.js";
import memberModel from "./model/members.js";
import express from "express";
import {
  verifyKeyMiddleware,
  InteractionType,
  InteractionResponseType,
} from "discord-interactions";
import { Client, GatewayIntentBits } from "discord.js";
let ROLE_IDS: any = {};

async function loadCustomConstants() {
  try {
    const { CUSTOM_SETTINGS } = await import("./common/customSettings.js");
    ROLE_IDS = CUSTOM_SETTINGS.roleIds;
  } catch (error) {
    ROLE_IDS = CONST.roleIds;
  }
}
loadCustomConstants();

const TOKEN = CONST.DISCORD_BOT_KEY;
const GUILD_ID = CONST.DISCORD_GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.login(TOKEN);

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

app.get("/ownlist/:eoa", async (req, res) => {
  const result = getOwn.getOwnByEoa(req.params.eoa);
  res.send(result);
});

/*
app.get("/member/:id/setTmpEoa/:eoa/:secret", async (req, res) => {
  const result = "<h1>dynamoList</h1>";
  const detail = await memberModel.memberSetEoa(
    String(req.params.id),
    String(req.params.eoa),
    String(req.params.secret)
  );
  res.send(result + detail);
});
*/

app.get("/member/:eoa", async (req, res) => {
  const detail = await memberModel.getMemberByEoa(req.params.eoa);
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

app.post(
  "/interactions",
  verifyKeyMiddleware(CONST.DISCORD_PUB_KEY),
  async (req, res) => {
    const message = req.body;
    if (message.type === InteractionType.APPLICATION_COMMAND) {
      console.log("slash command request" + JSON.stringify(message));

      //=============================================================
      if (message.data.name === "gm") {
        try {
          const guild = await client.guilds.fetch(GUILD_ID);
          const member = await guild.members.fetch(message.member.user.id);
          await member.roles.add(ROLE_IDS.SUPPORTER);
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `${message.member.user.global_name}さんGM!\n挨拶のできるあなたをSUPPORTERに任命します!`,
              flags: 64,
            },
          });
        } catch (error) {
          console.error("Error adding role:", error);
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `ロールの付与に失敗しました: ${error.message}`,
            },
          });
        }
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
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                message.member.user.global_name +
                "のアカウントを以下のウォレットアドレスに紐づけます \n EOA:" +
                eoa +
                "\n balance:" +
                balance +
                " matic" +
                "\n" +
                "\n<ご注意>:" +
                "\n登録されたウォレットアドレスに入っているトークンによりロールが付与されます。" +
                "\nウォレットアドレスを変更すると別の人とみなされますのでご注意ください" +
                "\n" +
                "\n以下のURLにアクセスし、「ひみつのあいことば」を入力して登録を完了してください。" +
                "\nURL: https://dao.goodsun.tokyo/regist/" +
                message.member.user.id +
                "\n ひみつの合言葉:" +
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

      if (message.data.name === "tool") {
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              message.member.user.global_name +
              " こちらのコマンドを受付ました。\n" +
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
      //=============================================================
    }
  }
);

if (process.env.NODE_ENV === `develop`) app.listen(80);

const server = configure({ app });
export const handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return server(event, context);
};
