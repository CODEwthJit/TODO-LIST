import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import { getCurrentUser, logout } from './api/auth.js';
import { createTodo, deleteTodo, getTodos, updateTodo } from './api/todos.js';

function App() {
  const [draft, setDraft] = useState('');
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    status: 'all',
    sortBy: 'id',
    order: 'asc',
    page: 1,
    pageSize: 10,
  });
  const [searchDraft, setSearchDraft] = useState('');
  const [pageInfo, setPageInfo] = useState(null);

  async function refreshTodos(options = filters) {
    const result = await getTodos(options);
    setTodos(result.items);
    setPageInfo({
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });

    if (result.page !== options.page) {
      setFilters((current) =>
        current.page === options.page ? { ...current, page: result.page } : current,
      );
    }
  }

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsCheckingSession(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      setPageInfo(null);
      return;
    }

    setIsLoading(true);
    refreshTodos(filters)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [user, filters]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const remainingCount = todos.length - completedCount;
  const hasListFilters = Boolean(filters.q) || filters.status !== 'all';

  function handleSearch(event) {
    event.preventDefault();
    setFilters((current) => ({ ...current, q: searchDraft.trim(), page: 1 }));
  }

  function changeFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const title = draft.trim();
    if (!title) return;

    try {
      await createTodo(title);
      await refreshTodos(filters);
      setDraft('');
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleToggle(todoId) {
    const currentTodo = todos.find((todo) => todo.id === todoId);
    if (!currentTodo) return;

    try {
      await updateTodo(todoId, !currentTodo.completed);
      await refreshTodos(filters);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDelete(todoId) {
    try {
      await deleteTodo(todoId);
      await refreshTodos(filters);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setUser(null);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser);
    setError('');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Todo home">
          <span className="brand-mark" aria-hidden="true">✓</span>
          <span>daymark</span>
        </a>
        <div className="topbar-actions">
          <span className="topbar-note">{user?.email ?? 'A little progress, every day'}</span>
          {user && (
            <button className="logout-button" type="button" onClick={handleLogout}>
              Log out
            </button>
          )}
        </div>
      </header>

      <main className="page-content">
        {isCheckingSession ? (
          <p className="status-message">Checking your session...</p>
        ) : !user ? (
          <>
            {error && <p className="request-error" role="alert">{error}</p>}
            <AuthForm onAuthenticated={handleAuthenticated} />
          </>
        ) : (
          <>
        <section className="welcome-block">
          <p className="eyebrow">YOUR PERSONAL SPACE</p>
          <h1>Make room for <span>what matters.</span></h1>
          <p className="intro">A clear mind starts with one small step.</p>
        </section>

        <section className="todo-panel" aria-label="Your todo list">
          <div className="panel-heading">
            <div>
              <p className="section-label">TODAY</p>
              <h2>Your tasks</h2>
            </div>
                <span className="task-count">{pageInfo?.total ?? 0} results</span>
          </div>

          <form className="add-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="new-todo">Add a task</label>
            <input
              id="new-todo"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="What needs to get done?"
              maxLength={120}
            />
            <button className="add-button" type="submit">
              <span aria-hidden="true">+</span>
              Add task
            </button>
          </form>

              <div className="todo-browse-controls">
                <form className="todo-search" onSubmit={handleSearch}>
                  <label className="sr-only" htmlFor="todo-search">Search todos</label>
                  <input
                    id="todo-search"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Search by title"
                    maxLength={100}
                  />
                  <button className="browse-button" type="submit">Search</button>
                </form>

                <div className="todo-filter-row">
                  <label>
                    Status
                    <select
                      value={filters.status}
                      onChange={(event) => changeFilter('status', event.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                  <label>
                    Sort by
                    <select
                      value={filters.sortBy}
                      onChange={(event) => changeFilter('sortBy', event.target.value)}
                    >
                      <option value="id">Created order</option>
                      <option value="title">Title</option>
                    </select>
                  </label>
                  <label>
                    Direction
                    <select
                      value={filters.order}
                      onChange={(event) => changeFilter('order', event.target.value)}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </label>
                  <label>
                    Per page
                    <select
                      value={filters.pageSize}
                      onChange={(event) => changeFilter('pageSize', Number(event.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </label>
                </div>
              </div>

          {error && <p className="request-error" role="alert">{error}</p>}

          <div className="list-meta" aria-live="polite">
                <span>{remainingCount} active on this page</span>
                <span>{completedCount} completed on this page</span>
          </div>

          {isLoading ? (
            <p className="status-message">Loading tasks...</p>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">✦</span>
                  <p>
                    {pageInfo?.total
                      ? 'No tasks on this page'
                      : hasListFilters
                        ? 'No matching tasks'
                        : 'No tasks yet'}
                  </p>
                  <span>
                    {hasListFilters
                      ? 'Change your search or filters to see other tasks.'
                      : 'Add your first task above and make today count.'}
                  </span>
            </div>
          ) : (
            <ul className="todo-list" aria-label="Todo items">
              {todos.map((todo) => (
                <li
                  className={`todo-item${todo.completed ? ' is-complete' : ''}`}
                  key={todo.id}
                >
                  <label className="todo-label">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo.id)}
                    />
                    <span className="checkmark" aria-hidden="true" />
                    <span className="todo-title">{todo.title}</span>
                  </label>
                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => handleDelete(todo.id)}
                    aria-label={`Delete ${todo.title}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

              {pageInfo?.totalPages > 0 && (
                <div className="pagination-controls" aria-label="Todo pages">
                  <span>Page {pageInfo.page} of {pageInfo.totalPages}</span>
                  <div>
                    <button
                      className="browse-button"
                      type="button"
                      disabled={pageInfo.page <= 1}
                      onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
                    >
                      Previous
                    </button>
                    <button
                      className="browse-button"
                      type="button"
                      disabled={pageInfo.page >= pageInfo.totalPages}
                      onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
        </section>

        <footer className="page-footer">Small steps add up.</footer>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
