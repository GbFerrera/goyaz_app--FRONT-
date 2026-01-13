

export function Title({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  )
}