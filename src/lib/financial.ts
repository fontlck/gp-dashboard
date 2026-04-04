// Financial calculation engine for GP Dashboard

export interface SalesData {
  grossSales: number
  refunds: number
  revenueSharePercent: number
  isVatRegistered: boolean
  companyVatRegistered: boolean
}

export function calculateNetSales(gross: number, refunds: number): number {
  return gross - refunds
}

export function calculateVAT(amount: number, isVatRegistered: boolean): number {
  if (!isVatRegistered) return 0
  return amount * 7 / 107 // Thai VAT 7% inclusive
}

export function calculateGrossProfit(netSales: number): number {
  return netSales
}

export function calculatePartnerEarnings(
  netGrossProfit: number,
  revenueSharePercent: number
): number {
  return netGrossProfit * (revenueSharePercent / 100)
}

export function calculateFullReport(data: SalesData) {
  const netSales = calculateNetSales(data.grossSales, data.refunds)
  const vat = calculateVAT(netSales, data.companyVatRegistered)
  const netAfterVat = netSales - vat
  const partnerEarnings = calculatePartnerEarnings(netAfterVat, data.revenueSharePercent)
  const partnerVat = calculateVAT(partnerEarnings, data.isVatRegistered)

  return {
    grossSales: data.grossSales,
    refunds: data.refunds,
    netSales,
    vat,
    netAfterVat,
    partnerEarnings,
    partnerVat,
    partnerNet: partnerEarnings - partnerVat,
  }
}
