import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const TodoList = () => {
  const [inputvalue, setInputvalue] = useState(""); // Estado para el input de la nueva tarea
  const [lisTask, setListask] = useState([]); // Estado para almacenar las tareas
  const [editTaskId, setEditTaskId] = useState(null); // Estado para gestionar qué tarea se está editando
  const [editLabel, setEditLabel] = useState(""); // Estado para almacenar el valor de la tarea en edición

  const getlistTodos = async () => {
    try {
      const response = await fetch("https://playground.4geeks.com/todo/users/Anico");
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

      const response = await fetch("https://playground.4geeks.com/todo/todos/Anico", {
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
      setListask(prevlistTaks => {
        const updatedTasks = [...prevlistTaks, result];

        // Mostrar SweetAlert si hay 10 o más tareas
        if (updatedTasks.length === 10) {
          Swal.fire({
            title: '¡Atención!',
            text: '¡Has alcanzado el límite de 10 tareas!',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
          });
        }

        return updatedTasks;
      });

      setInputvalue(""); // Limpiar el input de la nueva tarea

    } catch (error) {
      console.log(error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`https://playground.4geeks.com/todo/todos/${taskId}`, {
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
      setListask(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.log(error);
    }
  };

  const deleteAllTasks = async () => {
    try {
      const promises = lisTask.map(task => 
        fetch(`https://playground.4geeks.com/todo/todos/${task.id}`, {
          method: "DELETE",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        })
      );
      
      // Esperar a que todas las promesas se resuelvan
      await Promise.all(promises);

      // Limpiar la lista de tareas después de eliminarlas todas
      setListask([]);
    } catch (error) {
      console.log("Error al eliminar todas las tareas", error);
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
      // Si el campo de texto está vacío, eliminar la tarea
      deleteTask(editTaskId);
      setEditTaskId(null);
      setEditLabel("");
    }
  };

  const cancelEdit = () => {
    // Limpiar los estados de edición
    setEditTaskId(null);
    setEditLabel("");
  };

  // Filtrar las tareas pendientes (is_done === false)
  const pendingTasks = lisTask.filter(task => !task.is_done);

  useEffect(() => {
    getlistTodos();
  }, []);

  // Detectar el ENTER para guardar tarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      savetask();
    }
  };

  return (
    <div className="todo-list">
      <h1>Mi Lista de Tareas</h1>

      {/* Campo de input para agregar nueva tarea */}
      <input
        value={inputvalue}
        onChange={(event) => setInputvalue(event.target.value)}
        onKeyPress={handleKeyPress} 
        placeholder="Escribe una tarea"
      />

      <div>
        {/* Botón de guardar tarea */}
        <button onClick={savetask} disabled={!inputvalue.trim()}>
          Guardar tarea
        </button>

        {/* Botón de eliminar todas las tareas */}
        <button 
          onClick={deleteAllTasks}
          style={{ backgroundColor: "red", color: "white" }}
        >
          Eliminar todas las tareas
        </button>
      </div>

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
                {/* Botón para guardar edición o eliminar tarea */}
                <button
                  onClick={editTodo}
                  style={{ backgroundColor: editLabel.trim() ? "green" : "red", color: "white" }}
                >
                  {editLabel.trim() ? "Guardar edición" : "Eliminar"}
                </button>
                {/* Botón para cancelar la edición */}
                <button onClick={cancelEdit}>Cancelar</button>
              </div>
            ) : (
              <div>
                <span>{task.label}</span>
                {/* Botón para activar la edición */}
                <button onClick={() => { setEditTaskId(task.id); setEditLabel(task.label); }}>
                  Editar
                </button>
                {/* Botón de eliminar tarea con icono */}
                <button 
                  onClick={() => deleteTask(task.id)}
                  style={{ backgroundColor: "transparent", border: "none", color: "red", fontSize: "20px" }}
                >
                  <i className="fa fa-times" aria-hidden="true"></i> 
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Mostrar cuántas tareas están pendientes */}
      <div>
        {pendingTasks.length === 0 ? (
          <p>No hay tareas pendientes.</p>
        ) : (
          <p>{`Tienes ${pendingTasks.length} tarea${pendingTasks.length > 1 ? 's' : ''} pendiente${pendingTasks.length > 1 ? 's' : ''}.`}</p>
        )}
      </div>
    </div>
  );
};

export default TodoList;
