// Get references to elements
const taskInput = document.getElementById('taskInput');
const taskCategory = document.getElementById('taskCategory');
const taskDate = document.getElementById('taskDate');
const taskPriority = document.getElementById('taskPriority');
const taskList = document.getElementById('taskList');
const addTaskButton = document.getElementById('addTask');
const searchTasksInput = document.getElementById('searchTasks');
const clearTasksButton = document.getElementById('clearTasks');
const themeToggle = document.getElementById('themeToggle');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// Load tasks and theme on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateProgress();
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});

// Add a new task
addTaskButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const newTask = {
            text: taskText,
            completed: false,
            category: taskCategory.value,
            dueDate: taskDate.value,
            priority: taskPriority.value,
        };
        addTaskToUI(newTask);
        saveTask(newTask);
        taskInput.value = '';
        taskDate.value = '';
        updateProgress();
    }
});

// Search tasks
searchTasksInput.addEventListener('input', () => {
    const query = searchTasksInput.value.toLowerCase();
    const tasks = document.querySelectorAll('#taskList li');
    tasks.forEach(task => {
        const taskText = task.querySelector('.task-text').textContent.toLowerCase();
        task.style.display = taskText.includes(query) ? '' : 'none';
    });
});

// Clear all tasks
clearTasksButton.addEventListener('click', () => {
    localStorage.removeItem('tasks');
    taskList.innerHTML = '';
    updateProgress();
});

// Functions
function addTaskToUI(task) {
    const taskItem = document.createElement('li');
    taskItem.className = `${task.priority}-priority`;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        updateTaskStatus(task.text, checkbox.checked);
        taskItem.classList.toggle('completed', task.completed);
        updateProgress();
    });

    // Task text
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;

    // Category
    const categoryText = document.createElement('span');
    categoryText.className = 'task-category';
    categoryText.textContent = ` (${task.category})`;

    // Due date
    const dueDateText = document.createElement('span');
    dueDateText.className = 'task-due-date';
    dueDateText.textContent = task.dueDate ? ` (Due: ${task.dueDate})` : '';

    // Edit button
    const editButton = createButton('Edit', () => {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = task.text;
        taskItem.replaceChild(editInput, taskText);

        editInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                task.text = editInput.value.trim();
                taskText.textContent = task.text;
                taskItem.replaceChild(taskText, editInput);
                updateTask(task);
            }
        });
    });

    // Delete button
    const deleteButton = createButton('Delete', () => {
        taskList.removeChild(taskItem);
        deleteTask(task.text);
        updateProgress();
    });

    taskItem.append(checkbox, taskText, categoryText, dueDateText, editButton, deleteButton);

    // Add 'completed' class if the task is completed
    if (task.completed) taskItem.classList.add('completed');

    taskList.appendChild(taskItem);
}

function saveTask(task) {
    const tasks = getTasksFromStorage();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = getTasksFromStorage();
    tasks.forEach(addTaskToUI);
}

function updateTaskStatus(taskText, completed) {
    const tasks = getTasksFromStorage();
    const updatedTasks = tasks.map(task =>
        task.text === taskText ? { ...task, completed } : task
    );
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function deleteTask(taskText) {
    const tasks = getTasksFromStorage();
    const updatedTasks = tasks.filter(task => task.text !== taskText);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function updateTask(updatedTask) {
    const tasks = getTasksFromStorage();
    const updatedTasks = tasks.map(task =>
        task.text === updatedTask.text ? updatedTask : task
    );
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

function updateProgress() {
    const tasks = getTasksFromStorage();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    progressBar.value = progress;
    progressText.textContent = `${progress}% Completed`;
}

function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}
// Get reference to the sorting dropdown
const sortTasksDropdown = document.getElementById('sortTasks');

// Event listener for sorting tasks
sortTasksDropdown.addEventListener('change', function () {
    const sortCriteria = sortTasksDropdown.value; // Get selected sorting criteria
    sortTasks(sortCriteria);
});

// Function to sort tasks
function sortTasks(criteria) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Sort tasks based on the selected criteria
    if (criteria === 'priority') {
        tasks.sort((a, b) => {
            const priorities = { high: 3, medium: 2, low: 1 };
            return priorities[b.priority] - priorities[a.priority];
        });
    } else if (criteria === 'dueDate') {
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (criteria === 'alphabetical') {
        tasks.sort((a, b) => a.text.localeCompare(b.text));
    }

    // Save sorted tasks back to local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Clear the UI and re-render sorted tasks
    taskList.innerHTML = '';
    tasks.forEach(task => addTask(task));
}
// Function to group tasks by category and display them
function displayTasksByCategory(tasks) {
    const taskGroups = document.getElementById('taskGroups');
    taskGroups.innerHTML = ''; // Clear the container

    const categories = [...new Set(tasks.map(task => task.category))]; // Unique categories

    categories.forEach(category => {
        // Create a category section
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        // Create a category header (collapsible toggle)
        const categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category;
        categoryHeader.classList.add('category-header');
        categoryHeader.addEventListener('click', () => {
            categoryTasks.classList.toggle('hidden'); // Toggle visibility
        });

        // Create a list for tasks in this category
        const categoryTasks = document.createElement('ul');
        categoryTasks.classList.add('category-tasks');

        // Add tasks belonging to this category
        tasks.filter(task => task.category === category).forEach(task => {
            const taskElement = createTaskElement(task); // Reuse task creation logic
            categoryTasks.appendChild(taskElement);
        });

        categoryContainer.appendChild(categoryHeader);
        categoryContainer.appendChild(categoryTasks);
        taskGroups.appendChild(categoryContainer);
    });
}

// Function to create a task element (reusable for grouping and regular list)
function createTaskElement(task) {
    const newTask = document.createElement('li');

    // Add a checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        toggleTaskStatus(task.text, checkbox.checked);
        newTask.classList.toggle('completed', checkbox.checked);
    });

    // Task text
    const taskText = document.createElement('span');
    taskText.textContent = task.text;
    taskText.style.marginLeft = '10px';

    // Due date and category
    const dueDateText = document.createElement('span');
    dueDateText.textContent = task.dueDate ? ` (Due: ${task.dueDate})` : '';
    dueDateText.style.marginLeft = '10px';
    dueDateText.style.color = 'gray';

    // Edit and Delete Buttons
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editTask(task, newTask, taskText));

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        deleteTask(task.text);
        newTask.remove();
        updateTasksByCategory();
    });

    newTask.appendChild(checkbox);
    newTask.appendChild(taskText);
    newTask.appendChild(dueDateText);
    newTask.appendChild(editButton);
    newTask.appendChild(deleteButton);

    if (task.completed) newTask.classList.add('completed');
    return newTask;
}

// Load tasks and display them by category
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    displayTasksByCategory(tasks);
}

// Save task and refresh categories
function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasksByCategory(tasks); // Refresh the grouped tasks
}

// Update tasks grouped by category after deletion or modification
function updateTasksByCategory() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    displayTasksByCategory(tasks);
}
// Initialize Chart.js
let progressChart;

function initializeChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'line', // Choose 'line' or 'bar'
        data: {
            labels: [], // Days (e.g., ["2024-12-01", "2024-12-02"])
            datasets: [
                {
                    label: 'Tasks Completed',
                    data: [], // Number of tasks completed each day
                    borderColor: 'blue',
                    backgroundColor: 'lightblue',
                    borderWidth: 2,
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
            },
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Tasks Completed' },
                },
            },
        },
    });
}

// Update Chart Data
function updateChartData() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const completionData = {};

    // Count completed tasks per day
    tasks.forEach(task => {
        if (task.completed) {
            const completedDate = task.completedDate || task.addedDate;
            completionData[completedDate] = (completionData[completedDate] || 0) + 1;
        }
    });

    // Sort data by date
    const sortedDates = Object.keys(completionData).sort();
    const completedCounts = sortedDates.map(date => completionData[date]);

    // Update the chart
    progressChart.data.labels = sortedDates;
    progressChart.data.datasets[0].data = completedCounts;
    progressChart.update();
}

// Mark task as completed and track completion date
function toggleTaskStatus(taskText, isCompleted) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.text === taskText);
    if (task) {
        task.completed = isCompleted;
        if (isCompleted) {
            task.completedDate = new Date().toISOString().split('T')[0]; // Store completion date
        } else {
            delete task.completedDate; // Remove completion date if unchecked
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateChartData(); // Update the chart
    }
}

// Call initializeChart when the page loads
window.onload = () => {
    initializeChart();
    loadTasks();
    updateChartData();
};
function addTask() {
    const taskText = document.getElementById('taskInput').value;
    const priority = document.getElementById('priority').value;
    const category = document.getElementById('category').value;
    const dueDate = document.getElementById('dueDate').value;

    if (taskText) {
        const newTask = {
            text: taskText,
            priority: priority,
            category: category,
            dueDate: dueDate,
            completed: false,
            addedDate: new Date().toISOString().split('T')[0], // Add current date
        };

        saveTask(newTask);
        document.getElementById('taskInput').value = ''; // Clear input
    }
}
// Sign Up
function signup() {
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            alert("Signup successful! Welcome, " + userCredential.user.email);
        })
        .catch(error => alert(error.message));
}

// Log In
function login() {
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            alert("Login successful! Welcome back, " + userCredential.user.email);
        })
        .catch(error => alert(error.message));
}

// Log Out
function logout() {
    auth.signOut()
        .then(() => alert("Logged out successfully!"))
        .catch(error => alert(error.message));
}

// Detect Auth State
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User logged in:", user.email);
        // Load user's tasks from Firestore
        loadTasksFromFirestore(user.uid);
    } else {
        console.log("No user logged in.");
    }
});
// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBnwDFtG5KWU9sO6tBwtR5GGcnJxvvrEkE",
    authDomain: "studystructure-devansht.firebaseapp.com",
    projectId: "studystructure-devansht",
    storageBucket: "studystructure-devansht.appspot.com",
    messagingSenderId: "469340751931",
    appId: "1:469340751931:web:8bc112665181280635341e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize authentication
const db = getFirestore(app); // Initialize Firestore
// Save task to Firestore
async function saveTask(task) {
    const user = auth.currentUser;
    if (user) {
        try {
            await db.collection('tasks').doc(user.uid).collection('userTasks').add(task);
            console.log("Task saved to Firestore!");
            loadTasksFromFirestore(user.uid);
        } catch (error) {
            console.error("Error saving task:", error);
        }
    } else {
        alert("You must be logged in to save tasks!");
    }
}
// Load tasks from Firestore
async function loadTasksFromFirestore(userId) {
    try {
        const snapshot = await db.collection('tasks').doc(userId).collection('userTasks').get();
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTasks(tasks);
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

// Render tasks in UI
function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Clear current tasks

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.text; // Display task text
        taskList.appendChild(li);
    });
}
// Update a task in Firestore
async function updateTask(taskId, updatedTask) {
    const user = auth.currentUser;
    if (user) {
        try {
            await db.collection('tasks').doc(user.uid).collection('userTasks').doc(taskId).update(updatedTask);
            console.log("Task updated!");
            loadTasksFromFirestore(user.uid);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    }
}
// Delete a task in Firestore
async function deleteTask(taskId) {
    const user = auth.currentUser;
    if (user) {
        try {
            await db.collection('tasks').doc(user.uid).collection('userTasks').doc(taskId).delete();
            console.log("Task deleted!");
            loadTasksFromFirestore(user.uid);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }
}
toggleLink.addEventListener("click", () => {
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? "Log In" : "Sign Up";
    authBtn.textContent = isLogin ? "Log In" : "Sign Up";
    toggleLink.textContent = isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In";
});
