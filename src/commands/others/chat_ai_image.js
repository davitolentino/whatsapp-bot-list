const axios = require("axios");

const { Configuration, OpenAIApi } = require("openai");
const { MessageMedia } = require("whatsapp-web.js");

const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

const ChatAIHandlerImage = async (text, msg, client) => {
  let cmd = text.split(" ");
  let question = "";

  if (cmd.length >= 2)
    for (let i = 0; i < cmd.length; i++) {
      if (i !== 0) question += `${cmd[i]} `;
    }

  if (cmd.length < 2) return msg.reply("Formatação incorreta! (!imagem texto)");
  msg.reply("Processando...");

  try {
    const response = await openai.createImage({
      prompt: question,
      n: 1,
      size: "512x512",
    });

    if (response.data.data[0].url) {
      const generateImg = await MessageMedia.fromUrl(
        response.data.data[0].url,
        {
          unsafeMime: true,
        }
      );

      client.sendMessage(msg.from, generateImg, {
        sendMediaAsSticker: true,
        stickerAuthor: "Criado por BOT",
        stickerName: "Meme",
      });
    }
  } catch (err) {
    msg.reply("Não foi possivel finalizar seu pedido. (Texto não permitido)");
  }
};

module.exports = {
  ChatAIHandlerImage,
};
