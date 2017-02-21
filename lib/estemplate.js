const types = require('./operatorPrecedence')
let estemplate = {}

const extractExpr = token => token !== undefined && token.type === 'ExpressionStatement' ? token.expression : token

estemplate.error = msg => (
  {
    'type': 'ExpressionStatement',
    'expression': {
      'type': 'CallExpression',
      'callee': {
        'type': 'MemberExpression',
        'computed': false,
        'object': {
          'type': 'Identifier',
          'name': 'console'
        },
        'property': {
          'type': 'Identifier',
          'name': 'log'
        }
      },
      'arguments': [
        {
          'type': 'Literal',
          'value': msg,
          'raw': msg
        }
      ]
    }
  }
)

estemplate.power = (base, exponent) => (
  {
    'type': 'CallExpression',
    'sType': 'number',
    'isPower': true,
    'callee': {
      'type': 'MemberExpression',
      'computed': false,
      'object': {
        'type': 'Identifier',
        'name': 'Math'
      },
      'property': {
        'type': 'Identifier',
        'name': 'pow'
      }
    },
    'arguments': [base, exponent]
  }
)

const typeEqual = (first, second) => first.sType === second.sType

estemplate.concat = (val, arg) => (
  {
    'type': 'CallExpression',
    'sType': typeEqual(val, arg) && val.sType === 'string' ? 'string' : 'list',
    'callee': {
      'type': 'MemberExpression',
      'computed': false,
      'object': val,
      'property': {
        'type': 'Identifier',
        'name': 'concat'
      }
    },
    'arguments': [arg]
  }
)

estemplate.ast = () =>
  ({type: 'Program', body: [], sourceType: 'script'})

estemplate.literal = value =>
  ({type: 'Literal', value: Number(value), raw: value, sType: 'number'})

estemplate.nullLiteral = value =>
  ({type: 'Literal', value: null, raw: value, sType: 'needsInference'})

estemplate.boolLiteral = value =>
    ({type: 'Literal', value: !(value === 'false'), raw: value, sType: 'bool'})

estemplate.stringLiteral = value =>
  ({type: 'Literal', value: value, raw: value, sType: 'string'})

estemplate.identifier = value =>
  ({type: 'Identifier', name: value})

estemplate.declaration = (id, val) => ({
  type: 'VariableDeclaration',
  declarations: [
    {
      type: 'VariableDeclarator',
      id,
      init: extractExpr(val)
    }
  ],
  kind: 'const'
})

estemplate.funcDeclaration = (id, params, body) =>
  ({
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id,
        init: {
          type: 'ArrowFunctionExpression',
          id: null,
          params: params,
          body: extractExpr(body) || '',
          generator: false,
          expression: true
        }
      }
    ],
    kind: 'const'
  })

estemplate.lambdaCall = (params, args, body) =>
  ({
    type: 'CallExpression',
    callee: {
      'type': 'ArrowFunctionExpression',
      id: null,
      params: params,
      body: extractExpr(body) || '',
      generator: false,
      expression: true
    },
    arguments: args.map(extractExpr)
  }
  )

estemplate.letExpression = (params, args, body) =>
  ({
    type: 'CallExpression',
    callee: {
      'type': 'ArrowFunctionExpression',
      id: null,
      params: params,
      body: extractExpr(body) || '',
      generator: false,
      expression: true
    },
    arguments: args.map(extractExpr)
  }
  )

estemplate.memberExpression = (obj, prop) =>
  ({
    type: 'ExpressionStatement',
    expression: {
      type: 'MemberExpression',
      computed: false,
      object: extractExpr(obj),
      property: extractExpr(prop)
    }
  })

estemplate.subscriptExpression = (obj, prop) =>
  ({
    type: 'ExpressionStatement',
    expression: {
      type: 'MemberExpression',
      computed: true,
      object: extractExpr(obj),
      property: extractExpr(prop)
    }
  })

estemplate.fnCall = (val, args) => val.name === 'print' ? estemplate.printexpression(args)
  : ({type: 'CallExpression', callee: extractExpr(val), arguments: args.map(extractExpr)})

estemplate.lambda = (params, body) =>
  ({
    type: 'ExpressionStatement',
    expression: {
      type: 'ArrowFunctionExpression',
      id: null,
      params,
      body: extractExpr(body) || '',
      generator: false,
      expression: true
    }
  })

estemplate.binaryExpression = (left, op, right) => {
  let opType = types[op].type
  if (op === '^') return estemplate.power(left, right)
  if (op === '++') return binaryExpr(left, '+', right, opType)
  if (op === '==') return binaryExpr(left, '===', right, opType)
  if (op === '!=') return binaryExpr(left, '!==', right, opType)
  return binaryExpr(left, op, right, opType)
}

const binaryExpr = (left, op, right, opType) => ({
  type: 'BinaryExpression',
  operator: op,
  sType: opType,
  left: extractExpr(left),
  right: extractExpr(right)
})

estemplate.printexpression = (args) => ({
  'type': 'ExpressionStatement',
  'expression': {
    'type': 'CallExpression',
    'callee': {
      'type': 'MemberExpression',
      'computed': false,
      'object': {
        'type': 'Identifier',
        'name': 'console'
      },
      'property': {
        'type': 'Identifier',
        'name': 'log'
      }
    },
    'arguments': args.map(arg => extractExpr(arg))
  }
})

estemplate.unaryExpression = (op, arg) => (
  {
    type: 'UnaryExpression',
    operator: op,
    argument: extractExpr(arg),
    prefix: true
  }
)

estemplate.blockStmt = body => ({
  'type': 'BlockStatement',
  'body': body
})

estemplate.ifthenelse = (condition, result1, result2) => ({
  'type': 'ExpressionStatement',
  'expression': {
    'type': 'ConditionalExpression',
    'test': extractExpr(condition),
    'consequent': extractExpr(result1),
    'alternate': extractExpr(result2)
  }
})

estemplate.array = elements => ({'type': 'ArrayExpression', elements})

estemplate.object = value => ({
  'type': 'ObjectExpression',
  'properties': extractExpr(value)
})

estemplate.objectProperty = (key, val) => ({
  'type': 'Property',
  'key': key,
  'computed': false,
  'value': extractExpr(val),
  'kind': 'init',
  'method': false,
  'shorthand': false
})

estemplate.comment = (type, val) => ({
  'type': type,
  'value': val
})

/*  Module Exports estemplate  */
module.exports = estemplate