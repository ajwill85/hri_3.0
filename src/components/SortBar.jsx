import { ArrowUpDown } from 'lucide-react'

function SortBar({ sortBy, onSortChange }) {
  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'source', label: 'By Source' },
    { value: 'title', label: 'By Title' },
  ]

  return (
    <div className="sort-bar">
      <div className="sort-wrapper">
        <ArrowUpDown className="sort-icon" size={18} />
        <label htmlFor="sort-select" className="sort-label">Sort by:</label>
        <select
          id="sort-select"
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default SortBar
