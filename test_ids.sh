test_id() {
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "https://images.unsplash.com/photo-$1")
  echo "$1: $code"
}

test_id "1513258524456-cc556488737e"
test_id "1580982547038-f1c7d3dbff06"
test_id "1606821469335-5154eb5f7a0b"
test_id "1506484381205-f7945653044d"
test_id "1506084868230-f9660b1d3a16"
test_id "1564834724105-918b73d1b9e0"
test_id "1611078174548-d36c2579df64"
test_id "1512152554763-8a3013ba0c5c"
test_id "1505935428862-770b6aa3205b"
test_id "1600858163539-756087595ea1"
test_id "1550159930-40066082a4fc"
