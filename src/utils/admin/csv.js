import { buildLeadColumns, formatLeadValue } from './leads'

function escapeCsvCell(value) {
  const serialized = String(value ?? '')

  if (/[",\n;]/.test(serialized)) {
    return `"${serialized.replace(/"/g, '""')}"`
  }

  return serialized
}

export function exportLeadsToCsv(rows, filename = 'leads.csv') {
  if (!rows.length) {
    return false
  }

  const columns = buildLeadColumns(rows)
  const header = columns.map((column) => escapeCsvCell(column.label)).join(';')
  const body = rows.map((row) => (
    columns
      .map((column) => escapeCsvCell(formatLeadValue(row[column.key], column.key)))
      .join(';')
  ))

  const csvContent = [header, ...body].join('\n')
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return true
}
