const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

const { adminUseCases } = require("./src/commands/admin");
const { userUseCases } = require("./src/commands/user");
const { othersUseCases } = require("./src/commands/others");
const { join } = require("path");
const { messageMediaFromFilePath } = require("./src/utils/messageMedia");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  },
});

let isReady = false;

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("disconnected", (msg) => {
  console.error("DISCONNECTED --------------- ", msg);
});

client.on("ready", async () => {
  console.log("READY");
  isReady = true;
});

let Groups = [];
const usersAdmin = ["5519981413209", "5519999222004", "5519983184068"];

fs.readFile("./Groups.json", "utf8", (err, jsonString) => {
  if (err) {
    console.log("Error reading file from disk:", err);
    return;
  }
  try {
    Groups = JSON.parse(jsonString);
  } catch (err) {
    console.log("Error parsing JSON string:", err);
  }
});

client.on("message", async (msg) => {
  if (!(await msg.getChat()).isGroup) return;

  const contact = await msg.getContact();
  contact.name = contact.name || contact.pushname || contact.shortName;

  if (msg.body === "!ping") {
    client.sendMessage(msg.from, `O Bot está Online!`);
  }

  const chat = await msg.getChat();

  const group = Groups.find((group) => group.id === chat.id.user);

  if (!group?.permission) return console.log(chat.id);

  if (group)
    contact.name =
      group?.nicknames?.find((nickname) =>
        String(nickname.number).includes(String(contact.id.user).slice(2, 13))
      )?.nickname || contact.name;

  const isAdmin = chat.participants.find(
    (participant) => participant.id.user === contact.id.user
  ).isAdmin;

  if (isAdmin || usersAdmin.includes(contact.id.user))
    adminUseCases(client, msg, chat, Groups, contact);

  userUseCases(client, msg, chat, Groups, contact, isAdmin);
  othersUseCases(client, msg, chat, Groups, contact);

  // if (msg.hasMedia) {
  //   const mediaPath = "./assets/photo/";

  //   msg.downloadMedia().then((media) => {
  //     if (!fs.existsSync(mediaPath)) {
  //       fs.mkdirSync(mediaPath);
  //     }

  //     const extension = mime.extension(media.mimetype);
  //     const filename = new Date().getTime();
  //     const fullFileName = mediaPath + filename + "." + extension;

  //     try {
  //       if (media.mimetype !== "image/webp")
  //         fs.writeFileSync(fullFileName, media.data, { encoding: "base64" });

  //       // MessageMedia.fromFilePath((filePath = fullFileName));

  //       if (media.mimetype !== "image/webp")
  //         client.sendMessage(
  //           msg.from,
  //           new MessageMedia(media.mimetype, media.data, filename),
  //           {
  //             sendMediaAsSticker: true,
  //             stickerAuthor: "Criado por BOT",
  //             stickerName: "Media",
  //           }
  //         );

  //       if (media.mimetype !== "image/webp") fs.unlinkSync(fullFileName);
  //     } catch (err) {}
  //   });
  // }

  if (group.votacao && msg.body.startsWith("!")) {
    const votacao = group.votacao;

    const participant = votacao?.participants?.find((participant) =>
      participant?.number?.includes(contact.number)
    );

    msg.body = String(msg.body).toLowerCase();

    if (msg.body === "!resultado") {
      const segunda = votacao.participants.filter(
        (participant) => participant.voto === "segunda"
      ).length;

      const terca = votacao.participants.filter(
        (participant) => participant.voto === "terca"
      ).length;

      const quarta = votacao.participants.filter(
        (participant) => participant.voto === "quarta"
      ).length;

      const quinta = votacao.participants.filter(
        (participant) => participant.voto === "quinta"
      ).length;

      const sexta = votacao.participants.filter(
        (participant) => participant.voto === "sexta"
      ).length;

      client.sendMessage(
        msg.from,
        `*VOTOS APURADOS*\n \nSegunda: ${segunda}\nTerça:  ${terca}\nQuarta: ${quarta}\nQuinta: ${quinta}\nSexta: ${sexta}`
      );
    }

    msg.body = msg.body.replace("!", "");

    if (["segunda", "terca", "quarta", "quinta", "sexta"].includes(msg.body))
      if (participant) {
        if (participant.voto !== msg.body) {
          participant.voto = msg.body;

          client.sendMessage(msg.from, `Voto alterado!`);
        }
      } else {
        votacao?.participants.push({ number: contact.number, voto: msg.body });

        client.sendMessage(msg.from, `Voto computado com sucesso!`);
      }
  }

  fs.writeFile("./Groups.json", JSON.stringify(Groups), (err) => {
    if (err) console.log(err);
  });
});

const cron = require("node-cron");
const { format } = require("date-fns");

cron.schedule("* * * * *", async (date) => {
  try {
    if (isReady) {
      const time = format(new Date(date), "HH:mm");
      const groups = Groups.filter(
        (group) => group.permission && group.serialized && group.nocturnal
      );

      if (time === "23:00") {
        groups.map(async (group) => {
          (await client.getChatById(group.serialized)).setMessagesAdminsOnly(
            true
          );

          const messageMedia = messageMediaFromFilePath(
            join(__dirname, "assets", "noturno.jpg")
          );

          client.sendMessage(group.serialized, messageMedia, {
            sendMediaAsSticker: true,
            stickerName: "Noturno",
            stickerAuthor: "Criado por BOT",
          });

          // client.sendMessage(
          //   group.serialized,
          //   `🌒 MODO NOTURNO ATIVO (23h às 08h)`
          // );
        });
      }

      if (time === "08:00") {
        groups.map(async (group) => {
          (await client.getChatById(group.serialized)).setMessagesAdminsOnly(
            false
          );
        });
      }

      // if (
      //   true &&
      //   (isTuesday(new Date()) || isThursday(new Date())) &&
      //   time === "16:00"
      // ) {
      // }
    }
  } catch (err) {
    console.log(err);
    // console.log(err);
  }
});
