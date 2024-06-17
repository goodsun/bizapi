import { CONST } from "../common/const.js";
import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
const TOKEN = CONST.DISCORD_BOT_KEY;
const GUILD_ID = CONST.DISCORD_GUILD_ID;
client.login(TOKEN);

const memberInfo = async (id) => {
  const guild = await client.guilds.fetch(GUILD_ID);
  const member = await guild.members.fetch(id);
  const roles = member.roles.cache;
  let roleList = [];
  roles.forEach((role) => {
    if (role.name != "@everyone") {
      roleList.push(role.name);
    }
  });

  const username = member.user.username;
  const globalName = member.user.tag;
  const name = member.nickname || username;
  const avatarUrl = member.user.displayAvatarURL();
  const joinedAt = member.joinedAt;

  return {
    DiscordId: member.id,
    Name: name,
    Username: username,
    Globalname: globalName,
    Roles: roleList,
    Icon: avatarUrl,
    Join: joinedAt,
  };
};
const getRoleId = async (name) => {
  const guild = await client.guilds.fetch(GUILD_ID);
  const roles = await guild.roles.fetch();
  let result = "";
  roles.forEach((role) => {
    if (role.name == name) {
      result = role.id;
    }
  });
  return result;
};

const discordConnect = {
  memberInfo,
  getRoleId,
};

export default discordConnect;
