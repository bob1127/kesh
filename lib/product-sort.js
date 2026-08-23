export function isTestCheckoutProduct(product) {
  if (!product) return false;
  if (product.handle === "test-payment-10") return true;
  if (product.slug === "test-payment-10") return true;
  return product.metadata?.test_checkout_product === true;
}

/** 測試商品永遠排在列表最後 */
export function compareWithTestProductsLast(compareFn) {
  return (a, b) => {
    const aTest = isTestCheckoutProduct(a);
    const bTest = isTestCheckoutProduct(b);
    if (aTest && !bTest) return 1;
    if (!aTest && bTest) return -1;
    return compareFn(a, b);
  };
}

export function moveTestProductsToEnd(list) {
  const regular = [];
  const test = [];
  for (const item of list) {
    (isTestCheckoutProduct(item) ? test : regular).push(item);
  }
  return [...regular, ...test];
}
