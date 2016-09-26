var assert = require("power-assert");
var parser = require("../dist/b");

describe("Empty string", function(){
  it("is empty", function(){
    assert.deepEqual(parser.parse(""), []);
  });
});

describe("line: ", function(){
  describe("Non EOL string", function(){
    it("is one line", function(){
      assert.deepEqual(parser.parse("test"), [
        {type: "line", value: [{type:"pure_string",value:"test"}]}
      ]);
    });
  });
  describe("One EOL string", function(){
    describe("not having next charactor", function(){
      it("is one line", function(){
        assert.deepEqual(parser.parse("test\n"), [
          {type: "line", value: [{type:"pure_string",value:"test"}]}
        ]);
      })
    });
    describe("having next charactor", function(){
      it("is two line", function(){
        assert.deepEqual(parser.parse("test\ntest"), [
          {type: "line", value: [{type:"pure_string",value:"test"}]},
          {type: "line", value: [{type:"pure_string",value:"test"}]}
        ]);
      });
    })
  });
});

describe("code_block: ", function(){
  describe("Surrounded lines by ", function(){
    describe("only '{code}' of line and only '{/code}' of line", function(){
      describe("'{/code} has EOL'", function(){
        it("is code block", function(){
          assert.deepEqual(parser.parse("{code}\ntest\n{/code}\n"), [
            {"type":"code_block","value":"test\n"}
          ]);
        });
      });
      describe("'{/code} don't have EOL (if EOI)", function(){
        it("is code block", function(){
          assert.deepEqual(parser.parse("{code}\ntest\n{/code}"), [
            {"type":"code_block","value":"test\n"}
          ]);
        });
      });
      describe("if '{/code}{code}' is included", function(){
        it("'{/code}{code}' is contents of code_block", function(){
          assert.deepEqual(parser.parse("{code}\nfoo\n{/code}{code}\nbar\n{/code}"), [
            {type: "code_block", value: "foo\n{/code}{code}\nbar\n"}
          ]);

        });
      });
    });
    describe("not only '{code}' of line and only '{/code}' of line", function(){
      it("isn't code block", function(){
        assert.deepEqual(parser.parse("xx{code}\ntest\n{/code}"), [
          {type: "line", value: [{type: "pure_string", value: "xx{code}"}]},
          {type: "line", value: [{type: "pure_string", value: "test"}]},
          {type: "line", value: [{type: "pure_string", value:"{/code}"}]}
        ]);
      });
    });
    describe("only '{code}' of line and not only'{/code}' of line", function(){
      it("isn't code block", function(){
        assert.deepEqual(parser.parse("{code}\ntest\nxx{/code}"), [
          {type: "line", value: [{type: "pure_string", value: "{code}"}]},
          {type: "line", value: [{type: "pure_string", value: "test"}]},
          {type: "line", value: [{type: "pure_string", value: "xx{/code}"}]}
        ]);
      });
    });
  });
});

describe("bold: ", function(){
  describe("Surrounded string by '**' and '**'", function(){
    describe("and surrouned string don't have EOL", function(){
      it("is bold sentence", function(){
        assert.deepEqual(parser.parse("This is a **Bold test**."), [{
          type: "line",
          value: [
            {type: "pure_string", value:"This is a "},
            {type: "bold", value: "Bold test"},
            {type: "pure_string", value:"."}
          ]
        }]);
      });
    });
    describe("and surrounded string has EOL", function(){
      it("isn't blod sentence", function(){
        assert.deepEqual(parser.parse("This is a **Bold\n test**."), [
          {type: "line", value: [{type: "pure_string", value: "This is a **Bold"}]},
          {type: "line", value: [{type: "pure_string", value:" test**."}]}
        ]);
      });
    });
  });
});


describe("chapter: ", function(){
  describe("First of line is", function(){
    describe("one or more '*' and ' ' ", function(){
      it("is chapter", function(){
        assert.deepEqual(parser.parse("** **test**test\n ** test"), [
          {
            type: "chapter",
            value: {
              type: "line",
              value: [
                {type: "bold", value: "test"},
                {type: "pure_string", value: "test"}
              ]
            },
            level:2
          },
          {type: "line", value: [{type: "pure_string", value:" ** test"}]}
        ]);
      });
    });
    describe("non space after one or more '*'", function(){
      it("isn't chapter", function(){
        assert.deepEqual(parser.parse("**test"), [
          {type: "line", value: [{type: "pure_string", value: "**test"}]}
        ]);
      })
    })
  });
});

describe("list: ", function(){
  describe("First of line is ", function(){
    describe("one or mode '-' and ' '", function(){
      it("is list", function(){
        assert.deepEqual(parser.parse("- foo\n-- bar\n--- baz\n - test"), [
          {
            type: "list_block",
            value: [
              {type: "list_line", value: {type: "line", value: [{type: "pure_string", value: "foo"}]}, level: 1},
              {type: "list_line", value: {type: "line", value: [{type: "pure_string", value: "bar"}]}, level: 2},
              {type: "list_line", value: {type: "line", value: [{type: "pure_string", value: "baz"}]}, level: 3}
            ]
          },
          {type: "line", value: [{type: "pure_string", value: " - test"}]}
        ]);
      });
    });
    describe("non space after one or more '-'", function(){
      it("isn't list", function(){
        assert.deepEqual(parser.parse("-foo\n-- bar\n--- baz\n - test"), [
          {type: "line", value: [{type: "pure_string", value: "-foo"}]},
          {
            type: "list_block",
            value: [
              {type: "list_line", value: {type: "line", value: [{type: "pure_string", value: "bar"}]}, level: 2},
              {type: "list_line", value: {type: "line", value: [{type: "pure_string", value: "baz"}]}, level: 3}
            ]
          },
          {type: "line", value: [{type: "pure_string", value: " - test"}]}
        ]);
      });
    });
  });
});
