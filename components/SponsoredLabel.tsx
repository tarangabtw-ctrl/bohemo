interface SponsoredLabelProps {
  compact?: boolean
}

// SPEC.md: sponsored listings sit in their own row outside the ranking,
// labelled "Sponsored · not part of the ranking".
export function SponsoredLabel({ compact = false }: SponsoredLabelProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex h-[22px] items-center rounded-pill border-hairline border-border-strong px-2.5 font-mono text-[11.5px] font-medium uppercase tracking-label text-ink-700">
        Sponsored
      </span>
      {!compact && <span className="text-[12.5px] text-text-muted">Not part of the ranking. It doesn&apos;t change their score.</span>}
    </span>
  )
}
