const usernameElment = document.getElementById('username');
const fixedIcons = document.querySelector('.fixed-icons');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const myTaskList = document.getElementById('my-task-list');
const myTaskCount = document.getElementById('my-task-count');
const otherTaskList = document.getElementById('other-task-list');
const otherTaskCount = document.getElementById('other-task-count');
const clearTasks = document.getElementById('clear-tasks');
const downloadBtn = document.getElementById('download');
const downloadAllBtn = document.getElementById('download-all-tasks');
const parseLSTask = JSON.parse(localStorage.getItem('Tasks'));

const taskCls = new Task();

taskForm.addEventListener('submit', taskCls.addTaskToLS);

window.addEventListener(
	'DOMContentLoaded',
	taskCls.getTaskFromLocalSt.bind(null, parseLSTask, myTaskList, otherTaskList),
);

clearTasks.addEventListener('click', () => {
	if (window.confirm('Are you sure you want to remove the tasks?')) {
		localStorage.removeItem('Tasks');
		setTimeout('location.reload(true);', 500);
	}
});

/* SCROLL HEIGHT TO TEXTAREA */
taskInput.setAttribute('style', 'height:' + taskInput.scrollHeight + 'px;overflow-y:hidden;');
taskInput.addEventListener('input', OnInput, false);
function OnInput() {
	this.style.height = 0;
	this.style.height = this.scrollHeight + 'px';
}

downloadBtn.addEventListener('click', taskCls.completedTickets.bind(null, '1'));
downloadAllBtn.addEventListener('click', taskCls.completedTickets);
