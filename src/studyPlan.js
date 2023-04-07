var port = chrome.runtime.connect({ name: "study-plan" });

function gradeToColor(grade, isExam) {
  if (isExam) {
    if (grade < 3) return "#c23e3e"; // red
    if (grade < 4) return "#e69335"; // orange
    if (grade < 5) return "#72e078"; // green
    return "#729ee0"; // blue
  } else {
    if (grade < 3) return "#c23e3e"; // red
    return "#729ee0"; // blue
  }
}

const items = chrome.runtime.sendMessage({
  action: "get_all_journal_data",
});

port.onDisconnect.addListener(function () {
  console.log("disconnected");
});

port.onMessage.addListener(function (msg) {
  if (msg.action === "table_update") {
    const items = msg.items;
    const table = document.getElementById("gvStudyPlan_DXMainTable");
    const rows = table.querySelectorAll('[id^="gvStudyPlan_DXDataRow"]');
    rows.forEach((row) => {
      const n = Number(row.id.replace("gvStudyPlan_DXDataRow", ""));
      const journal_id = `gvStudyPlan_tccell${n}_3`;
      const journal = row.querySelector(`#${journal_id}`);
      const name = row.querySelector(`#gvStudyPlan_tccell${n}_2 > a`).innerHTML;
      if (journal.innerHTML !== "") {
        const journal_url = journal.querySelector("a").href;
        const key = journal_url.replace("https://studlk.susu.ru/", "");
        // grade, exam, max, your, procent,
        const { grade, exam, max, your, procent } = items[key];
        console.log(name, grade, exam);
        if (grade) {
          const color_cell = row.querySelector(`.dxgvIndentCell`);
          const kekisMeter = (n) => {
            if (n == 2) return "лох";
            if (n == 3) return "жижа";
            if (n == 4) return "норм";
            if (n == 5) return "задр";
            return "кекис";
          };
          color_cell.innerHTML = `${procent}%\n${grade}(${kekisMeter(grade)})`;
          // const color = gradeToColor(grade, exam);
          // color_cell.style.backgroundColor = color;
          // color_cell.style.color = "white";
        } else {
          console.log("#d2d2d2");
        }
      }
    });
  }
});
