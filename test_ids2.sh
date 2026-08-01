test_id() {
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "https://images.unsplash.com/photo-$1")
  echo "$1: $code"
}
test_id "1599557427218-b21950c463f6"
test_id "1610832958506-aa56368176cf"
test_id "1576023307525-4c07b0e258fb"
test_id "1622484211147-3e284090b8f6"
test_id "1567306226416-0963e819b165"
test_id "1587049352847-4d4b1a45ee96"
