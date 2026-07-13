export const roundPKR = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
};

export const stripHtmlText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const planHasFinanceDetails = (plan) => {
  if (!plan) return false;
  const finance = plan.finance || {};
  return Boolean(
    String(finance.bankName || "").trim() || stripHtmlText(finance.financeInfo)
  );
};

export const filterValidPaymentPlans = (plans = []) =>
  (plans || []).filter((plan) => {
    if (!String(plan?.planName || "").trim()) return false;
    if (planHasFinanceDetails(plan) || plan.hasFinance) return true;
    return roundPKR(plan.installmentPrice) > 0 || roundPKR(plan.monthlyInstallment) > 0;
  });

export const isCashOnlySave = (form) => {
  const validPlans = filterValidPaymentPlans(form?.paymentPlans || []);
  if (validPlans.length > 0) return false;
  return roundPKR(form?.price) > 0;
};

const sanitizePlanForApi = (p, cashPrice = 0) => ({
  ...p,
  cashPrice: roundPKR(p.cashPrice) || roundPKR(cashPrice) || 0,
  installmentPrice: roundPKR(p.installmentPrice),
  downPayment: roundPKR(p.downPayment),
  monthlyInstallment: roundPKR(p.monthlyInstallment),
  markup: roundPKR(p.markup),
  totalInterest: roundPKR(p.totalInterest),
  totalCostToCustomer: roundPKR(p.totalCostToCustomer),
});

export const normalizeVariantsForCashSave = (variants, rootPrice, options = {}) => {
  const { cashOnly = false, clearDiscounts = false } = options;
  const list = variants || [];
  if (!list.length) return list;
  const root = roundPKR(rootPrice);
  const syncSingle = (clearDiscounts || cashOnly) && root > 0 && list.length === 1;

  return list.map((v) => {
    const next = { ...v };
    if (clearDiscounts || cashOnly) {
      next.discountPercent = 0;
    }
    if (syncSingle) {
      next.price = root;
    }
    return next;
  });
};

export const buildAgentInstallmentUpdateBody = (form) => {
  const cashOnly = isCashOnlySave(form);
  const explicitPrice = roundPKR(form.price);
  const clearDiscounts = cashOnly || isCashOnlySave(form);
  const variantsForSave = normalizeVariantsForCashSave(form.variants, explicitPrice, {
    cashOnly,
    clearDiscounts,
  });
  const validPlans = cashOnly ? [] : filterValidPaymentPlans(form.paymentPlans || []);

  const paymentPlans = validPlans
    .filter(
      (p) =>
        p.variantIndex === null ||
        p.variantIndex === undefined ||
        p.variantIndex === -1
    )
    .map((p) => sanitizePlanForApi(p, explicitPrice));

  const { paymentPlans: _drop, price: _dropPrice, downpayment: _dropDp, variants: _dropVar, ...rest } = form;

  return {
    ...rest,
    mergePartnerPlans: true,
    category: form.category === "other" ? form.customCategory : form.category,
    price: explicitPrice,
    downpayment: roundPKR(form.downpayment),
    paymentPlans,
    variants: (variantsForSave || []).map((v) => ({
      ...v,
      price: roundPKR(v.price),
      discountPercent: clearDiscounts || cashOnly ? 0 : Number(v.discountPercent) || 0,
      paymentPlans: cashOnly ? [] : v.paymentPlans || [],
    })),
  };
};
