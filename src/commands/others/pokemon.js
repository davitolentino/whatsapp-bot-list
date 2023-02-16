const axios = require("axios");
const { MessageMedia } = require("whatsapp-web.js");

const Pokemon = async (text, msg, client, isShiny = false) => {
  let cmd = text.split(" ");
  let question = "";

  if (cmd.length >= 2)
    for (let i = 0; i < cmd.length; i++) {
      if (i !== 0)
        question += `${cmd[i]}${
          cmd.length > 2 && i !== cmd.length - 1 ? " " : ""
        }`;
    }

  if (cmd.length < 2)
    return msg.reply("Formatação incorreta! (!pokemon id ou nome)");

  msg.reply("Processando...");

  const response = await getPokemon(question, isShiny);

  if (!response.success) {
    const generateImg = await MessageMedia.fromUrl(response, {
      unsafeMime: true,
    });

    return client.sendMessage(msg.from, generateImg, {
      sendMediaAsSticker: true,
      stickerAuthor: "Criado por BOT",
      stickerName: "Pokemon",
    });
  }

  return msg.reply(response);
};

const getPokemon = async (text, isShiny) => {
  const result = {
    success: false,
    data: "",
    message: "",
  };

  return await axios({
    method: "get",
    url: `https://pokeapi.co/api/v2/pokemon?limit=10000`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status == 200) {
        if (!isNaN(String(text).replace(/\s/g, ""))) {
          return urlToImage(String(text).replace(/s/g, ""), isShiny);
        }

        const { results } = response.data;

        const pokemon = results?.find((pokemon) =>
          String(pokemon.name)
            .toLowerCase()
            .includes(String(text).toLowerCase())
        );

        if (!pokemon) {
          result.message = "Nenhum pokemon encontrado!";
          return result;
        } else {
          result.success = true;
          const id = pokemon.url
            .split("/pokemon/")?.[1]
            ?.replace("/", "")
            ?.replace(/s/g, "");

          return urlToImage(id, isShiny);
        }
      } else {
        result.message = "Erro na Requisição";
      }

      return result;
    })
    .catch((error) => {
      result.message = "Error : " + error.message;
      return result;
    });
};

const urlToImage = (id, isShiny = false) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork${
    isShiny ? "/shiny" : ""
  }/${id}.png`;

module.exports = {
  Pokemon,
};
