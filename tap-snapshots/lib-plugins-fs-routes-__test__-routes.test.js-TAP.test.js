/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP presets/empty > routes 1`
] = `
Array []
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP presets/ignore-garbage > routes 1`
] = `
Array [
  Object {
    "path": "/page",
    "component": "#base/page.vue",
  },
]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP presets/nested > routes 1`
] = `
Array [
  Object {
    "path": "/foo/bar/baz/qux",
    "component": "#base/foo/bar/baz/qux.vue",
  },
]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP presets/nested-children > routes 1`
] = `
Array [
  Object {
    "path": "/foo",
    "component": "#base/foo.vue",
    "children": Array [
      Object {
        "path": "bar",
        "component": "#base/foo/bar.vue",
        "children": Array [
          Object {
            "path": "baz",
            "component": "#base/foo/bar/baz.vue",
            "children": Array [
              Object {
                "path": "qux",
                "component": "#base/foo/bar/baz/qux.vue",
              },
            ],
          },
        ],
      },
    ],
  },
]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP presets/typical > routes 1`
] = `
Array [
  Object {
    "path": "/",
    "component": "#base/index.vue",
  },
  Object {
    "path": "/foo",
    "component": "#base/foo.vue",
  },
  Object {
    "path": "/user",
    "component": "#base/user.vue",
    "children": Array [
      Object {
        "path": ":user",
        "component": "#base/user/[user].vue",
        "children": Array [
          Object {
            "path": "",
            "component": "#base/user/[user]/index.vue",
          },
          Object {
            "path": "friends",
            "component": "#base/user/[user]/friends.vue",
          },
        ],
      },
    ],
  },
]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP special/custom-base-path > routes 1`
] = `
Array [
  Object {
    "path": "/some/foo",
    "component": "#base/foo.vue",
  },
]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP special/typescript > routes 1`
] = `
Array [
  Object {
    "path": "/",
    "component": "#base/index.vue",
  },
  Object {
    "path": "/page",
    "component": "#base/page.ts",
  },
]
`
