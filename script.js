import Dexie from 'https://cdn.skypack.dev/dexie';

// Configuración de IndexedDB usando Dexie
const db = new Dexie('todoDatabase');
db.version(1).stores({
    tasks: '++id, data'
});

// Renderiza las tareas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
});

// Captura el formulario de añadir tarea
const form = document.getElementById('add-task-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const taskContent = form.elements['task'].value;
    if (taskContent.trim() === '') return;

    const newTask = { content: taskContent, completed: false }; // Estructura dinámica
    await addTask(newTask);
    form.reset();
    await renderTasks(); // Vuelve a renderizar las tareas
});

// Función para añadir una nueva tarea en IndexedDB
async function addTask(taskData) {
    await db.tasks.add({ data: taskData });
}

// Función para obtener y renderizar todas las tareas
async function renderTasks() {
    const tasks = await db.tasks.toArray();
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = ''; // Limpiar la lista antes de renderizar

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.id = `task-${task.id}`;
        li.innerHTML = `
            <span class="task-content">${task.data.content}</span>
            <button class="edit-btn" onclick="editTask(${task.id}, '${task.data.content}')">Editar</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Eliminar</button>
        `;
        tasksList.appendChild(li);
    });
}

// Función para eliminar una tarea
window.deleteTask = async (id) => {
    await db.tasks.delete(id);
    await renderTasks(); // Volver a renderizar las tareas
};

// Función para editar una tarea
window.editTask = (id, currentContent) => {
    const li = document.getElementById(`task-${id}`);
    li.innerHTML = `
        <input type="text" class="edit-input" value="${currentContent}" />
        <button class="save-btn" onclick="saveTask(${id})">Guardar</button>
        <button class="cancel-btn" onclick="renderTasks()">Cancelar</button>
    `;
};

// Función para guardar la tarea editada
window.saveTask = async (id) => {
    const li = document.getElementById(`task-${id}`);
    const newContent = li.querySelector('.edit-input').value;

    if (newContent.trim() === '') return;

    // Actualizar la tarea en IndexedDB
    await db.tasks.update(id, { data: { content: newContent, completed: false } });
    await renderTasks(); // Volver a renderizar la lista de tareas
};
