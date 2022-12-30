const sortList = (listSelected) => {
  if (listSelected.list.length === 0) return listSelected;

  const title = listSelected.list[0].body;

  return listSelected.list.sort((a, b) => {
    if (a.body === title) {
      return 1;
    } else if (b.body === title) return 1;

    if (a.body.includes("(Horas:") && !b.body.includes("(Horas:")) return 1;
    if (!a.body.includes("(Horas:") && b.body.includes("(Horas:")) return -1;

    if (!b.body.includes("(pendente)") && !b.body.includes("convidado"))
      return 1;

    if (!a.body.includes("(pendente)") && !a.body.includes("convidado")) {
      return -1;
    }

    if (a.body.includes("(pendente)") && b.body.includes("(convidado)"))
      return -1;

    if (b.body.includes("(pendente)") || b.body.includes("convidado")) return 1;

    return 1;
  });
};

module.exports = sortList;
