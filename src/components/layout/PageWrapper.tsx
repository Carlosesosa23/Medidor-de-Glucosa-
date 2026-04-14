import type { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  title?: string
  subtitle?: string
  action?: ReactNode
}

export function PageWrapper({ children, title, subtitle, action }: PageWrapperProps) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto pb-6 bg-[#f8f9fa]">
      {(title || action) && (
        <header className="px-6 pt-14 pb-4 bg-[#f8f9fa]">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h1
                  className="text-2xl font-extrabold tracking-tight text-[#191c1d]"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-[#40493d] font-medium mt-0.5">{subtitle}</p>
              )}
            </div>
            {action && <div className="mt-1">{action}</div>}
          </div>
        </header>
      )}
      <div className="flex-1 px-5">
        {children}
      </div>
    </div>
  )
}
