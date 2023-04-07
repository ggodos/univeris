const BOUND_3 = 59.5;
const BOUND_4 = 74.5;
const BOUND_5 = 84.5;

const round = (n) => Math.round(n * 100) / 100;

function calculateGrade(procent) {
  let grade = 2;
  if (procent > BOUND_3) grade = 3;
  if (procent > BOUND_4) grade = 4;
  if (procent > BOUND_5) grade = 5;
  return grade;
}

const formatPoints = (grade, bound, your, max) => {
  let points = (max * bound) / 100 - your;
  return `До ${grade} нужно: ${round(points)} баллов`;
};

function getGradeInfo(answer) {
  const { grade, exam, max, your } = answer;
  const result = [];
  if (!exam) {
    if (grade < 3) {
      result.push(`Оценка: не зачтено`);
      result.push(formatPoints("зачёта", BOUND_3, your, max));
    } else {
      result.push(`Оценка: зачтено`);
    }
  } else {
    result.push(`Твоя оценка: ${grade}`);
    if (grade < 3) {
      result.push(formatPoints(3, BOUND_3, your, max));
    }
    if (grade < 4) {
      result.push(formatPoints(4, BOUND_4, your, max));
    }
    if (grade < 5) {
      result.push(formatPoints(5, BOUND_5, your, max));
    }
  }
  return result;
}

function showResult(res, grade) {
  const { max, your, procent } = res;
  const gradeInfo = getGradeInfo({ ...res, grade });

  let result = [
    `Твои баллы: ${your}`,
    `Всего баллов: ${max}`,
    `Процент: ${round(procent)}%`,
    ...gradeInfo,
  ];

  alert(result.join("\n"));
}

const buttonContainer = document.getElementById("pcJournals_TC");
buttonContainer.insertAdjacentHTML(
  "afterbegin",
  '<button id="points-button" type="button">Посчитать баллы</button>'
);
const pointsButton = buttonContainer.childNodes[0];
pointsButton.disabled = true;
pointsButton.addEventListener("click", () => {
  const pointsTable = document.getElementById(
    "MarkJournalPivotGrid_DCSCell_SCDTable"
  );

  const [maxPointsRow, yourPointsRow] =
    pointsTable.querySelectorAll("tbody > tr");

  const maxPointsArray = Array.from(maxPointsRow.querySelectorAll("td"))
    .map((item) => item.innerText)
    .filter((item) => item !== "")
    .map((item) => {
      const [eduPoint, univerisPoint] = item.split("/");
      return [
        Number(eduPoint),
        univerisPoint ? Number(univerisPoint.replace(",", ".")) : null,
      ];
    });

  const yourPointsArray = Array.from(yourPointsRow.querySelectorAll("td"))
    .map((item) => item.innerText)
    .filter((item) => item !== "");

  const sum = {
    max: 0,
    your: 0,
  };
  const points = {
    max: [],
    your: [],
  };

  maxPointsArray.forEach((item, index) => {
    const [_eduPoint, univerisPoint] = item;
    if (!univerisPoint) {
      return;
    }

    sum.max += univerisPoint;
    points.max.push(univerisPoint);

    // соответствующий процент
    const yourProcent = Number(
      yourPointsArray[index * 2 + 1].replace(",", ".")
    );

    const yourPoint = (univerisPoint / 100) * yourProcent;
    sum.your += yourPoint;

    points.your.push(yourPoint);
  });

  const finalProcent = (sum.your / sum.max) * 100;
  const answer = {
    your: round(sum.your),
    max: sum.max,
    procent: round(finalProcent),
  };

  // найден ли зачёт
  answer.exam = yourPointsArray.find((item) => {
    return item === "зачтено" || item === "не зачтено";
  })
    ? false
    : true;

  // сохранить в локал сторадже
  const grade = calculateGrade(finalProcent);
  chrome.runtime.sendMessage({
    action: "save_journal_data",
    data: { ...answer, grade },
  });

  showResult(answer, grade);
});

var port = chrome.runtime.connect({ name: "journal" });

port.onMessage.addListener(function (msg) {
  if (msg.action === "can_calculate_points") {
    pointsButton.disabled = false;
  }
});
