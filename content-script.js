const languageCommentSigns = { 
  'TypeScript': {
    single: '//',
    multi: '*'
  }
}

const supportedLanguages = Object.keys(languageCommentSigns)

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'); // $& means the whole matched string
}

let regexSingleLine = (sign) => {
  let regex = RegExp(`(${escapeRegExp(sign)}[ \\t]*(${getCommentStylingTagsUnion()})[ \\t]*.+)`)
  
  return regex
}

let regexMultiLine = (sign) => {
  let regex = RegExp(`${escapeRegExp(sign)}([ \\t]*(${getCommentStylingTagsUnion()})[ \\t]*.+)`)

  return regex
}

let getCommentRegex = (language) => {
  let commentSigns = languageCommentSigns[language]

  if (commentSigns === null || commentSigns === undefined) { throw `Unsupported language: ${language}` }

  let regexes = []
  var commentSignsSize = Object.keys(commentSigns).length;
  
  if (commentSignsSize === 2) {
    if ('single' in commentSigns && 'multi' in commentSigns) {
      regexes.push(regexSingleLine(commentSigns['single']))
      regexes.push(regexMultiLine(commentSigns['multi']))
    } else { 
      throw `Unexpected keys: ${commentSigns}`
    } 
  } else if (commentSignsSize === 1) {
    if ('single' in commentSigns) { 
      regexes.push(regexSingleLine(commentSigns['single']))      
    } else if ('multi' in commentSigns) {
      regexes.push(...regexMultiLine(commentSigns['multi']))
    } else {
      throw `Unexpected keys: ${commentSigns}`
    }
  } else {
    throw `Unexpected number of keys: ${commentSignsSize}`
  }

  return regexes
}

const commentStyling = [
  {
    "tag": "!",
    "color": "#FF2D00",
    "strikethrough": false,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "?",
    "color": "#3498DB",
    "strikethrough": false,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "//",
    "color": "#474747",
    "strikethrough": true,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "todo",
    "color": "#FF8C00",
    "strikethrough": false,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  },
  {
    "tag": "*",
    "color": "#98C379",
    "strikethrough": false,
    "underline": false,
    "backgroundColor": "transparent",
    "bold": false,
    "italic": false
  }
]

let getCommentStyling = (tag) => {
  let stylingToReturn = null
  commentStyling.some((styling) => {
    if (styling["tag"] === tag) {
      stylingToReturn = styling
      return true
    }
  })
  return stylingToReturn
} 

let memoCommentStylingTagsUnion = null

let getCommentStylingTagsUnion = () => {
  if (memoCommentStylingTagsUnion !== null) return memoCommentStylingTagsUnion

  let arr = []
  commentStyling.forEach((styling) => {
    arr.push(escapeRegExp(styling["tag"]).toUpperCase())
  })

  memoCommentStylingTagsUnion = arr.join("|")
  return memoCommentStylingTagsUnion
}

let inlineSpanStyle = (styling) => {
  let s = styling
  let textDecoration = 'none'
  if (s["strikethrough"]) {
    textDecoration = 'line-through'
  }
  if (s["underline"]) {
    if (textDecoration === 'none') {
      textDecoration = 'underline'
    } else {
      textDecoration += ` underline`
    }
  } 

  return `
    color: ${s["color"]};
    text-decoration: ${textDecoration}; 
    background-color: ${s["backgroundColor"]}; 
    font-weight: ${s["bold"] ? "bold" : "normal"};
    font-style: ${s["italic"] ? "italic" : "normal"};
  `
}

let main = () => {
  let srcCodeTable = u('div.blob-code-content table')

  if (srcCodeTable.nodes.length != 1) {
    console.log(`Found unexpected number of tables: ${srcCodeTable.nodes.length}. Exiting...`)
    return
  }

  let language = srcCodeTable.first().attributes['data-tagsearch-lang'].value

  if (!supportedLanguages.includes(language)) {
    console.log(`Detected unsupported language: ${language}. Exiting...`)
  }

  u(srcCodeTable).find('tr').each((node, i) => {
    td = u(node).children('td:nth-child(2)')
    html = td.first().innerHTML
    text = td.first().innerText

    getCommentRegex(language).some((regex) => {
      matches = text.match(regex)
      
      if (matches === null) { return false }
      
      let toChange = matches[1]
      let type = matches[2].toLowerCase()
      let styling = getCommentStyling(type)

      toReplace = html.replace(toChange, `<span style="${inlineSpanStyle(styling)}">${toChange}</span>`)
      tdToReplace = td.first()
      tdToReplace.innerHTML = toReplace

      u(node).children('td:nth-child(2)').replace(tdToReplace)

      return true
    })
  })
}

main()