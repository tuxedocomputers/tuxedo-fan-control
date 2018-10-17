{
  "targets": [
    {
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "include_dirs" : [
          "native",
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "target_name": "ec_access",
      "sources": [ "./native/ec_access.cc" ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }
  ]
}
