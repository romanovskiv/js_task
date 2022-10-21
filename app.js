'use strict';
console.clear();

const costAB = 700;
const costABA = 1200;
const travelTimeMinutes = 50;
const btn = document.querySelector('button');
const ticket = document.querySelector('#num');

const timesAB = `
  2021-08-21 18:00:00
  2021-08-21 18:30:00
  2021-08-21 18:45:00
  2021-08-21 19:00:00
  2021-08-21 19:15:00
  2021-08-21 21:00:00
`;

const timesBA = `
  2021-08-21 18:30:00
  2021-08-21 18:45:00
  2021-08-21 19:00:00
  2021-08-21 19:15:00
  2021-08-21 19:35:00
  2021-08-21 21:50:00
  2021-08-21 21:55:00
`;

const parseTimes = (times) =>
  times
    .trim()
    .split('\n')
    .map((str) => new Date(str.trim()));

const routeAB = parseTimes(timesAB);
const routeBA = parseTimes(timesBA);

const el = Object.fromEntries(
  ['direction', 'timesAB', 'timesBA', 'blockAB', 'blockBA', 'output'].map((id) => [
    id,
    document.getElementById(id),
  ]),
);

function padTo2Digits(num) {
  return String(num).padStart(2, '0');
}

const createOptions = (datesArray, id) => {
  datesArray.forEach((time) => {
    const option = document.createElement('option');
    option.value = time.getTime();
    option.innerText = `${padTo2Digits(time.getHours())}:${padTo2Digits(time.getMinutes())}`;
    el[id].appendChild(option);
  });
};

createOptions(routeAB, 'timesAB');
createOptions(routeBA, 'timesBA');

const filterBAOptions = () => {
  let latest = 0;
  if (el.direction.value & 1) {
    latest = +el.timesAB.value + travelTimeMinutes * 6e4;
  }
  const isSelectionValid = +el.timesBA.value >= latest;
  let isFixApplied = false;

  el.timesBA.querySelectorAll('option').forEach((opt) => {
    if (+opt.value < latest) {
      opt.setAttribute('disabled', 'disabled');
    } else {
      opt.removeAttribute('disabled');
      if (!isSelectionValid && !isFixApplied) {
        el.timesBA.value = opt.value;
        isFixApplied = true;
      }
    }
  });
};

const onDirectionChange = () => {
  const bits = +el.direction.value;
  el.blockAB.classList[bits & 1 ? 'remove' : 'add']('hidden');
  el.blockBA.classList[bits & 2 ? 'remove' : 'add']('hidden');
};

const updateTimes = (dt, minutes) => {
  return new Date(dt.getTime() + minutes * 60000);
};

const printTicket = () => {
  const travelTime = el.direction.value == 3 ? travelTimeMinutes * 2 : travelTimeMinutes;
  const departureTime =
    el.direction.value == 2
      ? el.timesBA.options[el.timesBA.selectedIndex].text
      : el.timesAB.options[el.timesAB.selectedIndex].text;

  const arrivedTime =
    el.direction.value == 1
      ? Number(el.timesAB.options[el.timesAB.selectedIndex].value)
      : Number(el.timesBA.options[el.timesBA.selectedIndex].value);

  const arrivedTime50 = `${padTo2Digits(
    updateTimes(new Date(arrivedTime), 50).getHours(),
  ).toString()}:${padTo2Digits(updateTimes(new Date(arrivedTime), 50).getMinutes()).toString()}`;

  const cost = 1 * el.direction.value == 3 ? costABA : costAB;
  el.output.innerHTML = `
  <h2>Подробности заказа</h2>
  <p>Количество билетов:${ticket.value ? ticket.value : 1} </p>
  <p>Маршрут <b>${
    el.direction.value == 1
      ? 'A &rarr; B'
      : el.direction.value == 2
      ? 'B &rarr; A'
      : 'A &rarr; B &rarr; A'
  }</b> стоимостью <b><u>${cost * (ticket.value ? ticket.value : 1)} руб.</u></b></p>
  <p>Это путешествие займет у вас ${travelTime} минут.</p>
  <p>Теплоход отправляется в ${departureTime}, а прибудет в конечный пункт назначения в ${arrivedTime50}.</p>
    `;
};

const update = () => {
  onDirectionChange(), filterBAOptions(), printTicket();
};

el.direction.addEventListener('change', update);
el.timesAB.addEventListener('change', update);
el.timesBA.addEventListener('change', update);
ticket.addEventListener('change', update);

btn.addEventListener('click', () => {
  if (ticket.value == '') {
    window.alert('Введите количество билетов');
  } else {
    el.output.style.display = 'block';
  }
});

update();
