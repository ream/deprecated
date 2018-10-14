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
[]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP presets/ignore-garbage > routes 1`
] = `
[ { path: '/page', component: '#base/page.vue' } ]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP presets/nested > routes 1`
] = `
[ { path: '/foo/bar/baz/qux',
    component: '#base/foo/bar/baz/qux.vue' } ]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP presets/nested-children > routes 1`
] = `
[ { path: '/foo',
    component: '#base/foo.vue',
    children:
     [ { path: 'bar',
         component: '#base/foo/bar.vue',
         children:
          [ { path: 'baz',
              component: '#base/foo/bar/baz.vue',
              children: [ { path: 'qux', component: '#base/foo/bar/baz/qux.vue' } ] } ] } ] } ]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP presets/typical > routes 1`
] = `
[ { path: '/', component: '#base/index.vue' },
  { path: '/foo', component: '#base/foo.vue' },
  { path: '/user',
    component: '#base/user.vue',
    children:
     [ { path: ':user',
         component: '#base/user/[user].vue',
         children:
          [ { path: '', component: '#base/user/[user]/index.vue' },
            { path: 'friends', component: '#base/user/[user]/friends.vue' } ] } ] } ]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP special/typescript > routes 1`
] = `
[ { path: '/', component: '#base/index.vue' },
  { path: '/page', component: '#base/page.ts' } ]
`

exports[
  `lib/plugins/fs-routes/__test__/routes.test.js TAP special/custom-base-path > routes 1`
] = `
[ { path: '/some/foo', component: '#base/foo.vue' } ]
`
