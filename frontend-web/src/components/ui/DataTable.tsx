import React from 'react';
import clsx from 'clsx';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function DataTable<T>({
  columns,
  data,
  onRowClick,
  keyExtractor,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Tidak ada item yang ditemukan dalam daftar ini.',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest',
                  {
                    'text-left': col.align === 'left' || !col.align,
                    'text-center': col.align === 'center',
                    'text-right': col.align === 'right',
                  },
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={clsx(
                'group transition-colors border-b border-gray-50 last:border-none',
                onRowClick ? 'cursor-pointer hover:bg-indigo-50/20' : ''
              )}
            >
              {columns.map((col) => (
                <td
                  key={`${keyExtractor(item)}-${col.key}`}
                  className={clsx(
                    'px-6 py-5 text-sm font-bold text-gray-600 transition-colors',
                    {
                      'text-left': col.align === 'left' || !col.align,
                      'text-center': col.align === 'center',
                      'text-right': col.align === 'right',
                    },
                    onRowClick && 'group-hover:text-indigo-950'
                  )}
                >
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
