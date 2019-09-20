#!/usr/bin/env bats

@test "toEqualXML matcher can be used" {
  jest --ci should-pass.test.js
}

@test "toEqualXML matcher fails to match when actual is invalid" {
  run jest --ci invalid-actual-xml.test.js
  [[ $status = 1 ]]
  [[ $output == *"actual value is not valid XML:"* ]]
  [[ $output == *"unexpected end of input"* ]]
}

@test "toEqualXML matcher fails to match when expected is invalid" {
  run jest --ci invalid-expected-xml.test.js
  [[ $status = 1 ]]
  [[ $output == *"expected value is not valid XML:"* ]]
  [[ $output == *"unexpected end of input"* ]]
}
