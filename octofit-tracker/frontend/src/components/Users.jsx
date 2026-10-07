import ResourceTable from './ResourceTable.jsx'
import { useCollection } from '../hooks/useCollection.js'

const columns = [
  {
    key: 'firstName',
    label: 'Name',
    render: (_value, user) => [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '—',
  },
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'team', label: 'Team' },
]

function Users() {
  const { records, error, isLoading, reload } = useCollection('/api/users/', fetch)

  return (
    <section aria-labelledby="users-heading">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <p className="text-success fw-semibold text-uppercase small mb-1">Meet your fitness crew</p>
          <h1 className="page-heading h2 mb-0" id="users-heading">Athletes</h1>
        </div>
        {!isLoading && !error && <span className="badge text-bg-success">{records.length} athletes</span>}
      </div>
      <div className="card data-card">
        {isLoading ? (
          <div aria-live="polite" className="p-5 text-center">
            <div aria-label="Loading athletes" className="spinner-border text-success" role="status" />
          </div>
        ) : error ? (
          <div className="alert alert-danger m-3" role="alert">
            <p>{error}</p>
            <button className="btn btn-outline-danger btn-sm" onClick={reload} type="button">Try again</button>
          </div>
        ) : <ResourceTable columns={columns} records={records} />}
      </div>
    </section>
  )
}

export default Users
