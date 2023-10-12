const getUserTicket = () => {
	let username = 'Guest';
	if (!localStorage.getItem('USER')) {
		const user = window.prompt('Enter your name: ');
		if (user) {
			localStorage.setItem('USER', JSON.stringify(user));
			username = user;
		}
	} else {
		username = JSON.parse(localStorage.getItem('USER'));
	}
	usernameElment.innerHTML = username.charAt(0).toUpperCase() + username.slice(1);
	return username;
};

class Task {
	constructor() {
		this.parseLSTask = JSON.parse(localStorage.getItem('Tasks'));
		this.isURL = /(https?:\/\/[^\s]+)/g;
		this.removeWhiteSpace = /^\s+|\s+$/gm;
		this.splitString = (str, splitText) => {
			const originalString = str;
			const startIndex = originalString.indexOf(splitText);
			const endIndex = startIndex + splitText.length;
			const newString = originalString.slice(0, startIndex) + originalString.slice(endIndex);
			return newString;
		};
		this.updateUrl = (url) => {
			if (url) {
				const newURL = new URL(url);
				const viewsIndex = newURL.pathname.indexOf('views');
				const originalString = newURL.href;
				let finaUrl;
				if (viewsIndex > 0) {
					const nextString =
						originalString.split('/')[originalString.split('/').indexOf('views') + 1];
					let newString = this.splitString(originalString, 'views');
					newString = this.splitString(newString, nextString);
					finaUrl = newString.replace('///', '/');
				} else {
					finaUrl = originalString;
				}
				return finaUrl;
			}
		};
		this.taskIndex = (inputId) => {
			return this.parseLSTask.findIndex((tasks) => tasks.id === inputId);
		};
		this.userName = getUserTicket();
	}

	generateListItems = (taskList, taskListRoot, taskCount) => {
		taskCount.innerHTML = taskList.length;
		taskList.forEach((task) => {
			taskListRoot.appendChild(taskCls.taskHtml(task));
		});
	};

	getTaskFromLocalSt = (tasksLS, myTaskList, otherTaskList) => {
		if (tasksLS) {
			downloadBtn.style.display = 'block';
			clearTasks.style.display = 'block';
			fixedIcons.style.display = 'block';
			myTaskCount.parentElement.style.display = 'block';
			otherTaskCount.parentElement.style.display = 'block';
			const myTask = tasksLS.filter((task) => task.title.toLowerCase().includes(this.userName));
			const otherTask = tasksLS.filter((task) => !task.title.toLowerCase().includes(this.userName));

			this.generateListItems(myTask, myTaskList, myTaskCount);
			this.generateListItems(otherTask, otherTaskList, otherTaskCount);
		} else {
			downloadBtn.style.display = 'none';
			clearTasks.style.display = 'none';
			fixedIcons.style.display = 'none';
			myTaskCount.parentElement.style.display = 'none';
			otherTaskCount.parentElement.style.display = 'none';
		}
	};

	setTaskFromLocalSt = (taskListHtml) => {
		const tasksLS = localStorage.getItem('Tasks') === null ? [] : this.parseLSTask;

		taskListHtml.forEach((task) => {
			const taskURL = task.match(this.isURL);
			let tasklistItem = taskURL ? task.replace(taskURL.toString(), '') : task;
			tasklistItem = tasklistItem.replace(this.removeWhiteSpace, '');
			const taskTitle =
				tasklistItem.charAt(0) === ':' ? tasklistItem.replace(':', '').trim() : tasklistItem;

			const taskDetails = {
				completed: false,
				id: (Math.random() + 1).toString(36).substring(2).toUpperCase(),
				title: taskTitle,
				url: this.updateUrl(taskURL),
				desc: '',
				showDesc: false,
				descHeight: 70,
			};

			tasksLS.push(taskDetails);
			localStorage.setItem('Tasks', JSON.stringify(tasksLS));
		});
		setTimeout('location.reload(true);', 500);
	};

	addTaskToLS = (e) => {
		e.preventDefault();
		if (taskInput.value.trim().length > 0) {
			const taskListHtml = taskInput.value.trim().split('\n');
			this.setTaskFromLocalSt(taskListHtml);
			taskInput.value = '';
		}
	};

	createDomElement(tag, parentEl, classes, content = '', attr) {
		const domElement = document.createElement(tag);
		if (classes) {
			domElement.className = classes;
		}
		domElement.innerHTML = content;
		if (tag === 'input' || tag === 'textarea') {
			domElement.value = content;
		}
		if (parentEl) {
			parentEl.appendChild(domElement);
		}
		if (attr) {
			for (let key in attr) {
				domElement.setAttribute(key, attr[key]);
			}
		}
		return domElement;
	}

	getUrlLinksFromDesc = (URLs, parentEl) => {
		const descLinksList = this.createDomElement('div', parentEl, '', '', '');
		const descLinksList1 = this.createDomElement('div', descLinksList, '', 'Main URL: ', '');
		const descLinksList2 = this.createDomElement('div', descLinksList, '', 'Live URL: ', '');
		URLs.forEach((url) => {
			if (url.match(this.isURL)) {
				const descLinksItem = url.replace(/(\r\n|\n|\r)/gm, '');
				const mainHost = 'https://main--moleculardevices--hlxsites.hlx.page';
				const mainUrl = new URL(descLinksItem);
				const updatedUrl = mainHost + mainUrl.pathname;

				const descLink = descLinksItem.split('/')[descLinksItem.split('/').length - 1];
				const paragraph1 = this.createDomElement(
					'span',
					descLinksList1,
					'my-2 d-inline-block me-3',
					'',
					'',
				);
				this.createDomElement(
					'a',
					paragraph1,
					'text-white bg-secondary py-1 px-2 rounded-1 d-inline-block text-sm',
					descLink,
					{
						href: updatedUrl,
					},
				);
				const paragraph2 = this.createDomElement(
					'span',
					descLinksList2,
					'my-2 d-inline-block me-3',
					'',
					'',
				);
				this.createDomElement(
					'a',
					paragraph2,
					'text-white bg-secondary py-1 px-2 rounded-1 d-inline-block',
					descLink,
					{
						href: descLinksItem,
					},
				);
			}
		});
		return descLinksList;
	};

	descriptionBoxHeighthandler = (inputId, descriptionBox) => {
		let updatedTasks = this.parseLSTask;
		const taskID = this.taskIndex(inputId);
		descriptionBox.style.height = 70 + 'px';
		descriptionBox.style.height = descriptionBox.scrollHeight + 'px';
		updatedTasks[taskID].descHeight = descriptionBox.clientHeight;
		updatedTasks[taskID].desc = descriptionBox.value.trim();
		localStorage.setItem('Tasks', JSON.stringify(updatedTasks));
	};

	descriptionBoxToggler = (inputId, addDiscBtn, descriptionBox) => {
		let updatedTasks = this.parseLSTask;
		const taskID = this.taskIndex(inputId);
		updatedTasks[taskID].showDesc = !updatedTasks[taskID].showDesc;
		const showMsg = updatedTasks[taskID].desc.length > 0 ? 'Show Desc' : 'Add Desc';
		addDiscBtn.innerHTML = updatedTasks[taskID].showDesc ? 'Hide Desc' : showMsg;
		addDiscBtn.classList.add(showMsg !== 'Show Desc' ? 'btn-outline-secondary' : 'btn-secondary');
		addDiscBtn.classList.remove(
			showMsg === 'Show Desc' ? 'btn-outline-secondary' : 'btn-secondary',
		);
		descriptionBox.style.display = updatedTasks[taskID].showDesc ? 'block' : 'none';
		localStorage.setItem('Tasks', JSON.stringify(updatedTasks));
	};

	checkCompletedTask = (e) => {
		const item = e.target;
		const label = item.parentElement.parentElement;
		let updatedTasks = this.parseLSTask;
		const taskID = this.taskIndex(item.id);

		if (!item.checked) {
			label.classList.remove('checked');
			updatedTasks[taskID].completed = false;
		} else {
			label.classList.add('checked');
			updatedTasks[taskID].completed = true;
		}

		localStorage.setItem('Tasks', JSON.stringify(updatedTasks));
	};

	taskHtml = (task) => {
		const inputWrapper = this.createDomElement('div', '', [
			`list-group-item ${task.completed ? 'checked' : ''}`,
		]);
		const label = this.createDomElement('label', inputWrapper, '', '', { for: task.id });
		const input = this.createDomElement('input', label, [`form-check-input me-3`], '', {
			id: task.id,
			type: 'checkbox',
		});
		const wrapper = this.createDomElement('div', label, [`me-5 pe-5 w-100`]);
		const anchor = this.createDomElement('a', wrapper, ['anchor'], task.url);
		const showMsg = task.desc.length > 0 ? 'Show Desc' : 'Add Desc';
		const addDiscBtn = this.createDomElement(
			'button',
			inputWrapper,
			[
				`btn ${
					showMsg !== 'Show Desc' ? 'btn-outline-secondary' : 'btn-secondary'
				} btn-sm position-absolute`,
			],
			`${task.showDesc ? 'Hide Desc' : showMsg}`,
		);

		/* description box dom */
		const descriptionBox = this.createDomElement(
			'textarea',
			inputWrapper,
			['form-control shadow-none mt-2'],
			task.desc,
			{
				rows: 4,
				contenteditable: true,
				placeholder: 'Enter Description...',
				style: `display: ${task.showDesc ? 'block' : 'none'}; height: ${task.descHeight + 'px'}`,
			},
		);
		descriptionBox.addEventListener(
			'input',
			this.descriptionBoxHeighthandler.bind(null, task.id, descriptionBox),
		);

		if (task.title.toLowerCase().indexOf('imp') > 0) {
			this.createDomElement('span', inputWrapper, [`badge bg-danger text-black-50`], 'Imp', {
				title: 'Important',
			});
		}

		if (task.title.toLowerCase().indexOf('live') > 0) {
			this.createDomElement(
				'span',
				inputWrapper,
				[`badge bg-warning text-black-50 live-ticket`],
				'Live',
				{ title: 'Done on live' },
			);
		}

		this.createDomElement('div', wrapper, ['main-title'], task.title);

		input.checked = task.completed ? 'checked' : '';
		input.addEventListener('change', this.checkCompletedTask);
		addDiscBtn.addEventListener(
			'click',
			this.descriptionBoxToggler.bind(null, task.id, addDiscBtn, descriptionBox),
		);

		if (task.url) {
			anchor.target = '_blank';
			anchor.rel = 'noopener noreferrer';
			anchor.href = task.url;
		}

		return inputWrapper;
	};

	/* DOWNLOAD TXT FILE */
	checkStatus = (task) => {
		const status = task.completed
			? task.title.indexOf('live') > -1
				? '[Done on live]'
				: '[Done on drafts]'
			: '[WIP]';
		return status;
	};

	completedTickets = (option = 0) => {
		let data = '';
    let userTickets = '';
    let otherTickets = '';
    const USERNAME = this.userName.charAt(0).toUpperCase() + this.userName.slice(1);

		this.parseLSTask.forEach((task) => {
			const createUrl = task.url ? task.url + '\n' : task.title.split('[')[0] + '\n';
			const taskURL = task.url ? task.url + '\n' : '';
			const createUrl2 = taskURL + task.title.split('[')[0] + ' ' + this.checkStatus(task) + '\n\n';
			if (option === '1') {
				if (task.title.toLowerCase().indexOf(this.userName) > 0) {
					data += createUrl;
				}
			} else {
        if (task.title.toLowerCase().indexOf(this.userName) > 0) {
					userTickets += createUrl2;
				}else{
          otherTickets += createUrl2;
        }
        data = USERNAME + '\'s Tickets: ' + '\n\n' + userTickets;
        data += 'Other Tickets: ' + '\n\n' + otherTickets;
			}
		});

		const date = new Date().toLocaleDateString().split('/').join('-');
		const textToBLOB = new Blob([data], { type: 'text/plain' });
		const sFileName = `${date}.txt`;

		let newLink = document.createElement('a');
		newLink.download = sFileName;

		if (window.webkitURL !== null) {
			newLink.href = window.webkitURL.createObjectURL(textToBLOB);
		} else {
			newLink.href = window.URL.createObjectURL(textToBLOB);
			newLink.style.display = 'none';
			document.body.appendChild(newLink);
		}
		newLink.click();
	};
}
