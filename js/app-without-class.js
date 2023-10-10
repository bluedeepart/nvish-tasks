const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const myTaskList = document.getElementById('my-task-list');
const myTaskCount = document.getElementById('my-task-count');
const otherTaskList = document.getElementById('other-task-list');
const otherTaskCount = document.getElementById('other-task-count');
const clearTasks = document.getElementById('clear-tasks');
const parseLSTask = JSON.parse(localStorage.getItem('Tasks'));

const userName = 'deepti';
const urlRegex = /(https?:\/\/[^\s]+)/g;
const removeWhiteSpace = /^\s+|\s+$/gm;

function removeSpaces(string) {
	return string.split(' ').join('');
}

taskForm.addEventListener('submit', (e) => {
	e.preventDefault();
	if (taskInput.value.trim().length > 0) {
		const taskListHtml = taskInput.value.trim().split('\n');
		setTaskFromLocalSt(taskListHtml);
		taskInput.value = '';
	}
});

const taskHtml = (task) => {
	const inputWrapper = document.createElement('div');
	const label = document.createElement('label');
	const input = document.createElement('input');
	const wrapper = document.createElement('div');
	const anchor = document.createElement('a');
	const mainTitle = document.createElement('div');
	const addDisc = document.createElement('button');

	if (task.title.toLowerCase().indexOf('imp') > 0) {
		const tag = document.createElement('span');
		tag.innerHTML = 'Imp';
		tag.className = 'badge bg-warning text-black-50';
		label.appendChild(tag);
	}

	inputWrapper.className = `list-group-item ${task.completed ? 'checked' : ''}`;
	label.classList.add('d-flex', 'align-items-center', 'p-0', 'w-100');
	input.classList.add('form-check-input', 'm-3');
	wrapper.classList.add('me-5', 'pe-5', 'py-2', 'w-100');
	addDisc.className = 'btn btn-outline-secondary btn-sm ms-4 position-absolute';

	label.setAttribute('for', `${task.id}`);
	input.type = 'checkbox';
	input.id = task.id;
	input.checked = task.completed ? 'checked' : '';
	input.addEventListener('change', checkCompletedTask);
	addDisc.addEventListener('click', addDecriptionHandler);

	if (task.url) {
		anchor.target = '_blank';
		anchor.rel = 'noopener noreferrer';
		anchor.href = task.url;
		anchor.innerHTML = task.url;
	}

	mainTitle.innerHTML = task.title;
	addDisc.innerHTML = '+ Desc';

	wrapper.appendChild(anchor);
	wrapper.appendChild(mainTitle);
	label.appendChild(input);
	label.appendChild(wrapper);
	inputWrapper.appendChild(label);
	inputWrapper.appendChild(addDisc);

	const descText = addDescHtml(task.id, task.desc);
	const toggleBtn = toggleDescBtn(task.id);
	if (!descText.value) {
		inputWrapper.appendChild(addDisc);
	} else {
		inputWrapper.appendChild(descText);
		inputWrapper.appendChild(toggleBtn);
		if (!task.showDesc) {
			toggleBtn.innerHTML = 'Show Desc';
			descText.style.display = 'none';
		}
		addDisc.remove();
	}

	return inputWrapper;
};

const setTaskFromLocalSt = (taskListHtml) => {
	console.log(taskListHtml);
	const tasksLS = localStorage.getItem('Tasks') === null ? [] : parseLSTask;

	taskListHtml.forEach((task, index) => {
		const taskURL = task.match(urlRegex);
		let tasklistItem = taskURL ? task.replace(taskURL.toString(), '') : task;
		tasklistItem = tasklistItem.replace(removeWhiteSpace, '');
		const taskTitle =
			tasklistItem.charAt(0) === ':' ? tasklistItem.replace(':', '').trim() : tasklistItem;

		const taskDetails = {
			completed: false,
			id: index + 1,
			title: taskTitle,
			url: taskURL,
			desc: '',
			showDesc: false,
			descHeight: 70,
		};

		tasksLS.push(taskDetails);
		localStorage.setItem('Tasks', JSON.stringify(tasksLS));
	});

	setTimeout(() => {
		getTaskFromLocalSt(parseLSTask);
	}, 500);
};

const generateListItems = (taskList, taskListRoot, taskCount) => {
	taskCount.innerHTML = taskList.length;
	taskList.forEach((task) => {
		taskListRoot.appendChild(taskHtml(task));
	});
};

const getTaskFromLocalSt = (tasksLS) => {
	if (tasksLS) {
		const myTask = tasksLS.filter((task) => task.title.toLowerCase().includes(userName));
		const otherTask = tasksLS.filter((task) => !task.title.toLowerCase().includes(userName));

		generateListItems(myTask, myTaskList, myTaskCount);
		generateListItems(otherTask, otherTaskList, otherTaskCount);
	}
};

const checkCompletedTask = (e) => {
	const item = e.target;
	const label = item.parentElement.parentElement;
	let updatedTasks = parseLSTask;

	if (!item.checked) {
		label.classList.remove('checked');
		updatedTasks[+item.id - 1].completed = false;
	} else {
		label.classList.add('checked');
		updatedTasks[+item.id - 1].completed = true;
	}

	localStorage.setItem('Tasks', JSON.stringify(updatedTasks));
};

const addDecriptionHandler = (e) => {
	const btn = e.target;
	const inputWrapper = btn.parentElement;
	const taskId = +btn.previousElementSibling.getAttribute('for');

	const descText = addDescHtml(taskId, '');
	const toggleBtn = toggleDescBtn(taskId);

	inputWrapper.appendChild(toggleBtn);
	inputWrapper.appendChild(descText);

	btn.remove();
};

const addDescHtml = (taskId, value) => {
	let updatedTasks = parseLSTask;
	const descText = document.createElement('textarea');
	descText.className = 'form-control shadow-none';
	descText.style.display = 'block';
	descText.setAttribute('rows', 5);
	descText.style.height = updatedTasks[taskId - 1].descHeight + 'px';
	descText.setAttribute('contenteditable', true);
	descText.setAttribute('placeholder', 'Enter Description...');
	descText.value = value;
	descText.addEventListener('blur', () => {
		updatedTasks[taskId - 1].descHeight = descText.clientHeight;
		updatedTasks[taskId - 1].desc = descText.value.trim();
		localStorage.setItem('Tasks', JSON.stringify(updatedTasks));
	});
	return descText;
};

const toggleDescBtn = (taskId) => {
	const toggleBtn = document.createElement('button');
	toggleBtn.addEventListener('click', slideToggle);
	toggleBtn.className = 'btn btn-secondary btn-sm mb-2 position-absolute';
	let updatedTasks = parseLSTask;
	toggleBtn.innerHTML = 'Hide Desc';
	toggleBtn.innerHTML = updatedTasks[taskId - 1].showDesc ? 'Hide Desc' : 'Show Desc';
	localStorage.setItem('Tasks', JSON.stringify(updatedTasks));
	return toggleBtn;
};

const slideToggle = (event) => {
	const toggleBtn = event.target;
	const descBox = toggleBtn.closest('.list-group-item ').querySelector('textarea');
	const taskId = toggleBtn.closest('.list-group-item ').querySelector('label').getAttribute('for');
	let updatedTasks = parseLSTask;
	if (updatedTasks[taskId - 1].showDesc) {
		descBox.style.display = 'none';
		toggleBtn.innerHTML = 'Show Desc';
		updatedTasks[taskId - 1].showDesc = false;
		localStorage.setItem('Tasks', JSON.stringify(updatedTasks));
	} else {
		descBox.style.display = 'block';
		toggleBtn.innerHTML = 'Hide Desc';
		updatedTasks[taskId - 1].showDesc = true;
		localStorage.setItem('Tasks', JSON.stringify(updatedTasks));
	}
};

// const tx = document.getElementsByTagName('textarea');
// for (let i = 0; i < tx.length; i++) {
// 	tx[i].setAttribute('style', 'height:' + tx[i].scrollHeight + 'px;overflow-y:hidden;');
// 	tx[i].addEventListener('input', OnInput, false);
// }

// function OnInput() {
// 	this.style.height = 0;
// 	this.style.height = this.scrollHeight + 'px';
// }

// const downloadFile = (tasksLS) => {
// 	const link = document.createElement('a');
// 	const today = new Date().toLocaleDateString().split('/').join('-');
// 	const file = new Blob([tasksLS], { type: 'text/plain' });
// 	link.href = URL.createObjectURL(file);
// 	link.download = `${today}.txt`;
// 	link.click();
// 	URL.revokeObjectURL(link.href);
// };

window.addEventListener('DOMContentLoaded', getTaskFromLocalSt.bind(null, parseLSTask));

clearTasks.addEventListener('click', () => {
	if (window.confirm('Are you sure you want to remove the tasks?')) {
		localStorage.removeItem('Tasks');
		myTaskList.innerHTML = '';
		myTaskCount.innerHTML = '';
		otherTaskList.innerHTML = '';
		otherTaskCount.innerHTML = '';
	}
});