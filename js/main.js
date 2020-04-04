const FORM_CREATE = 'FORM_CREATE';
const FORM_EDIT = 'FORM_EDIT';
const TASK_ST_NEW = "0";
const TASK_ST_INPROGRESS = "1";
const TASK_ST_DONE = "2";



const STATE = {
	taskList: [], // список задач
	errState: false, // состояние приложения - есть ошибка/ нет ошибки
	errors: {},
	formState: FORM_CREATE,
	formData: {},
	operateIndex: null, // индекс задачи в массиве taskList, над которым производится действие в данный момент времени
};


document.addEventListener('DOMContentLoaded', handleContentLoad);

function createOneTask(data) {
	const { taskList } = STATE;
	taskList.push(data); // добавили данные в стейт (список задач)
	updateLocalStorage(taskList);
}

function updateOneTask(data) {
	const { taskList, operateIndex } = STATE;
	taskList[operateIndex] = data;
	updateLocalStorage(taskList);
}

function updateLocalStorage(data) {
	localStorage.setItem('taskList', JSON.stringify(data));
}

function loadDataFromStorage() {
	const taskList = JSON.parse(localStorage.getItem('taskList'));
	STATE.taskList = taskList;
	// STATE = { ...STATE, taskList }; - так работало бы, если бы STATE был объявлен через let

	console.log(" taskList on Load ", STATE);
}

function getDataFromForm() {
	// taskName taskDate taskDeskription taskUrgent taskState
	const formData = {
		taskName: document.getElementById('taskName').value,
		taskDate: document.getElementById('taskDate').value,
		taskDeskription: document.getElementById('taskDeskription').value,
		taskUrgent: document.getElementById('taskUrgent').checked,
		taskState: document.getElementById('taskState').value,
	};
	return formData;
}

function setDataToForm() {
	const { taskList, operateIndex } = STATE;
	document.getElementById('taskName').value = taskList[operateIndex].taskName;
	document.getElementById('taskDate').value = taskList[operateIndex].taskDate;
	document.getElementById('taskDeskription').value = taskList[operateIndex].taskDeskription;
	document.getElementById('taskUrgent').checked  = taskList[operateIndex].taskUrgent;
	document.getElementById('taskState').value = taskList[operateIndex].taskState;
	resetFormControls();

}

function checkFormDataValid(data) {
	const taskState = [
		TASK_ST_NEW,
		TASK_ST_INPROGRESS,
		TASK_ST_DONE
	];
	const errors = {};
	STATE.errState = false;
	STATE.errors = errors;

	if (data.taskName.length < 3) {
		errors.taskName = 'Это поле обязательно для ввода';
	}
	if (data.taskDate.length < 8) { // dayjs().isValid()
		errors.taskDate = 'Это поле обязательно для ввода';
	}
	if (STATE.formState === FORM_EDIT && !taskState.includes(data.taskState)) {
		errors.taskState = 'Укажите актуальный статус задачи';
	}

	if (Object.keys(errors).length) {
		STATE.errState = true;
		return false;
	}
	// STATE.errors = errors;

	return true;
}

function resetFormControls() {
	if (STATE.formState === FORM_EDIT) {
		document.getElementById('createTaskBtn').innerText = 'Сохранить';
		document.getElementById('formHeader').innerText = 'Редактировать задачу';
	} else {
		document.getElementById('createTaskBtn').innerText = 'Создать';
		document.getElementById('formHeader').innerText = 'Создать задачу';
	}
}

function fixBootstrapModal() {
// background-color: rgb(0,0,0);
	//style="background-color: #000000; opacity: 0.7;"
	const modal = document.getElementById('modalBox');
	modal.style.backgroundColor = 'rgb(0,0,0)';
	modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
	modal.style.display = 'none';
	modal.style.zIndex = '1000';
	const content = modal.querySelector('.modal-dialog');
	console.log(content);
}


function handleCreateBtnClick(e) {
	const formData = getDataFromForm();
	const isValid = checkFormDataValid(formData);
	renderHelpers();

	if (!isValid) {
		return null;
	}

	if (STATE.formState === FORM_CREATE) {
		createOneTask(formData);
	} else {
		updateOneTask(formData);
	}

	e.target.closest('form').reset();
	renderTaskList();

	return true;
}

function handleCancelBtnClick(e) {
	STATE.formState = FORM_CREATE;
	resetFormControls();
	e.target.closest('form').reset();
}


//////////////////////////////////////////////// ON LOAD INITIAL THINGS
function handleContentLoad(e) {

	resetFormControls();
	loadDataFromStorage();
	renderTaskList();
	fixBootstrapModal();

	document.getElementById('taskDate').value = dayjs().format('DD-MM-YYYY HH:mm');

	document
		.getElementById('createTaskBtn')
		.addEventListener('click', handleCreateBtnClick);

	document
		.getElementById('cancelTaskBtn')
		.addEventListener('click', handleCancelBtnClick);

	document.getElementById('modalBoxCloseBtn').addEventListener('click', handleCloseModal);
	document.getElementById('modalBoxCloseBtnX').addEventListener('click', handleCloseModal);
	document.getElementById('modalBoxSaveBtn').addEventListener('click', handleModalActionClick);

}


function handleCloseModal() {
	document.getElementById('modalBox').style.display = 'none';
}
function handleOpenModal() {
	document.getElementById('modalBox').style.display = 'block';
}

function handleModalActionClick() {
	const { taskList, operateIndex } = STATE;

	taskList.splice(operateIndex, 1);
	updateLocalStorage(taskList);
	renderTaskList();
	handleCloseModal();
}



////////////////////// обработчики события ЭЛЕМЕНТА - ЗАДАЧИ - РЕДАКТИРОВАТЬ одну задачу
function handleEditItemClick(e) {
	STATE.operateIndex = e.target.getAttribute('data-id');
	STATE.formState = FORM_EDIT;
	setDataToForm();
	return null;
}
//////// удалить задачу
function handleDeleteItemClick(e) {
	STATE.operateIndex = e.target.getAttribute('data-id');

	document.getElementById('modalBoxText').innerHTML = STATE.taskList[STATE.operateIndex].taskName +
		'<br><small>' + STATE.taskList[STATE.operateIndex].taskDate + '</small>';

	handleOpenModal();

	return null;
}




////////////////////////////////////// RENDER FUNCTIONS
function renderHelpers() {
	const taskName = document.getElementById('taskName'); // .parentElement.getElementsByTagName('small')[0];
	const taskDate = document.getElementById('taskDate'); // .parentElement.getElementsByTagName('small')[0];
	const taskState = document.getElementById('taskState'); // .parentElement.getElementsByTagName('small')[0];

	function paintHelper(item, err) {

		if (err) {
			item.classList.add('is-invalid');
			item.parentElement.getElementsByTagName('small')[0].classList.remove('text-muted');
			item.parentElement.getElementsByTagName('small')[0].classList.add('text-danger');
			item.parentElement.getElementsByTagName('small')[0].innerText = err;
		} else {
			item.classList.remove('is-invalid');
			item.parentElement.getElementsByTagName('small')[0].classList.add('text-muted');
			item.parentElement.getElementsByTagName('small')[0].classList.remove('text-danger');
			item.parentElement.getElementsByTagName('small')[0].innerHTML = '&nbsp;';
		}
	}

	paintHelper(taskName, STATE.errors.taskName);
	paintHelper(taskDate, STATE.errors.taskDate);
	paintHelper(taskState, STATE.errors.taskState);

}

function renderOneTaskFromList(item, index) {
	const htmlCard = document.createElement('div');
	const htmlCardBody = document.createElement('div');
	const htmlCardHeader = document.createElement('h5');
	const htmlCardText = document.createElement('p');
	const editBtn = document.createElement('i');
	const delBtn = document.createElement('i');
	const exclamation = document.createElement('i');

	htmlCard.classList.add('card'); // класс можно установить 2мя способами
	htmlCardBody.setAttribute('class', 'card-body'); // либо так
	htmlCardHeader.classList.add('card-title');
	htmlCardText.classList.add('card-text');
	editBtn.classList.add('fas', 'fa-edit');
	delBtn.classList.add('fas', 'fa-ban', 'text-danger');
	exclamation.classList.add('fas', 'fa-exclamation', 'text-danger');
	editBtn.style.position = 'absolute';
	delBtn.style.position = 'absolute';
	exclamation.style.position = 'absolute';

	exclamation.style.top = '25px';
	exclamation.style.left = '7px';
	editBtn.style.top = '15px';
	delBtn.style.top = '15px';
	editBtn.style.right = '40px';
	delBtn.style.right = '15px';
	editBtn.style.cursor = 'pointer';
	delBtn.style.cursor = 'pointer';

	editBtn.addEventListener('click', handleEditItemClick);
	delBtn.addEventListener('click', handleDeleteItemClick);


	editBtn.setAttribute('data-id', index);
	delBtn.setAttribute('data-id', index);

	htmlCardHeader.innerText = item.taskName;
	htmlCardText.innerHTML = '<small>' + item.taskDate + '</small>';

	htmlCard.appendChild(htmlCardBody);
	htmlCardBody.appendChild(htmlCardHeader);
	htmlCardBody.appendChild(htmlCardText);
	htmlCard.appendChild(editBtn);
	htmlCard.appendChild(delBtn);
	if(item.taskUrgent) {
		htmlCard.appendChild(exclamation);
	}

	htmlCard.style.marginTop = '10px';
	htmlCard.style.position = 'relative';



	// htmlCard.classList.add('card');
	// htmlCard.innerHTML = '<div class="card-body">' +
	// 	'<h5 class="card-title">'+ item.taskName +'</h5>' +
	// 	'<p class="card-text"><small>'+ item.taskDate +'</small></p>' +
	// 	'</div>';



	return htmlCard;
}

function renderTaskList() {

	const tasksList = document.getElementById('tasksList');
	const header = tasksList.getElementsByTagName('h3')[0];
	tasksList.innerHTML = '';
	tasksList.appendChild(header);

	STATE.taskList.forEach((item, index) => {
		tasksList.appendChild(renderOneTaskFromList(item, index));
	});
}
