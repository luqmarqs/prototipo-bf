/**
 * Exportação de leads para CSV e Excel.
 *
 * Ambas as funções usam `buildLeadColumns` para determinar as colunas dinamicamente
 * e `formatLeadValue` para serializar cada célula.
 *
 * O CSV usa separador `;` (padrão pt-BR) e inclui BOM UTF-8 (`\uFEFF`)
 * para garantir que o Excel abra corretamente sem precisar de importação manual.
 *
 * O Excel usa a biblioteca `write-excel-file` carregada dinamicamente (lazy import)
 * para não aumentar o bundle inicial.
 */
import { buildLeadColumns, formatLeadValue } from './leads'

/**
 * Escapa uma célula CSV: envolve em aspas duplas se contiver vírgula, ponto-e-vírgula,
 * quebra de linha ou aspas duplas. Aspas internas são duplicadas conforme RFC 4180.
 *
 * @param {*} value
 * @returns {string}
 */
function escapeCsvCell(value) {
  const serialized = String(value ?? '')

  if (/[",\n;]/.test(serialized)) {
    return `"${serialized.replace(/"/g, '""')}"`
  }

  return serialized
}

/**
 * Gera e faz download de um arquivo CSV com os leads fornecidos.
 *
 * @param {object[]} rows - Array de objetos de lead.
 * @param {string} [filename='leads.csv'] - Nome do arquivo para download.
 * @returns {boolean} `true` se o download foi iniciado, `false` se `rows` estava vazio.
 */
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

/**
 * Gera e faz download de um arquivo Excel (.xlsx) com os leads fornecidos.
 * A biblioteca `write-excel-file` é importada dinamicamente para lazy loading.
 *
 * @param {object[]} rows - Array de objetos de lead.
 * @param {string} [filename='leads.xlsx'] - Nome do arquivo para download.
 * @returns {Promise<boolean>} `true` se o download foi iniciado, `false` se `rows` estava vazio.
 */
export async function exportLeadsToXlsx(rows, filename = 'leads.xlsx') {
  if (!rows.length) return false

  const { default: writeXlsxFile } = await import('write-excel-file/browser')

  const columns = buildLeadColumns(rows)
  const schema = columns.map((column) => ({
    column: column.label,
    type: String,
    value: (row) => String(formatLeadValue(row[column.key], column.key) ?? ''),
  }))

  await writeXlsxFile(rows, {
    schema,
    fileName: filename,
  })

  return true
}
