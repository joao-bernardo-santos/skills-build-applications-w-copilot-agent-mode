import ResourceTable from './ResourceTable.jsx'
import { useCollection } from '../hooks/useCollection.js'

const columns = [
  { key: 'type', label: 'Activity' },
  { key: 'user', label: 'User' },
  { key: 'duration', label: 'Duration (min)' },
  { key: 'distance', label: 'Distance (km)' },
  { key: 'points', label: 'Points' },
  {
    key: 'date',
    label: 'Date',
    render: (value) => value ? new Date(value).toLocaleDateString() : '—',
  },
]

function Activities() {
  const { records, error, isLoading, reload } = useCollection('/api/activities/', fetch)

  return (
    <section aria-labelledby="activities-heading">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <p className="text-success fw-semibold text-uppercase small mb-1">Move more together</p>
          <h1 className="page-heading h2 mb-0" id="activities-heading">Activities</h1>
        </div>
        {!isLoading && !error && <span className="badge text-bg-success">{records.length} activities</span>}
      </div>
      <div className="card data-card">
        {isLoading ? (
          <div aria-live="polite" className="p-5 text-center">
            <div aria-label="Loading activities" className="spinner-border text-success" role="status" />
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

export default Activities
