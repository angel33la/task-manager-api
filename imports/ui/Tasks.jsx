import { useEffect, useState } from "react";

export const Tasks = () => {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingFocusTaskId, setPendingFocusTaskId] = useState(null);
  const inputId = "task-title-input";

  const totalCount = tasks.length;
  const finishedCount = tasks.filter((task) => task.completed).length;
  const notStartedCount = totalCount - finishedCount;

  const fetchTasks = async () => {
    try {
      setError("");
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to load tasks");
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (task) => {
    try {
      setError("");
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description || "",
          completed: !task.completed,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");
      const updated = await response.json();
      setTasks((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (err) {
      setError(err.message || "Unable to update task");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setError("");
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      setTasks((current) => current.filter((item) => item._id !== taskId));
    } catch (err) {
      setError(err.message || "Unable to delete task");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    try {
      setError("");
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });
      if (!response.ok) throw new Error("Failed to add task");
      const createdTask = await response.json();
      setTasks((current) => [createdTask, ...current]);
      setPendingFocusTaskId(createdTask._id);
      setTitle("");
    } catch (err) {
      setError(err.message || "Unable to add task");
    }
  };

  useEffect(() => {
    if (!pendingFocusTaskId) return;
    const focusTarget = document.querySelector(
      `[data-task-id="${pendingFocusTaskId}"] .task-toggle-button`,
    );
    if (focusTarget instanceof HTMLElement) {
      focusTarget.focus();
      setPendingFocusTaskId(null);
    }
  }, [pendingFocusTaskId, tasks]);

  return (
    <section
      className="card task-list-card"
      aria-labelledby="task-list-heading"
    >
      <div className="task-list-content">
        <h2 id="task-list-heading" className="task-list-title">
          My Tasks
        </h2>
        {totalCount > 0 ? (
          <>
            <div className="task-stats" role="status" aria-live="polite">
              <span className="task-badge task-badge-done">
                {finishedCount}/{totalCount} done
              </span>
              <span className="task-badge task-badge-pending">
                {notStartedCount} pending
              </span>
            </div>
            <div
              className="progress-bar-track"
              role="progressbar"
              aria-label="Task completion progress"
              aria-valuemin={0}
              aria-valuemax={totalCount}
              aria-valuenow={finishedCount}
            >
              <div
                className="progress-bar-fill"
                style={{ width: `${(finishedCount / totalCount) * 100}%` }}
              />
            </div>
          </>
        ) : null}

        <form className="task-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor={inputId}>
            Task title
          </label>
          <input
            id={inputId}
            className="task-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task"
            required
          />
          <button className="button button-small button-add" type="submit">
            Add Task
          </button>
        </form>

        {error ? (
          <p className="no-tasks-text" role="alert">
            {error}
          </p>
        ) : null}

        {totalCount > 0 && finishedCount === totalCount ? (
          <div className="all-done-banner" role="status" aria-live="polite">
            <span className="all-done-emoji" aria-hidden="true">
              🎉
            </span>
            <p className="all-done-text">Good job! All tasks complete!</p>
            <span className="all-done-emoji" aria-hidden="true">
              ✅
            </span>
          </div>
        ) : null}

        {isLoading ? (
          <p className="no-tasks-text" role="status" aria-live="polite">
            Loading tasks...
          </p>
        ) : tasks.length === 0 ? (
          <p className="no-tasks-text">📋 No tasks yet! Add one above.</p>
        ) : (
          <ul className="task-list" aria-label="Task list" role="list">
            {tasks.map((task) => (
              <li
                key={task._id}
                data-task-id={task._id}
                className={
                  task.completed ? "task-item is-completed" : "task-item"
                }
              >
                <span
                  className={
                    task.completed ? "task-title is-completed" : "task-title"
                  }
                >
                  {task.title}
                </span>
                <div className="task-actions">
                  <button
                    className={
                      task.completed
                        ? "button button-small button-undo task-toggle-button"
                        : "button button-small button-complete task-toggle-button"
                    }
                    type="button"
                    onClick={() => toggleTask(task)}
                    aria-pressed={task.completed}
                    aria-label={`${task.completed ? "Undo completion for" : "Mark as complete"} ${task.title}`}
                  >
                    {task.completed ? "Undo" : "Complete"}
                  </button>
                  <button
                    className="button button-icon button-delete"
                    type="button"
                    onClick={() => deleteTask(task._id)}
                    aria-label={`Delete ${task.title}`}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
