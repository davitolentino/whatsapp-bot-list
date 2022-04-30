const { Client, LocalAuth } = require("whatsapp-web.js");

const { adminUseCases } = require("./src/commands/admin");
const { userUseCases } = require("./src/commands/user");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: false },
});

client.initialize();

client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
  console.log("READY");
});

let Groups = [];

client.on("message", async (msg) => {
  if (!(await msg.getChat()).isGroup) return;

  const contact = await msg.getContact();
  contact.name = contact.name || contact.pushname || contact.shortName;

  const chat = await msg.getChat();

  const isAdmin = chat.participants.find(
    (participant) => participant.id.user === contact.id.user
  ).isAdmin;

  if (isAdmin) adminUseCases(client, msg, chat, Groups, contact);

  userUseCases(client, msg, chat, Groups, contact);
});
