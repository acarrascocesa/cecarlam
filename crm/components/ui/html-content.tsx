"use client"

import React from 'react'

interface HtmlContentProps {
  content: string
  className?: string
}

export function HtmlContent({ content, className }: HtmlContentProps) {
  return (
    <div 
      className={`prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
