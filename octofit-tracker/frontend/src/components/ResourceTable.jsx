function displayValue(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(displayValue).join(', ') : '—'
  }

  if (typeof value === 'object') {
    return value.username || value.name || value.title || value._id || JSON.stringify(value)
  }

  return String(value)
}

function ResourceTable({ columns, records }) {
  if (records.length === 0) {
    return (
      <div className="empty-state p-5 text-center">
        <p className="mb-0">No records yet. Check back after data has been added.</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover data-table mb-0">
        <thead className="table-light">
          <tr>
            {columns.map(({ label }) => <th key={label} scope="col">{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record._id || record.id || index}>
              {columns.map(({ key, render }) => (
                <td key={key}>
                  {render ? render(record[key], record) : displayValue(record[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResourceTable
