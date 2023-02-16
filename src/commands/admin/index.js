const { messageMediaFromFilePath } = require("../../utils/messageMedia");
const { join } = require("path");
const handleRenderList = require("../../utils/renderList");
const handleRenderTotalList = require("../../utils/renderListTotal");
const { renderListsByGroup } = require("../user");
const sortList = require("../../utils/sortList");

const notificationAllUsers = (chat) => {
  const messageMedia = messageMediaFromFilePath(
    join(__dirname, "..", "..", "..", "assets", "volei.jpg")
  );

  return chat.sendMessage(
    `Vamos lá?
    \nDigite *euvou* para colocar o nome na lista
    \nDigite *naovou* para retirar o nome da lista
    \nDigite *pendente* para que talvez vá jogar
    \nDigite *horas xx:xx* para se referir a hora que vai poder ir
    `,
    {
      mentions: chat.participants,
      media: messageMedia,
    }
  );
};

const notificationGroupUsers = (chat, Groups, msg) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group.lists.length === 0)
    return chat.sendMessage("Grupo com nenhuma lista criada");

  const messageMedia = messageMediaFromFilePath(
    join(__dirname, "..", "..", "..", "assets", "volei.jpg")
  );

  const participants = [];

  chat.participants.map((participant) => {
    group.lists[0].list.map((list) => {
      if (list.body.includes(participant.id.user)) {
        participants.push(participant);
      }
    });
  });

  return chat.sendMessage(String(msg.body).replace("!notificarlista ", ""), {
    mentions: chat.participants,
    // media: messageMedia,
  });
};

const createListAndGroup = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group && group.lists.length !== 0)
    return client.sendMessage(msg.from, "Grupo já possui uma lista");

  if (group) {
    group.listLength += 1;
    group.lists.push({
      id: group.listLength,
      status: true,
      list: [{ body: msg.body.replace("!criar ", "") }],
    });

    if (group.id === "120363021996082180")
      group.lists[0].list.push({ body: "David (5519981413209)" });

    if (group.id === "120363042517201636" || group.id === "120363021996082180")
      group.lists[0].list.push({ body: "Michael 🏐🐾 (5519999222004)" });

    if (group.id === "5519999719079-1624281440") {
      group.lists[0].list.push({ body: "Paulo Miloch (5519989048383)" });
      group.lists[0].list.push({ body: "Welington Nunes (5519998060681)" });
    }
  } else {
    Groups.push({
      id: chat.id.user,
      id: chat.id._serialized,
      listLength: 1,
      nicknames: [],
      created_at: new Date().toISOString(),
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

const editListAndGroup = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group && group.lists.length === 0)
    return client.sendMessage(msg.from, "Grupo não possui uma lista");

  if (group) {
    group.lists[0].list[0].body = String(
      msg.body?.replace("!editar ", "")
    )?.replace("!alterar ", "");
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
    group.lists = [];
    if (group.lists.length === 0)
      return client.sendMessage(msg.from, `Lista removida`);

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

const populatePresent = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const indexList = null;

    const listSelected =
      group.lists[indexList !== null ? indexList - 1 : group.lists.length - 1];

    const numbers = String(msg.body.replace("!presente ", "")).split(";");

    if (!listSelected) return;

    for (let number of numbers) {
      const index = Number(number);

      if (index > 0) {
        const userSelected = listSelected.list[index];

        if (userSelected) {
          if (!userSelected.body.includes("✅")) {
            userSelected.body = `${userSelected.body} ✅`;
          } else {
            userSelected.body = userSelected.body.replace(" ✅", "");
          }
        }
      }
    }
    handleRenderList(client, msg, group);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const kawarimiUser = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const indexList = null;

    const listSelected =
      group.lists[indexList !== null ? indexList - 1 : group.lists.length - 1];

    const numbers = String(msg.body.replace("!substituir ", "")).split(";");

    if (!listSelected && numbers.length !== 2) return;

    const numberOne = Number(numbers[0]);
    const numberTwo = Number(numbers[1]);

    if (numberOne > 0 && numberTwo > 0) {
      const userOne = listSelected.list[numberOne];
      const userTwo = listSelected.list[numberTwo];

      listSelected.list[numberOne] = userTwo;
      listSelected.list[numberTwo] = userOne;
    }

    handleRenderList(client, msg, group);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const sortPlayers = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const listSelected = group.lists[0];

    const presents = listSelected.list.filter((list) =>
      list.body.includes("✅")
    );

    const participants = [];

    if (presents.length >= 12) {
      const users = ["19981413209", "19983184068", "19999222004"];

      const usersPresent = presents.filter((present) =>
        users.some((user) => present.body.includes(user))
      );

      if (usersPresent.length) {
        usersPresent
          .sort(() => (Math.round(Math.random() * 100) > 70 ? -1 : 1))
          .map((present) =>
            participants.push({
              ...present,
              index: presents.findIndex((presentList) =>
                presentList.body.includes(present.body)
              ),
            })
          );
      }

      while (participants.length < 12) {
        const index = Math.floor(Math.random() * presents.length);

        if (!participants.find((participant) => participant?.index === index)) {
          participants.push({ ...presents[index], index });
        }
      }

      let message = "";

      participants.map(
        (participant, index) =>
          (message += `${index === 0 ? "*TIME 1* \n \n" : ""}${
            index === 6 ? "\n*TIME 2* \n \n" : ""
          }${participant.body} \n`)
      );

      return client.sendMessage(msg.from, message);
    } else {
      return client.sendMessage(
        msg.from,
        "Quantidade de pessoas insuficientes"
      );
    }
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

      listSelected.list = sortList(listSelected);
      client.sendMessage(msg.from, "Nome adicionado com sucesso");
    } else if (msg.body.includes("!del ")) {
      listSelected.list = listSelected.list.filter(
        (_, index) => index !== Number(msg.body.replace("!del ", ""))
      );
      client.sendMessage(msg.from, "Nome retirado com sucesso");
    }

    // handleRenderList(client, msg, group);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const aliasUserForGroup = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const splitMessage = msg.body.split(" ");

    if (splitMessage.length > 2) {
      if (splitMessage[1].length !== 13)
        return client.sendMessage(
          msg.from,
          "Adicione um numero de 13 digitos! Utilizar o 55"
        );

      const userExistNickname = group.nicknames.find(
        (nickname) => nickname.number === splitMessage[1]
      );

      if (splitMessage.length > 3)
        for (let i = 3; i < splitMessage.length; i++) {
          splitMessage[2] += ` ${splitMessage[i]}`;
        }

      if (userExistNickname) {
        userExistNickname.number = splitMessage[1];
        userExistNickname.nickname = splitMessage[2];
      } else {
        group.nicknames.push({
          number: splitMessage[1],
          nickname: splitMessage[2],
        });
      }

      client.sendMessage(msg.from, "Apelido adicionado com sucesso!");
    }
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const removeUserForGroup = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    const splitMessage = msg.body.split(" ");

    if (splitMessage.length === 2) {
      const userExistNickname = group.nicknames.find(
        (nickname) => nickname.number === splitMessage[1]
      );

      if (userExistNickname) {
        group.nicknames = group.nicknames.filter(
          (nickname) => nickname.number !== splitMessage[1]
        );

        client.sendMessage(msg.from, "Apelido retirado com sucesso!");
      } else {
        client.sendMessage(msg.from, "Numero não encontrado");
      }
    }
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const setModeNocturnal = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    if (group?.nocturnal) {
      group.nocturnal = false;
      client.sendMessage(msg.from, "MODO NOTURNO DESATIVADO!");
    } else {
      group.nocturnal = true;
      client.sendMessage(msg.from, "MODO NOTURNO ATIVADO!");
    }
  } else {
    client.sendMessage(
      msg.from,
      "Grupo sem registro, crie uma lista para utilizar as funções do BOT"
    );
  }
};

const sendCommandsForUser = (client, contact) => {
  client.sendMessage(
    contact.id._serialized,
    `\n*Usuario:*
     \nDigite *mostrarlista* para visualizar uma lista de presença
     \nDigite *euvou* para colocar seu nome na lista como *presente*
     \nDigite *naovou* para remover seu nome da lista
     \nDigite *pendente* para definir como talvez vá
     \nDigite *horas 00h00* para entrar na lista, porem com uma hora estipulada
     \nDigite *!convidado NOME* caso queira convidar alguém, coloque o nome do convidado na frente do comando
     \nDigite *!apelido xxxxxxxxxx* defina um apelido para você ser identificado na lista
     \nDigite *!removerapelido xxxxxxxxxxx* para remover seu apelido
     \n*ADMIN:*
     \nDigite *!criar x* para criar uma lista
     \nDigite *!fechar* para fechar a lista
     \nDigite *!add x* para adicionar na lista, coloque o nome da pessoa no lugar do x
     \nDigite *!del x* para remover da lista, passando o nome da pessoa no lugar do x
     \nDigite *!notificar* para notificar todos os participantes do grupo
     \nDigite *!notificarlista* para notificar todos os participantes da lista atual
     \nDigite *!substituir 12;20* substitui o usuário do ID 12 com o usuário do ID 20
     \nDigite *!presente 1;5;7;10* da presença para os usuários com número 1,5,7 e 10. Para remover a presença, basta "dar presença" novamente.
     \nDigite *!sortear* sorteia dois times para jogar. Funcional apenas quando tiver pelo menos 12 pessoas com presença.
     \nDigite *!apelidoadmin 551900000000 xxxxxxxx* defina um apelido para o usuario de numero 551900000000, onde xxxxxxxx eh o apelido que deseja associar.
     \nDigite *!removerapelidoadmin 551900000000* remove o apelido para o usuario de numero 551900000000
     \nDigite *!noturno* habilita ou desabilita o modo noturno (somente admin enviar mensagem das 23h00 às 08h00)
  `
  );
};

const populateGuestVirtual = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group.id === "5519999719079-1624281440") return true;

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

const showTotalOfList = (client, msg, chat, Groups) => {
  const group = Groups.find((group) => group.id === chat.id.user);

  if (group) {
    if (group.lists.length === 0)
      return client.sendMessage(msg.from, "Nenhuma lista no grupo!");

    handleRenderTotalList(client, msg, group, null);
  } else {
    client.sendMessage(msg.from, "Grupo com nenhuma lista criada");
  }
};

const adminUseCases = (client, msg, chat, Groups, contact) => {
  if (msg.body === "!notificar") notificationAllUsers(chat);

  // if (msg.body.startsWith("!convidado "))
  //   populateGuestVirtual(client, msg, chat, Groups);

  if (msg.body.startsWith("!notificarlista "))
    notificationGroupUsers(chat, Groups, msg);

  if (msg.body.startsWith("!noturno") || msg.body.startsWith("!Noturno"))
    setModeNocturnal(client, msg, chat, Groups);

  if (msg.body.startsWith("!apelidoadmin "))
    aliasUserForGroup(client, msg, chat, Groups);

  if (msg.body.startsWith("!removerapelidoadmin "))
    removeUserForGroup(client, msg, chat, Groups);

  if (msg.body.startsWith("!criar "))
    createListAndGroup(client, msg, chat, Groups);

  if (msg.body.startsWith("!editar ") || msg.body.startsWith("!alterar "))
    editListAndGroup(client, msg, chat, Groups);

  if (msg.body.startsWith("!abrir")) openList(client, msg, chat, Groups);

  if (msg.body.startsWith("!remover ")) removeList(client, msg, chat, Groups);

  if (msg.body.startsWith("!fechar")) closeList(client, msg, chat, Groups);

  if (msg.body.startsWith("!reset ")) resetList(client, msg, chat, Groups);

  if (msg.body.startsWith("!add ") || msg.body.startsWith("!del "))
    populateUserVirtual(client, msg, chat, Groups);

  if (msg.body.startsWith("!presente "))
    populatePresent(client, msg, chat, Groups);

  if (msg.body.startsWith("!substituir "))
    kawarimiUser(client, msg, chat, Groups);

  if (msg.body.startsWith("!sortear")) sortPlayers(client, msg, chat, Groups);

  if (msg.body === "!comandos") sendCommandsForUser(client, contact);

  if (msg.body === "!total") showTotalOfList(client, msg, chat, Groups);
};

module.exports = {
  adminUseCases,
};
