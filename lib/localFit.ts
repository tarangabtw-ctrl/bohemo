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
