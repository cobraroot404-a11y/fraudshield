export function isTestCheckoutKey(key) {
  return typeof key === "string" && /^rzp_test_[A-Za-z0-9]+$/.test(key);
}
