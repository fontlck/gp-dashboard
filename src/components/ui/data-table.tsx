'use client'

interface DataTableProps {
  columns: string[]
  data: any[]
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-800">
            {columns.map((col) => (
              <th key={col} className="text-zinc-400 text-sm font-medium py-3 px-4">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
              {columns.map((col) => (
                <td key={col} className="text-white py-3 px-4">{row[col] ?? '-'}</td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-zinc-400 text-center py-8">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
