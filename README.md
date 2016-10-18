# zenscript
A typeclass based language that compiles to JavaScript


Starting with a program in a file ending '.zs':
```js
let id2 = (x) =>
    let id = (x) => (x,x)
    let id3 = (x) => id(x)
    let y = id(x)
    return id3(y)
id2(42)
```
Compile using:
```
node src/compiler.js t1.zs
```
This will output a JavaScript file called t1.js
```js
var id2 = function(x) {
   var id = function(x) {
      return [x/*{x : t0} t0*/ , x/*{x : t1} t1*/ ]/*{x : t0 & t1} Product<t0, t1>*/ ;
   };
   var id3 = function(x) {
      return id/*{id : t2} t2*/ (x/*{x : t3} t3*/ )/*{x : t3} Product<t3>*/ ;
   };
   var y = id/*{id : t4} t4*/ (x/*{x : t5} t5*/ )/*{x : t5} Product<t5>*/ ;
   return id3/*{id3 : t6} t6*/ (y/*{y : t7} t7*/ )/*{y : t7} Product<t7>*/ ;
};
id2/*{id2 : t8} t8*/ (42/*Int*/ )/*Product<Int>*/ 
```
and dump the AST into t1.ast.
```json
{
  "status": true,
  "value": {
    "tag": "block",
    "statements": [
      {
        "tag": "declaration",
        "name": "id2",
        "expression": {
          "tag": "function",
          "name": "",
          "args": [
            "x"
          ],
          "body": {
            "tag": "block",
            "statements": [
              {
                "tag": "declaration",
                "name": "id",
                "expression": {
                  "tag": "function",
                  "name": "",
                  "args": [
                    "x"
                  ],
                  "body": {
                    "tag": "return",
                    "expression": {
                      "tag": "literal_tuple",
                      "expressions": [
                        {
                          "tag": "variable",
                          "name": "x",
                          "typing": {
                            "tag": "typing",
                            "context": {
                              "x": [
                                {
                                  "tag": "type_variable",
                                  "id": 0
                                }
                              ]
                            },
                            "type": {
                              "tag": "type_variable",
                              "id": 0
                            }
                          }
                        },
                        {
                          "tag": "variable",
                          "name": "x",
                          "typing": {
                            "tag": "typing",
                            "context": {
                              "x": [
                                {
                                  "tag": "type_variable",
                                  "id": 1
                                }
                              ]
                            },
                            "type": {
                              "tag": "type_variable",
                              "id": 1
                            }
                          }
                        }
                      ],
                      "typing": {
                        "tag": "typing",
                        "context": {
                          "x": [
                            {
                              "tag": "type_variable",
                              "id": 0
                            },
                            {
                              "tag": "type_variable",
                              "id": 1
                            }
                          ]
                        },
                        "type": {
                          "tag": "type_constructor",
                          "constructor": "Product",
                          "params": [
                            {
                              "tag": "type_variable",
                              "id": 0
                            },
                            {
                              "tag": "type_variable",
                              "id": 1
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              {
                "tag": "declaration",
                "name": "id3",
                "expression": {
                  "tag": "function",
                  "name": "",
                  "args": [
                    "x"
                  ],
                  "body": {
                    "tag": "return",
                    "expression": {
                      "tag": "application",
                      "fun": {
                        "tag": "variable",
                        "name": "id",
                        "typing": {
                          "tag": "typing",
                          "context": {
                            "id": [
                              {
                                "tag": "type_variable",
                                "id": 2
                              }
                            ]
                          },
                          "type": {
                            "tag": "type_variable",
                            "id": 2
                          }
                        }
                      },
                      "arg": {
                        "tag": "literal_tuple",
                        "expressions": [
                          {
                            "tag": "variable",
                            "name": "x",
                            "typing": {
                              "tag": "typing",
                              "context": {
                                "x": [
                                  {
                                    "tag": "type_variable",
                                    "id": 3
                                  }
                                ]
                              },
                              "type": {
                                "tag": "type_variable",
                                "id": 3
                              }
                            }
                          }
                        ],
                        "typing": {
                          "tag": "typing",
                          "context": {
                            "x": [
                              {
                                "tag": "type_variable",
                                "id": 3
                              }
                            ]
                          },
                          "type": {
                            "tag": "type_constructor",
                            "constructor": "Product",
                            "params": [
                              {
                                "tag": "type_variable",
                                "id": 3
                              }
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              },
              {
                "tag": "declaration",
                "name": "y",
                "expression": {
                  "tag": "application",
                  "fun": {
                    "tag": "variable",
                    "name": "id",
                    "typing": {
                      "tag": "typing",
                      "context": {
                        "id": [
                          {
                            "tag": "type_variable",
                            "id": 4
                          }
                        ]
                      },
                      "type": {
                        "tag": "type_variable",
                        "id": 4
                      }
                    }
                  },
                  "arg": {
                    "tag": "literal_tuple",
                    "expressions": [
                      {
                        "tag": "variable",
                        "name": "x",
                        "typing": {
                          "tag": "typing",
                          "context": {
                            "x": [
                              {
                                "tag": "type_variable",
                                "id": 5
                              }
                            ]
                          },
                          "type": {
                            "tag": "type_variable",
                            "id": 5
                          }
                        }
                      }
                    ],
                    "typing": {
                      "tag": "typing",
                      "context": {
                        "x": [
                          {
                            "tag": "type_variable",
                            "id": 5
                          }
                        ]
                      },
                      "type": {
                        "tag": "type_constructor",
                        "constructor": "Product",
                        "params": [
                          {
                            "tag": "type_variable",
                            "id": 5
                          }
                        ]
                      }
                    }
                  }
                }
              },
              {
                "tag": "return",
                "expression": {
                  "tag": "application",
                  "fun": {
                    "tag": "variable",
                    "name": "id3",
                    "typing": {
                      "tag": "typing",
                      "context": {
                        "id3": [
                          {
                            "tag": "type_variable",
                            "id": 6
                          }
                        ]
                      },
                      "type": {
                        "tag": "type_variable",
                        "id": 6
                      }
                    }
                  },
                  "arg": {
                    "tag": "literal_tuple",
                    "expressions": [
                      {
                        "tag": "variable",
                        "name": "y",
                        "typing": {
                          "tag": "typing",
                          "context": {
                            "y": [
                              {
                                "tag": "type_variable",
                                "id": 7
                              }
                            ]
                          },
                          "type": {
                            "tag": "type_variable",
                            "id": 7
                          }
                        }
                      }
                    ],
                    "typing": {
                      "tag": "typing",
                      "context": {
                        "y": [
                          {
                            "tag": "type_variable",
                            "id": 7
                          }
                        ]
                      },
                      "type": {
                        "tag": "type_constructor",
                        "constructor": "Product",
                        "params": [
                          {
                            "tag": "type_variable",
                            "id": 7
                          }
                        ]
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      },
      {
        "tag": "application",
        "fun": {
          "tag": "variable",
          "name": "id2",
          "typing": {
            "tag": "typing",
            "context": {
              "id2": [
                {
                  "tag": "type_variable",
                  "id": 8
                }
              ]
            },
            "type": {
              "tag": "type_variable",
              "id": 8
            }
          }
        },
        "arg": {
          "tag": "literal_tuple",
          "expressions": [
            {
              "tag": "literal_int",
              "value": 42,
              "typing": {
                "tag": "typing",
                "context": {},
                "type": {
                  "tag": "type_constructor",
                  "constructor": "Int",
                  "params": []
                }
              }
            }
          ],
          "typing": {
            "tag": "typing",
            "context": {},
            "type": {
              "tag": "type_constructor",
              "constructor": "Product",
              "params": [
                {
                  "tag": "type_constructor",
                  "constructor": "Int",
                  "params": []
                }
              ]
            }
          }
        }
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
[ [ 42, 42 ], [ 42, 42 ] ]
```
