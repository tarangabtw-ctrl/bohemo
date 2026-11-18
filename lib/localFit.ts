import type { Tool } from '@/types'

export type FitStatus = 'pass' | 'fail' | 'unchecked'

export interface FitCriterion {
  label: string
  status: FitStatus
}

export interface LocalFit {
  criteria: FitCriterion[]
  dots: boolean[]
  confirmed: number
  notCheckedYet: number
}

function arrayStatus(value: string[] | null): FitStatus {
  if (value === null || value === undefined) return 'unchecked'
  return value.length > 0 ? 'pass' : 'fail'
}

function boolStatus(value: boolean | null): FitStatus {
  if (value === null || value === undefined) return 'unchecked'
  return value ? 'pass' : 'fail'
}

function objectStatus(value: Record<string, unknown> | null): FitStatus {
  if (value === null || value === undefined) return 'unchecked'
  return Object.keys(value).length > 0 ? 'pass' : 'fail'
}

function dataInRegionStatus(regions: string[] | null, marketId: string): FitStatus {
  if (regions === null || regions === undefined) return 'unchecked'
  if (regions.length === 0) return 'fail'
  return regions.map((r) => r.toLowerCase()).includes(marketId.toLowerCase()) ? 'pass' : 'fail'
}

/**
 * Local Fit: 5 criteria, one dot each. NULL = not checked yet (empty dot, counted
 * separately). false / empty array = checked and fails (empty dot, NOT counted as
 * "not checked yet"). data_regions is matched against the reader's market, not a
 * global yes/no.
 */
export function computeLocalFit(tool: Tool, marketId: string, marketName: string): LocalFit {
  const criteria: FitCriterion[] = [
    { label: 'Languages listed', status: arrayStatus(tool.languages) },
    { label: 'Local payment methods', status: arrayStatus(tool.payment_methods) },
    { label: 'Local pricing', status: objectStatus(tool.local_pricing) },
    { label: 'Works on low bandwidth', status: boolStatus(tool.low_bandwidth) },
    { label: `Data stored in ${marketName}`, status: dataInRegionStatus(tool.data_regions, marketId) },
  ]
  const confirmed = criteria.filter((c) => c.status === 'pass').length
  const notCheckedYet = criteria.filter((c) => c.status === 'unchecked').length
  const dots = criteria.map((c) => c.status === 'pass')
  return { criteria, dots, confirmed, notCheckedYet }
}

/** One line per criterion for the tool page and Compare, written only from the tool's own data. */
export function localFitNotes(tool: Tool, marketId: string, marketName: string): string[] {
  const fit = computeLocalFit(tool, marketId, marketName)
  const [lang, pay, price, bandwidth, data] = fit.criteria.map((c) => c.status)
  const pricingKeys = tool.local_pricing ? Object.keys(tool.local_pricing) : []
  return [
    lang === 'pass'
      ? `Lists ${(tool.languages ?? []).join(', ')}.`
      : lang === 'fail'
        ? 'We checked. It lists no local languages.'
        : 'We have not checked which languages it speaks.',
    pay === 'pass'
      ? `Takes ${(tool.payment_methods ?? []).join(', ')}.`
      : pay === 'fail'
        ? 'We checked. It takes no local payment methods.'
        : 'We have not checked which payment methods it takes.',
    price === 'pass'
      ? `Priced in ${pricingKeys.join(', ')}.`
      : price === 'fail'
        ? 'We checked. It has no local-currency pricing.'
        : 'We have not checked its local-currency pricing.',
    bandwidth === 'pass'
      ? 'Works on a low-end Android phone and a slow connection.'
      : bandwidth === 'fail'
        ? 'We checked. It struggles on a low-end phone or a slow connection.'
        : 'We have not tested it on a low-end Android phone or a slow connection.',
    data === 'pass'
      ? `Stores data in ${marketName}.`
      : data === 'fail'
        ? `We checked. It does not store data in ${marketName}.`
        : 'We have not checked where it stores data.',
  ]
}

export const FIT_STATUS_LABEL: Record<FitStatus, string> = {
  pass: 'Confirmed',
  fail: 'Checked · no',
  unchecked: 'Not checked yet',
}
