const handleRenderList = (client, msg, group, indexList = null) => {
  let renderList = "";

  group.lists[
    indexList !== null ? indexList - 1 : group.lists.length - 1
  ].list.map(
    (list, index) =>
      (renderList += `${index === 0 ? "" : `\n${index} - `}${list.body} ${
        index === 0
          ? ` - ${
              group.lists[
                indexList !== null ? indexList - 1 : group.lists.length - 1
              ].status
                ? "Aberta"
                : "Fechada"
            }`
          : ""
      }`)
  );

  client.sendMessage(msg.from, renderList);
};

module.exports = handleRenderList;
