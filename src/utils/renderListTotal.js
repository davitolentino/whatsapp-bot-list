const handleRenderTotalList = (client, msg, group, indexList = null) => {
  const groupList =
    group.lists[indexList !== null ? indexList - 1 : group.lists.length - 1];

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

module.exports = handleRenderTotalList;
