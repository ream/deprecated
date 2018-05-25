module.exports = ({ headTags, scripts }) => `
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui" />
    ${headTags()}
  </head>
  <body>
    <!--ream-root-placeholder-->
    ${scripts()}
  </body>
</html>
`
