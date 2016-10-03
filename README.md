# zenscript
A trait based language that compiles to JavaScript


Starting with a program in a file ending '.zs':
```js
let id2 = (x) =>
    let id = (x) => x
    let y = id(x)
    return y
id2(42)
```
Compile using:
```
node src/compiler.js t1.zs
```
This will output a JavaScript file called t1.js
```js
var id2=function (x){var id=function (x){return x;};var y=id(x);return y;};id2(42);
```
and dump the AST into t1.ast.
```json
{
  "status": true,
  "value": {
    "blk": [
      {
        "decl": "id2",
        "exp": {
          "fn": "",
          "args": [
            "x"
          ],
          "body": {
            "blk": [
              {
                "decl": "id",
                "exp": {
                  "fn": "",
                  "args": [
                    "x"
                  ],
                  "body": {
                    "rtn": {
                      "var": "x"
                    }
                  }
                }
              },
              {
                "decl": "y",
                "exp": {
                  "app": "id",
                  "args": [
                    {
                      "var": "x"
                    }
                  ]
                }
              },
              {
                "rtn": {
                  "var": "y"
                }
              }
            ]
          }
        }
      },
      {
        "app": "id2",
        "args": [
          {
            "lit": 42
          }
        ]
      }
    ]
  }
}
```
You can then evaluate the program using:
```
node src/eval.js t1.js
```
This program should return:
```
42
```
