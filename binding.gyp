{
  "targets": [
    {
      "target_name": "core",
      "sources": [
        "core.cc"
      ],
      "include_dirs"  : [
            "<!(node -e \"require('nan')\")",
            "libraries": [ "-core" ]
      ],
      "cflags": ["-g"]
    }
  ]
}
