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
};

document.addEventListener('DOMContentLoaded', handleContentLoad);

function createOneTask(data) {
	const { taskList } = STATE;
	taskList.push(formData); // добавили данные в стейт (список задач)
	updateLocalStorage(taskList);
}

function updateLocalStorage(data) {
	localStorage.setItem('taskList', JSON.stringify(data));
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
	if (data.taskDate.length < 8) {
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

function loadDataFromStarage() {

	return null;
}

function handleCreateBtnClick(e) {
	const formData = getDataFromForm();
	const isValid = checkFormDataValid(formData);
	renderHelpers();

	if (!isValid) {
		return null;
	}


}

function handleContentLoad(e) {

	resetFormControls();
	loadDataFromStarage();

	document
		.getElementById('createTaskBtn')
		.addEventListener('click', handleCreateBtnClick);


}

//////// RENDER FUNCTIONS
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
