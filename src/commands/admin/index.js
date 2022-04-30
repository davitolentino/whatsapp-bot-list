const { messageMediaFromFilePath } = require("../../utils/messageMedia");
const { join } = require("path");
const handleRenderList = require("../../utils/renderList");
const { renderListsByGroup } = require("../user");

const notificationAllUsers = (chat) => {
  const messageMedia = messageMediaFromFilePath(
    join(__dirname, "..", "..", "..", "assets", "volei.jpg")
  );

  return chat.sendMessage("Vamos lá?", {
    mentions: chat.participants,
    media: messageMedia,
  });
};

const createListAndGroup = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    group.listLength += 1;
    group.lists.push({
      id: group.listLength,
      status: false,
      list: [{ body: msg.body.replace("!criar ", "") }],
    });
  } else {
    Groups.push({
      id: chat.id.user,
      listLength: 1,
      lists: [
        {
          id: 1,
          status: false,
          list: [{ body: msg.body.replace("!criar ", "") }],
        },
      ],
    });
  }

  handleRenderList(client, msg, group ? group : Groups[Groups.length - 1]);
};

const removeList = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    if (msg.body === "!remover all") {
      group.lists = [];

      return renderListsByGroup(client, msg, chat, Groups);
    }

    group.lists = group.lists.filter(
      (list) => list.id !== Number(msg.body.replace("!remover ", ""))
    );

    renderListsByGroup(client, msg, chat, Groups);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const openList = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const listOfGroup =
      group.lists[Number(msg.body.replace("!abrir ", "") - 1)];

    if (!listOfGroup.status) {
      listOfGroup.status = true;

      client.sendMessage(
        msg.from,
        `Lista aberta - ${listOfGroup.list[0].body}`
      );
    } else {
      client.sendMessage(msg.from, `Lista já esta aberta`);
    }
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const closeList = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const listOfGroup =
      group.lists[Number(msg.body.replace("!fechar ", "") - 1)];

    if (listOfGroup.status) {
      listOfGroup.status = false;

      client.sendMessage(
        msg.from,
        `Lista fechada - ${listOfGroup.list[0].body}`
      );
    } else {
      client.sendMessage(msg.from, `Lista já esta fechada`);
    }
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const resetList = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const listOfGroup =
      group.lists[Number(msg.body.replace("!reset ", "") - 1)];
    listOfGroup.status = true;
    listOfGroup.list = [listOfGroup.list[0]];

    handleRenderList(client, msg, group);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const populateUserVirtual = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const indexList = null;

    const listSelected =
      group.lists[indexList !== null ? indexList - 1 : group.lists.length - 1];

    if (msg.body.includes("!add ")) {
      listSelected.list.push({
        body: `${msg.body.replace("!add ", "")}`,
      });
    } else if (msg.body.includes("!del ")) {
      listSelected.list = listSelected.list.filter(
        (_, index) => index !== Number(msg.body.replace("!del ", ""))
      );
    }

    handleRenderList(client, msg, group);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const adminUseCases = (client, msg, chat, Groups, contact) => {
  if (msg.body === "!notificar") notificationAllUsers(chat);

  if (msg.body.startsWith("!criar "))
    createListAndGroup(client, msg, chat, Groups);

  if (msg.body.startsWith("!abrir ")) openList(client, msg, chat, Groups);

  if (msg.body.startsWith("!remover ")) removeList(client, msg, chat, Groups);

  if (msg.body.startsWith("!fechar ")) closeList(client, msg, chat, Groups);

  if (msg.body.startsWith("!reset ")) resetList(client, msg, chat, Groups);

  if (msg.body.startsWith("!add ") || msg.body.startsWith("!del "))
    populateUserVirtual(client, msg, chat, Groups);
};

module.exports = {
  adminUseCases,
};
