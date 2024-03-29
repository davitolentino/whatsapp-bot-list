const axios = require("axios");

const ChatAIHandler = async (text, msg) => {
  let cmd = text.split(" ");
  let question = "";

  if (cmd.length >= 2)
    for (let i = 0; i < cmd.length; i++) {
      if (i !== 0) question += ` ${cmd[i]}`;
    }

  if (cmd.length < 2)
    return msg.reply("Formatação incorreta! (!pergunta sua_pergunta)");

  msg.reply("Processando... (Este processo pode demorar um pouco)");
  // const question = cmd[1];
  const response = await ChatGPTRequest(question);

  if (!response.success) {
    return msg.reply(response.message);
  }

  return msg.reply(response.data);
};

const ChatGPTRequest = async (text) => {
  const result = {
    success: false,
    data: "!",
    message: "",
  };

  return await axios({
    method: "post",
    url: "https://api.openai.com/v1/completions",
    data: {
      model: "text-davinci-003",
      prompt: text,
      max_tokens: 1000,
      temperature: 0,
    },
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Language": "in-ID",
      Authorization: `Bearer ${"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"}`,
    },
  })
    .then((response) => {
      if (response.status == 200) {
        const { choices } = response.data;

        if (choices && choices.length) {
          result.success = true;
          result.data = choices[0].text;
        }
      } else {
        result.message = "Failed response";
      }

      return result;
    })
    .catch((error) => {
      result.message = "Error : " + error.message;
      return result;
    });
};

module.exports = {
  ChatAIHandler,
};
