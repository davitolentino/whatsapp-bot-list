const handleRenderList = require("../../utils/renderList");

const renderListsByGroup = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    if (group.lists.length === 0)
      return client.sendMessage(msg.from, "Nenhuma lista no grupo!");

    group.lists.map((list) => {
      client.sendMessage(
        msg.from,
        `${list.id} - ${list.list[0].body} (${
          list.status ? "Lista Aberta" : "Lista Fechada"
        })`
      );
      return list;
    });
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const showListGroup = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    if (group.lists.length === 0)
      return client.sendMessage(msg.from, "Nenhuma lista no grupo!");

    const index =
      String(msg.body).replace("mostrarlista", "").replace(" ", "") || null;

    handleRenderList(client, msg, group, index ? Number(index) : null);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const sendCommandsForUser = (client, contact) => {
  client.sendMessage(contact.id._serialized, "message");
};

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

    const existUserIndex = listSelected.list.findIndex((list) =>
      list.body.includes(`(${contact.number})`)
    );

    if (listSelected.status || existUserIndex !== -1) {
      if (existUserIndex === -1) {
        listSelected.list.push({
          body: `${contact.name} (${contact.number})${
            msg.body.includes("PENDENTE")
              ? " (pendente)"
              : msg.body.includes("HORAS ") && msg.body.split(" ")[1]
              ? ` (Horas: ${msg.body.split(" ")[1]})`
              : ""
          }`,
        });
      } else {
        if (
          msg.body.includes("PENDENTE") &&
          listSelected.list[existUserIndex].body.includes("(pendente)")
        )
          return;

        if (
          msg.body.includes("HORAS") &&
          listSelected.list[existUserIndex].body.includes("(Horas: ")
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
      listSelected.list.splice(existUserIndex, 1);
    }

    if (
      msg.body.includes("NAOVOU") &&
      !listSelected.status &&
      existUserIndex === -1
    )
      return;

    handleRenderList(client, msg, group, indexList);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const userUseCases = (client, msg, chat, Groups, contact) => {
  if (msg.body === "listar") renderListsByGroup(client, msg, chat, Groups);

  if (msg.body === "comandos") sendCommandsForUser(client, contact);

  if (msg.body.startsWith("mostrarlista"))
    showListGroup(client, msg, chat, Groups);

  msg.body = String(msg.body)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  if (
    msg.body.startsWith("NAOVOU") ||
    msg.body.startsWith("EUVOU") ||
    msg.body.startsWith("PENDENTE") ||
    msg.body.startsWith("HORAS ")
  )
    populateList(client, msg, chat, Groups, contact);

  //   if (msg.body.startsWith("EUVOU"))
  //     populateList(client, msg, chat, Groups, contact);

  //   if ()
  //     populateList(client, msg, chat, Groups, contact);
};

module.exports = {
  userUseCases,
  renderListsByGroup,
};
