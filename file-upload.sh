docker run --rm \
  -v appgwalletnodescom_usdt_upload_files:/from \
  -v cdngwalletnodescom_cdn_files:/to \
  busybox sh -c "cp -r /from/* /to/"
