
function handleCalendarClick(e) {
  if (STATE.calendarVisibility) {
    handleCloseCalendar(e);
  } else {
    handleShowCalendar(e);
  }
}

// определяет нужно ли закрывать календарь по клику на документ
function closeCalendarHelper(target){
  if (target.closest('.micalendar')) {
    return true;
  }
  return false;
}

function handleClickCalendarCell(e) {

  var target = e.target;
  var fullDate = target.getAttribute('data-fulldate');
  var dayMonth = target.getAttribute('data-daymonth');

  const dt = dayjs();
  dt.set('date', fullDate.split("-")[0])
  dt.set('month', fullDate.split("-")[1]) // April
  dt.set('year', fullDate.split("-")[2])




  console.log("DATE origin = ", dt.set('year', fullDate.split("-")[2]));

  console.log("DATE = ", dayjs(fullDate).format("MM"), "STATE = ", STATE.calendarDate)
  return null;
}

function handleShowCalendar(e) {
  if (STATE.calendarVisibility) {
    return false;
  }
  var calendar = document.getElementById('calendar');
  var clickedIcon = e.target;
  var coords = clickedIcon.closest('.input-group-prepend').getBoundingClientRect();
  // e.target.parentElement.parentElement;
  echo("coords", coords);
  calendar.style.top = coords.bottom + "px";
  calendar.style.left = coords.left + "px";
  calendar.style.display = 'block';
  STATE.calendarVisibility = true;
  e.stopPropagation();
}

function handleCloseCalendar(e) {
  var calendar = document.getElementById('calendar');
  calendar.style.display = 'none';
  STATE.calendarVisibility = false;
}

function initCalendar() {
  var calendarArrowLeft = document.getElementById('prevButton'); // получаем html элемент, который является дивом под иконкой стрелки "назад"
  var calendarArrowRight = document.getElementById('nextButton');  // получаем html элемент, который является дивом под иконкой стрелки "вперед"

  calendarArrowLeft.addEventListener('click', handleClickCalendarArrows);

  calendarArrowRight.addEventListener('click', handleClickCalendarArrows);

  document.body.addEventListener('click', function(event) {
    if (STATE.calendarVisibility && !closeCalendarHelper(event.target)) {
      handleCloseCalendar(event);
    }
  });
  renderCalendar(STATE.calendarDate.getFullYear(), STATE.calendarDate.getMonth());

}

function renderCalendar(yearToOperate, monthToOperate) {
  var dateToOperate = new Date(yearToOperate, monthToOperate);
  var year = dateToOperate.getFullYear();
  var month = dateToOperate.getMonth(); // месяц от 0 до 11, нужно прибавлять 1
  var dayMonth = new Date().getDate(); // какое число месяца
  var dayWeek = dateToOperate.getDay(); // от 0 до 6, причем 0 - это воскресение
  var maximumDaysInPrevMonth = getLastDay(year, month-1);
  dayWeek = dayWeek === 0 ? 7 : dayWeek;
  var firstDay = getFirstDayOfMonth(year, month);
  var j = 1; // это счетчик недель, которые выводятся в календарь
  var dayCounter = 1;
  var dayCounterAfter = 1;
  var str_out_week = '';
  var toMuchWeeksFlag = false;

  while(j < 7) {
    var str_out = '';
    for(var i = 1; i < 8; i++) {
      var tmpCellObject = {};
      if ((firstDay.dayWeek > i && j == 1) ) { // если меньше чем 1е число текущего месяца - ячейки для предыдущего месяца
        var tmpDayMonth = (maximumDaysInPrevMonth + i + 1 - firstDay.dayWeek);
        tmpCellObject = {
          className: ' class="not_current"',
          dataFullDate: (tmpDayMonth + '.' + (month === 0 ? 12 : month) + '.' + (month === 0 ? yearToOperate - 1 : yearToOperate)),
          dataDaymonth: tmpDayMonth,
        };
      } else if (dayCounter > firstDay.maxDays )  { // ячейки для следующего месяца
        tmpCellObject = {
          className: ' class="not_current"',
          dataFullDate: (dayCounterAfter + '.' + (month === 11 ? 1 : month + 2) + '.' + (month == 11 ? yearToOperate + 1 : yearToOperate)),
          dataDaymonth: dayCounterAfter++,
        };
        toMuchWeeksFlag = true;
      } else { // ЯЧЕЙКИ для ТЕКУЩЕГО МЕСЯЦА
        var todayClass = '';
        var currrentDt = new Date();

        if(yearToOperate == currrentDt.getFullYear() && monthToOperate == currrentDt.getMonth()) {
          todayClass = dayCounter == dayMonth ? ' class="today"' : '';
        }

        tmpCellObject = {
          className: todayClass,
          dataFullDate: (dayCounter + '.' + (month + 1) + '.' + yearToOperate),
          dataDaymonth: dayCounter++,
        };
      }
      str_out += renderOneCalendarCell(tmpCellObject);
    }
    str_out_week += '<tr>' + str_out + '</tr>';
    if (toMuchWeeksFlag) {
      break;
    }
    j++;
  }

  renderCalendarMonthHeader(yearToOperate, monthToOperate);
  document.getElementById('calendar_table').children[1].innerHTML = str_out_week;
}

function renderCalendarMonthHeader(year, month) {
  var text = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декаабрь'];
  document.getElementById("monthHeader").innerHTML = text[month] + ' ' + year;

}

// формирует содержимое одной ячейки календаря и возвращает строку содержащую тег TD и все его содержимое
function renderOneCalendarCell({ className = null, dataFullDate = null, dataDaymonth = null, cellText = null }) {
  // if (! (className && dataWeek && dataDaymonth) )
  if (!className && !dataFullDate && !dataDaymonth ) {
    return '<td>&nbsp;</td>';
  }
  return '<td onclick="handleClickCalendarCell(event)" ' + className + ' data-fulldate="'+ dataFullDate +'" data-daymonth="' + dataDaymonth + '">' +
    (cellText === null ? dataDaymonth : cellText ) + '</td>';
}

/* возвращает объект с 2 полями: на какой день недели выпадает первое число месяца и сколько всего в месяце дней*/
function getFirstDayOfMonth(yy, mm) {
  var firstDayOfCurrentMonth = new Date(yy, mm, 1); // дата на момент первого числа текущего месяца
  var month = firstDayOfCurrentMonth.getMonth(); // месяц от 0 до 11, нужно прибавлять 1
  // var dayMonth = firstDayOfCurrentMonth.getDate();
  var dayWeek = firstDayOfCurrentMonth.getDay(); // от 0 до 6, причем 0 - это воскресение
  dayWeek = (dayWeek === 0) ? 7 : dayWeek;
  return {
    dayWeek, // номер дня недели первого числа текущего месяца
    maxDays: getLastDay(yy, mm), // максимальное количество дней  в текуще месяце (который был передан в качестве параметре )
  }
}

function getLastDay(yy, mm) {
  return  new Date(yy, mm +1, 0).getDate();
}

function handleClickCalendarArrows(e) {
  e.stopPropagation();
  echo(event)
  var target = e.target.closest('.arrows_left,.arrows_right');
  var curMonth = STATE.calendarDate.getMonth(); // получаем номер месяца: который отображается в календаре
  var curYear = STATE.calendarDate.getFullYear(); // получаем год: который отображается в календаре
  var classes = target.classList;
  var monthForSate = 0;
  var yearForState = curYear;
  if (classes[0] == 'arrows_right') { // если нажали кнопку следующий месяц
    monthForSate = curMonth === 11 ? 0 : curMonth + 1; // если месяц декабрь, тогда должны месяц скинуть на январь
    yearForState = curMonth === 11 ? yearForState + 1 : yearForState; // если месяц декабрь, тогда год увеличиваем на 1
  } else {
    monthForSate = curMonth === 0 ? 11 : curMonth - 1; // если месяц январь, тогда должны месяц скинуть на декабрь
    yearForState = curMonth === 0 ? yearForState - 1 : yearForState; // если месяц январь, тогда должны год уменьшить
  }
  renderCalendar(yearForState, monthForSate);
  STATE.calendarDate = new Date(yearForState, monthForSate);
}
