import { CONST } from "./common/const.js";
import { configure } from "@vendia/serverless-express";
import controller from "./controller/controller.js";
import ethController from "./controller/etherium.js";
import memberModel from "./model/members.js";
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

app.get("/member/:id", async (req, res) => {
  const result = "<h1>dynamoList</h1>";
  const detail = await memberModel.getDisplayMember(req);
  res.send(result + detail);
});

app.get("/gettoken/:method/:ca", async (req, res) => {
  let result = "<h1>Get Token</h1>";
  const detail = await ethController.getTokenInfo(req);
  result = result + "<p>CA:" + req.params.ca + "</p>";
  result = result + "<p>MD:" + req.params.method + "</p>";
  res.send(result + detail);
});

app.get("/gettoken/:method/:ca/:id", async (req, res) => {
  const detail = await ethController.getTokenInfo(req);
  res.send(detail);
});

app.get("/manager/:method", async (req, res) => {
  const detail = await ethController.getManager(req);
  res.send(detail);
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
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: message.member.user.global_name + "さん。gm!\n",
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
          },
        });
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
              returnmes = "指定タイプが不明です";
          }
          console.log(returnmes);
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: returnmes },
          });
        } else {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: "syncの権限がありません。" },
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
