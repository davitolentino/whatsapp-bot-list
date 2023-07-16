const handleRenderList = (client, msg, group, indexList = null) => {
  let renderList = "";

  const groupList =
    group.lists[indexList !== null ? indexList - 1 : group.lists.length - 1];

  groupList.list.map((list, index) => {
    if (
      (index === 25 && group.id !== "5519999719079-1624281440") ||
      (group.id === "5519999719079-1624281440" && index === 19)
    ) {
      renderList += `\n \n*RESERVA* \n`;
    }

    return (renderList += `${index === 0 ? "" : `\n${index} - `}${list.body} ${
      index === 0
        ? ` - ${
            group.lists[
              indexList !== null ? indexList - 1 : group.lists.length - 1
            ].status
              ? "Aberta"
              : "Fechada"
          }`
        : ""
    }`);
  });

  client.sendMessage(msg.from, renderList);

  const confirms = groupList.list.filter(
    (list) =>
      !list.body.includes("(pendente)") && !list.body.includes("(convidado -")
  );

  const pending = groupList.list.filter((list) =>
    list.body.includes("(pendente)")
  );

  const guest = groupList.list.filter((list) =>
    list.body.includes("(convidado -")
  );

  const presents = groupList.list.filter((list) => list.body.includes("✅"));

  client.sendMessage(
    msg.from,
    `Total Confirmados: ${confirms.length - 1}\nTotal Pendentes: ${
      pending.length
    }\nTotal Convidados: ${guest.length}${
      presents?.length ? `\nTotal Presentes: ${presents.length}` : ""
    }`
  );
};

module.exports = handleRenderList;
