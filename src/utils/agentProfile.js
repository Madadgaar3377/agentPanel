/**
 * Check if agent has completed required profile fields (UserSchema: phoneNumber, WhatsappNumber, Address, cnicNumber, idCardPic, BankAccountinfo).
 */
export function isAgentProfileComplete(user) {
  if (!user) return false;
  const trim = (v) => (typeof v === "string" ? v.trim() : "");
  const hasPhone = trim(user.phoneNumber).length > 0;
  const hasWhatsApp = trim(user.WhatsappNumber).length > 0;
  const hasAddress = trim(user.Address).length > 0;
  const hasCnic = trim(user.cnicNumber).length > 0 && trim(user.cnicNumber) !== "123-456-789";
  const hasIdCardPic = trim(user.idCardPic).length > 0;
  const bank = user.BankAccountinfo;
  const hasBank =
    Array.isArray(bank) &&
    bank.length > 0 &&
    bank.some(
      (b) =>
        trim(b.accountNumber).length > 0 &&
        trim(b.accountName).length > 0 &&
        trim(b.bankName).length > 0
    );
  return hasPhone && hasWhatsApp && hasAddress && hasCnic && hasIdCardPic && hasBank;
}
