{
  function node(type, value, option) {
    var o = {type: type, value: value};
    return option ? Object.assign(o, option) : o;
  }

  function code_block(value) {
    return node("code_block", value);
  }

  function quate_block(value) {
    return node("quate_block", value);
  }

  function line(value) {
    return node("line", value)
  }

  function bold(value) {
    return node("bold", value);
  }

  function pure_string(value) {
    return node("pure_string", value);
  }

  function chapter(value, level) {
    return node("chapter", value, {level: level});
  }

  function list_line(value, level) {
    return node("list_line", value, {level: level});
  }

  function list_block(value) {
    return node("list_block", value);
  }
}

start
  = (chapter / block / line)*

// - block
block = code_block / list_block
//    - code block
code_block = code_start code_str:$(!code_end line:$((!EOL .)* EOL) {return line})* code_end {
  return code_block(code_str);
}
code_start = "{code}" _* EOL
code_end = "{/code}" _* EOL_or_EOI
//    - list
list_block = lines:list_line+ {
  return list_block(lines);
}
list_line = list_indent:list_mark+ _ l:line {return list_line(l, list_indent.length)}
list_mark = "-"

// line
line = strings:string_without_eol+ EOL_or_EOI {return line(strings)}
//    - string without eol
string_without_eol = bold / pure_string
//    - bold
bold = bold_mark str:$(!bold_mark !EOL ch:. {return ch})* bold_mark {
  return bold(str)
}
bold_mark = "**"
//    - pure string
pure_string = str:$(!EOL !bold .)+ {return pure_string(str)}

chapter
  = chapter_indent:chapter_mark+ _+ l:line {
    return chapter(l, chapter_indent.length);
  }

chapter_mark
  = "*"

// util
EOL = "\r\n" / "\n" / "\r"
_ = " "
EOL_or_EOI = !(!EOL .) EOL?
