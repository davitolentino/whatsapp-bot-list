const handleRenderList = require("../../utils/renderList");
const sortList = require("../../utils/sortList");

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
      String(msg.body).replace("MOSTRARLISTA", "").replace(" ", "") || null;

    handleRenderList(client, msg, group, index ? Number(index) : null);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
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

const aliasUserForGroup = (client, msg, chat, Groups, contact) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const splitMessage = msg.body.split(" ");

    if (splitMessage.length > 1) {
      const userExistNickname = group.nicknames.find(
        (nickname) => nickname.number === String(contact.id.user)
      );

      if (splitMessage.length > 2)
        for (let i = 2; i < splitMessage.length; i++) {
          splitMessage[1] += ` ${splitMessage[i]}`;
        }

      if (userExistNickname) {
        userExistNickname.number = String(contact.id.user);
        userExistNickname.nickname = splitMessage[1];
      } else {
        group.nicknames.push({
          number: String(contact.id.user),
          nickname: splitMessage[1],
        });
      }

      client.sendMessage(
        contact.id._serialized,
        "Apelido adicionado com sucesso!"
      );
    }
  } else {
    client.sendMessage(
      contact.id._serialized,
      "Grupo com nenhuma lista criada"
    );
  }
};

const removeUserForGroup = (client, msg, chat, Groups, contact) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const userExistNickname = group.nicknames.find(
      (nickname) => nickname.number === contact.id.user
    );

    if (userExistNickname) {
      group.nicknames = group.nicknames.filter(
        (nickname) => nickname.number !== contact.id.user
      );

      client.sendMessage(
        contact.id._serialized,
        "Apelido retirado com sucesso!"
      );
    } else {
      client.sendMessage(
        contact.id._serialized,
        "Voce não possui nenhum apelido"
      );
    }
  } else {
    client.sendMessage(
      contact.id._serialized,
      "Grupo com nenhuma lista criada"
    );
  }
};

const populateGuestVirtual = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group.id !== "5519999719079-1624281440") return true;

  if (group) {
    const indexList = null;

    const listSelected =
      group.lists[indexList !== null ? indexList - 1 : group.lists.length - 1];

    if (msg.body.includes("!convidado ")) {
      listSelected.list.push({
        body: `${msg.body.replace("!convidado ", "")} (convidado)`,
      });
    }

    listSelected.list = sortList(listSelected);

    handleRenderList(client, msg, group, null);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const userUseCases = (client, msg, chat, Groups, contact) => {
  if (msg.body === "listar") renderListsByGroup(client, msg, chat, Groups);

  if (msg.body.startsWith("!convidado "))
    populateGuestVirtual(client, msg, chat, Groups);

  const aux = msg.body;

  msg.body = String(msg.body)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  if (msg.body === "NAO VOU" || msg.body === "EU VOU") {
    msg.body = msg.body.replace(" ", "");
  }

  if (msg.body.startsWith("!APELIDO ")) {
    msg.body = aux;
    aliasUserForGroup(client, msg, chat, Groups, contact);
  }

  if (msg.body.startsWith("!REMOVERAPELIDO"))
    removeUserForGroup(client, msg, chat, Groups, contact);

  if (msg.body.startsWith("MOSTRARLISTA"))
    showListGroup(client, msg, chat, Groups);

  if (
    msg.body.startsWith("PENDENTE") &&
    chat.id.user === "5519999719079-1624281440"
  )
    return;

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
