
////////////// DRAG and DROP
function handleResetCardBlock(e) { // убирает пунктирную-рамку вокруг блока "карточки"
  e && e.stopPropagation();

  var todoListCard = document.getElementById("todoListCard")
  var inprogressListCard = document.getElementById("inprogressListCard")
  var doneListCard = document.getElementById("doneListCard")

  todoListCard.classList.remove("active-dnd", "inactive-dnd", "card-body-dnd-accept", "card-body-dnd-decline");
  inprogressListCard.classList.remove("active-dnd", "inactive-dnd", "card-body-dnd-accept", "card-body-dnd-decline");
  doneListCard.classList.remove("active-dnd", "inactive-dnd", "card-body-dnd-accept", "card-body-dnd-decline");

  todoListCard.querySelector(".card-body").classList.remove("card-body-dnd-accept", "card-body-dnd-decline");
  inprogressListCard.querySelector(".card-body").classList.remove("card-body-dnd-accept", "card-body-dnd-decline");
  doneListCard.querySelector(".card-body").classList.remove("card-body-dnd-accept", "card-body-dnd-decline");
}

function handleDragStartTask(e) {
  echo(e)
  //e.stopPropagation();
  var optionTarget = e.target;
  var optionDataId = e.target.querySelector('a').getAttribute("data-id");
  var parent = e.target.parentElement.parentElement.parentElement;
  var parentId = parent.getAttribute("id");
  var todoListCard = document.getElementById("todoListCard");
  var inprogressListCard = document.getElementById("inprogressListCard");
  var doneListCard = document.getElementById("doneListCard");

  if(parentId.includes(TASK_TODO)) {
    todoListCard.classList.add("inactive-dnd");
    inprogressListCard.classList.add("active-dnd");
    doneListCard.classList.add("active-dnd");
    STATE.dnd.from = TASK_TODO;
  } else if(parentId.includes(TASK_INPROGRESS)) {
    inprogressListCard.classList.add("inactive-dnd");
    todoListCard.classList.add("active-dnd");
    doneListCard.classList.add("active-dnd");
    STATE.dnd.from = TASK_INPROGRESS;
  } else if(parentId.includes(TASK_DONE)) {
    doneListCard.classList.add("inactive-dnd");
    todoListCard.classList.add("active-dnd");
    inprogressListCard.classList.add("active-dnd");
    STATE.dnd.from = TASK_DONE;
  }
  e.dataTransfer.setData("text/plain", optionDataId);
  STATE.dnd.id = optionDataId;

}

function handleDragOver(e) { // обработчик события - перетаскиваемый элемент перемещается над областью, куда можно сделать drop
  e.preventDefault();
  var cardContainer = e.currentTarget;
  var cardBody = cardContainer.querySelector(".card-body");

  if( (cardContainer.id.includes(TASK_TODO) && STATE.dnd.from === TASK_TODO) ||
    (cardContainer.id.includes(TASK_INPROGRESS)  && STATE.dnd.from === TASK_INPROGRESS) ||
    (cardContainer.id.includes(TASK_DONE)  && STATE.dnd.from === TASK_DONE)) {
    cardBody.classList.add("card-body-dnd-decline")
  } else {
    cardBody.classList.add("card-body-dnd-accept")
  }
  return null;
}

function handleDragEnter(e) { // обработчик события - перетаскиваемый элемент "вошел" в зону, куда можно сделать drop
  e.preventDefault();

  return null;
}

function handleDragLeave(e) { // обработчик события - перетаскиваемый элемент "ушел" из зоны, куда можно было сделать drop
  var cardContainer = e.currentTarget;

  var cardBody = cardContainer.querySelector(".card-body");
  cardBody.classList.remove("card-body-dnd-accept", "card-body-dnd-decline");
}

function handleDrop(e) { // обработчик события - объект "бросили/отпустили" в зону, куда можно сделать drop
  e.preventDefault();
  var cardContainer = e.currentTarget;
  // var ulContainer = cardContainer.querySelector('.list-group');

  var optionDataId = e.dataTransfer.getData("text");
  // var optionInnerHtml = e.dataTransfer.getData('htmlData');
  // var optionDom = document.createElement('li');
  // optionDom.setAttribute('draggable', 'true');
  // optionDom.setAttribute('class', 'list-group-item dnd_hand');
  // optionDom.innerHTML = optionInnerHtml;
  var isChanged = false;

  if(cardContainer.id.includes(TASK_TODO) && STATE.taskList[optionDataId].taskStatus !== TASK_TODO) {
    STATE.taskList[optionDataId].taskStatus = TASK_TODO;
    isChanged = true;
  } else if(cardContainer.id.includes(TASK_INPROGRESS) && STATE.taskList[optionDataId].taskStatus !== TASK_INPROGRESS) {
    STATE.taskList[optionDataId].taskStatus = TASK_INPROGRESS;
    isChanged = true;
  } else if(cardContainer.id.includes(TASK_DONE) && STATE.taskList[optionDataId].taskStatus !== TASK_DONE) {
    STATE.taskList[optionDataId].taskStatus = TASK_DONE;
    isChanged = true;
  }
  if (isChanged) {
    renderDnnColums();
    updateLocalStorage();
  }
  handleResetCardBlock();
}


function renderDnnColums() {
  var todoListContainer = document.getElementById("todoList");
  var progressListContainer = document.getElementById("inprogressList");
  var doneListContainer = document.getElementById("doneList");

  todoListContainer.innerHTML = printDnDCards(TASK_TODO);
  progressListContainer.innerHTML = printDnDCards(TASK_INPROGRESS);
  doneListContainer.innerHTML = printDnDCards(TASK_DONE);

}

function printDnDCards(status) {
  var result = '';

  STATE.taskList.forEach(function (item, index) {
    var localStatus = !item.taskStatus ? TASK_TODO : item.taskStatus;
    if (localStatus !== status) {
      return false;
    }
    result += '<li class="list-group-item dragable-task" draggable="true">' +
      (item.taskUrgent ? '<i class="text-danger fa fa-exclamation-triangle"></i> &nbsp ' : '') +
      '<a href="#" draggable="false" onclick="viewTask(event)" data-id="' + index + '" >' + item.taskName + '</a>' +
      '<br /><span class="text-muted"><small>' +
      item.taskDate + '</small></span>' +
      '</li>';
  });
  return result;
}


function initDnD() {
  var todoListCard = document.getElementById("todoListCard");
  var inprogressListCard = document.getElementById("inprogressListCard");
  var doneListCard = document.getElementById("doneListCard");

  var ms = [todoListCard, inprogressListCard, doneListCard];

  for (var i = 0; i < ms.length; i++) {
    ms[i].addEventListener("dragstart", handleDragStartTask); // назначить события "начало перемещения"
    ms[i].addEventListener("dragenter", handleDragEnter); // назначить события "вход в зону"
    ms[i].addEventListener("dragleave", handleDragLeave); // назначить события "выход из зоны"
    ms[i].addEventListener("dragover", handleDragOver); // назначить события "перемещение над зоной"
    ms[i].addEventListener("drop", handleDrop); // назначить события "перемещение над зоной"
  }

  document.addEventListener("dragend", handleResetCardBlock)

}
