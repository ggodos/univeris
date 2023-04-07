const BOUND_3 = 59.5;
const BOUND_4 = 74.5;
const BOUND_5 = 84.5;

chrome.runtime.onInstalled.addListener(function () {
  console.log("onInstalled");
});

function getCurrentUrl() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      resolve(tabs[0].url);
    });
  });
}

function gradeToColor(grade, isExam) {
  if (isExam) {
    if (grade < 3) return "red";
    if (grade < 4) return "orange";
    if (grade < 5) return "green";
    return "blue";
  } else {
    if (grade < 3) return "red";
    return "blue";
  }
}

function colorToGrade(color) {
  if (color === "red") return 2;
  if (color === "orange") return 3;
  if (color === "green") return 4;
  if (color === "blue") return 5;
  return 0;
}

var ports = {};

chrome.runtime.onConnect.addListener(function (port) {
  ports[port.name] = port;
});

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.action === "save_journal_data") {
    const data = {};
    const url = await getCurrentUrl();
    const key = url.replace("https://studlk.susu.ru/", "");
    data[key] = request.data;

    chrome.storage.local.set(data, function () {
      console.log(`${key} is set to ${data[key]}`);
    });
  }
  return true;
});

const studyPlanXhr = "https://studlk.susu.ru/ru/StudyPlan/StudyPlanGridPartial";
const jorunalXhr = "https://studlk.susu.ru/ru/StudyPlan/GetMarks";

chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (details.url == studyPlanXhr) {
      chrome.storage.local.get(null, function (items) {
        ports["study-plan"].postMessage({ action: "table_update", items });
      });
    }

    if (details.url == jorunalXhr) {
      ports["journal"].postMessage({ action: "can_calculate_points" });
    }
  },
  { urls: [studyPlanXhr, jorunalXhr], types: ["xmlhttprequest"] }
);
