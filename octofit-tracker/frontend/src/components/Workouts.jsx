import ResourceTable from './ResourceTable.jsx'
import { useCollection } from '../hooks/useCollection.js'

const columns = [
  { key: 'title', label: 'Workout' },
  { key: 'description', label: 'Description' },
  { key: 'type', label: 'Type' },
  { key: 'duration', label: 'Duration (min)' },
  { key: 'level', label: 'Level' },
]

function Workouts() {
  const { records, error, isLoading, reload } = useCollection('/api/workouts/', fetch)

  return (
    <section aria-labelledby="workouts-heading">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <p className="text-success fw-semibold text-uppercase small mb-1">Find your next challenge</p>
          <h1 className="page-heading h2 mb-0" id="workouts-heading">Workout suggestions</h1>
        </div>
        {!isLoading && !error && <span className="badge text-bg-success">{records.length} workouts</span>}
      </div>
      <div className="card data-card">
        {isLoading ? (
          <div aria-live="polite" className="p-5 text-center">
            <div aria-label="Loading workouts" className="spinner-border text-success" role="status" />
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

export default Workouts
