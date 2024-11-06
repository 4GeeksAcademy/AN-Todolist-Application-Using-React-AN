import React, { useEffect, useState } from 'react';

const TodoList = () => {
  const [inputvalue, setInputvalue] = useState(""); // Estado para el input de la nueva tarea
  const [lisTask, setListask] = useState([]); // Estado para almacenar las tareas
  const [editTaskId, setEditTaskId] = useState(null); // Estado para gestionar qué tarea se está editando
  const [editLabel, setEditLabel] = useState(""); // Estado para almacenar el valor de la tarea en edición

  const getlistTodos = async () => {
    try {
      const response = await fetch("https://playground.4geeks.com/todo/users/AlanNico");
      const result = await response.json();
      setListask(result.todos);
    } catch (error) {
      console.log(error);
    }
  };

  const savetask = async () => {
    if (!inputvalue.trim()) return; // Evitar tareas vacías

    try {
      const tasktosend = {
        "label": inputvalue,
        "is_done": false
      };

      const response = await fetch("https://playground.4geeks.com/todo/todos/AlanNico", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(tasktosend)
      });

      if (!response.ok) {
        alert("Hubo un error al crear la tarea");
        return;
      }

      const result = await response.json();
      setListask(prevlistTaks => [...prevlistTaks, result]);
      setInputvalue(""); // Limpiar el input de la nueva tarea

    } catch (error) {
      console.log(error);
    }
  };

  const editTodo = async () => {
    if (editLabel.trim()) {
      // Si hay texto en el campo de edición, actualizamos la tarea
      try {
        const body = {
          "label": editLabel,
          "is_done": false
        };

        const response = await fetch(`https://playground.4geeks.com/todo/todos/${editTaskId}`, {
          method: "PUT",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          alert("No se pudo editar la tarea");
          return;
        }

        const result = await response.json();

        // Actualizar la lista de tareas con la tarea editada
        setListask(prevTasks =>
          prevTasks.map(task =>
            task.id === editTaskId ? { ...task, label: result.label } : task
          )
        );

        // Limpiar el estado de edición
        setEditTaskId(null);
        setEditLabel("");

      } catch (error) {
        console.log(error);
      }
    } else {
      // Si el campo está vacío, eliminamos la tarea
      try {
        const response = await fetch(`https://playground.4geeks.com/todo/todos/${editTaskId}`, {
          method: "DELETE",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          alert("No se pudo eliminar la tarea");
          return;
        }

        // Actualizamos el estado para eliminar la tarea de la lista
        setListask(prevTasks => prevTasks.filter(task => task.id !== editTaskId));

        // Limpiar el estado de edición
        setEditTaskId(null);
        setEditLabel("");

      } catch (error) {
        console.log(error);
      }
    }
  };

  const cancelEdit = () => {
    // Limpiar los estados de edición
    setEditTaskId(null);
    setEditLabel("");
  };

  useEffect(() => {
    getlistTodos();
  }, []);

  return (
    <div className="todo-list">
      <h1>Mi Lista de Tareas</h1>

      {/* Campo de input para agregar nueva tarea */}
      <input
        value={inputvalue}
        onChange={(event) => setInputvalue(event.target.value)}
        placeholder="Escribe una tarea"
      />
      <button onClick={savetask} disabled={!inputvalue.trim()}>
        Guardar tarea
      </button>

      {/* Mostrar las tareas */}
      <ul>
        {lisTask.map((task) => (
          <li key={task.id}>
            {/* Si estamos editando esta tarea, mostrar el campo de input para editar */}
            {editTaskId === task.id ? (
              <div>
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="Edita la tarea"
                />
                <button onClick={editTodo}>
                  {editLabel.trim() ? "Guardar edición" : "Eliminar"}
                </button>
                <button onClick={cancelEdit}>Cancelar</button>
              </div>
            ) : (
              <div>
                <span>{task.label}</span>
                <button onClick={() => { setEditTaskId(task.id); setEditLabel(task.label); }}>
                  Editar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
