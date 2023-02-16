const fs = require("fs");
const mime = require("mime-types");
const { MessageMedia } = require("whatsapp-web.js");
const { ChatAIHandler } = require("./chat_ai");
const memes = require("random-memes");
const { ChatAIHandlerImage } = require("./chat_ai_image");
const { Pokemon } = require("./pokemon");

const populateList = (client, msg, chat, Groups, contact) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    if (group.lists.length === 0)
      return client.sendMessage(msg.from, "Nenhuma lista no grupo!");

    const indexList = msg.body.includes("HORAS")
      ? null
      : msg.body.split(" ")?.[1] || null;
    const listSelected =
      group.lists[indexList !== null ? indexList - 1 : group.lists.length - 1];

    let existUserIndex = listSelected.list.findIndex((list) =>
      list.body.includes(`(${contact.number})`)
    );

    if (existUserIndex === -1 && msg.body.includes("NAOVOU")) return;

    if (listSelected.status || existUserIndex !== -1) {
      if (existUserIndex === -1 && !msg.body.includes("NAOVOU")) {
        listSelected.list.push({
          body: `${contact.name} (${contact.number})${
            msg.body.includes("PENDENTE")
              ? " (pendente)"
              : msg.body.includes("HORAS ") && msg.body.split(" ")[1]
              ? ` (Horas: ${msg.body.split(" ")[1]})`
              : ""
          }`,
        });

        listSelected.list = sortList(listSelected);

        existUserIndex = listSelected.list.findIndex((list) =>
          list.body.includes(`(${contact.number})`)
        );

        if (!msg.body.includes("NAOVOU"))
          client.sendMessage(
            msg.from,
            `${contact.name}, você foi adicionada(o)/atualizada(o) na lista. Caso queira exibi-la, digite *mostrarlista*.`
          );
      } else {
        if (
          msg.body.includes("PENDENTE") &&
          listSelected.list[existUserIndex].body.includes("(pendente)")
        )
          return;

        if (
          msg.body.includes("EUVOU") &&
          !listSelected.list[existUserIndex].body.includes("(pendente)") &&
          !listSelected.list[existUserIndex].body.includes("(Horas: ")
        )
          return;

        listSelected.list[existUserIndex] = {
          body: `${contact.name} (${contact.number})${
            msg.body.includes("PENDENTE")
              ? " (pendente)"
              : msg.body.includes("HORAS ") && msg.body.split(" ")[1]
              ? ` (Horas: ${msg.body.split(" ")[1]})`
              : ""
          }`,
        };

        listSelected.list = sortList(listSelected);

        existUserIndex = listSelected.list.findIndex((list) =>
          list.body.includes(`(${contact.number})`)
        );

        if (!msg.body.includes("NAOVOU"))
          client.sendMessage(
            msg.from,
            `${contact.name}, você foi adicionada(o)/atualizada(o) na lista. Caso queira exibi-la, digite *mostrarlista*.`
          );
      }
    } else if (
      msg.body.includes("EUVOU") ||
      (msg.body.includes("PENDENTE") && existUserIndex === -1) ||
      (msg.body.includes("HORAS ") && existUserIndex === -1)
    ) {
      return client.sendMessage(
        msg.from,
        `${contact.name}, não foi possivel te adicionar. A lista está fechada. Procure um Admin`
      );
    }

    if (msg.body.includes("NAOVOU") && existUserIndex > 0) {
      listSelected.list = listSelected.list.filter(
        (_, index) => index !== existUserIndex
      );

      listSelected.list = listSelected.list.filter(
        (body) => !body?.body?.includes(`(convidado - ${contact.number})`)
      );

      client.sendMessage(msg.from, "Seu nome foi retirado da lista.");
    }

    if (
      msg.body.includes("NAOVOU") &&
      !listSelected.status &&
      existUserIndex === -1
    )
      return;

    // handleRenderList(client, msg, group, indexList);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const downloadMedia = (client, msg) => {
  // const mediaPath = join(__dirname, "..", "..", "..", "assets", "photo", "");
  const mediaPath = "./assets/photo/";

  msg.downloadMedia().then((media) => {
    if (!fs.existsSync(mediaPath)) {
      fs.mkdirSync(mediaPath);
    }

    const extension = mime.extension(media.mimetype);
    const filename = new Date().getTime();
    const fullFileName = mediaPath + filename + "." + extension;

    try {
      // if (media.mimetype !== "image/webp")
      fs.writeFileSync(fullFileName, media.data, { encoding: "base64" });

      MessageMedia.fromFilePath((filePath = fullFileName));

      if (media.mimetype !== "image/webp" && msg.body === "!FIGURINHA")
        client.sendMessage(
          msg.from,
          new MessageMedia(media.mimetype, media.data, filename),
          {
            sendMediaAsSticker: true,
            stickerAuthor: "Criado por BOT",
            stickerName: "Media",
          }
        );

      if (media.mimetype === "image/webp" || msg.body === "!FIGURINHA")
        fs.unlinkSync(fullFileName);
    } catch (err) {}
  });
};

const generateMeme = (client, msg) => {
  // memes.random().then(async (meme) => {
  //   const memeImg = await MessageMedia.fromUrl(meme.image);

  //   client.sendMessage(msg.from, memeImg, {
  //     sendMediaAsSticker: true,
  //     stickerAuthor: "Criado por BOT",
  //     stickerName: "Meme",
  //   });
  // });
  //BrazilMemes
  memes.fromReddit("br").then(async (meme) => {
    const memeImg = await MessageMedia.fromUrl(meme.image, {
      unsafeMime: true,
    });

    client.sendMessage(msg.from, memeImg, {
      sendMediaAsSticker: true,
      stickerAuthor: "Criado por BOT",
      stickerName: "Meme",
    });
  });
};

const informations = async (client, msg, chat, text) => {
  if (text === "!grupoinfo") {
    if (chat.isGroup) {
      msg.reply(
        `*Detalhes do grupo*\nID: ${chat.id.user}\nNome: ${
          chat.name
        }\nDescrição: ${
          chat.description || "Nenhuma descrição"
        }\nCriado em: ${chat.createdAt?.toString()}\nCriado por: ${
          chat.owner.user
        }\nQuantidade de participantes: ${chat?.participants.length}\n`
      );
    } else {
      msg.reply("Só é possivel usar em grupo");
    }
  } else if (msg.body === "!info") {
    let info = client.info;
    client.sendMessage(
      msg.from,
      `*Informações*\nNome: ${info.pushname}\nMeu número: ${info.me.user}\nPlataforma: ${info.platform}\nWhatsApp versão: ${info?.phone?.wa_version}\n`
    );
  }
};

const othersUseCases = async (client, msg, chat, Groups, contact) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  const text = String(msg.body).toLowerCase() || "";

  if (text.startsWith("!imagem") && group.id !== "120363021996082180")
    await ChatAIHandlerImage(text, msg, client);
  if (text.startsWith("!pergunta") && group.id !== "120363021996082180")
    await ChatAIHandler(text, msg);

  if (text.includes("!meme")) generateMeme(client, msg);

  if (text === "!grupoinfo" || text === "!info")
    informations(client, msg, chat, text);

  if (text.startsWith("!pokemon ")) await Pokemon(text, msg, client);
  if (text.startsWith("!pokemonshiny ")) await Pokemon(text, msg, client, true);

  msg.body = String(msg.body)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  if (msg.hasMedia) downloadMedia(client, msg, chat, Groups, contact);
};

module.exports = {
  othersUseCases,
};
