import { ActionFunc, ActionDescription, ActionResult, Chain } from '..'
import { staticTree, executeTree } from '..'

function sync (name: string) {
  let action: ActionFunc = () => {}
  action.displayName = name
  return action
}
function async (name: string) {
  let action = sync(name)
  action.async = true
  return action
}

let signalChain: Chain = [
  sync('a'),
  async('b'), {
    'foo': [ sync('b.foo.a'), async('b.foo.b') ],
    'bar': [ sync('b.bar.a'), async('b.bar.b') ]
  },
  [
    // [ sync('error') ],
    // sync('c'), runtime error
    async('d'), {
      'foo': [ sync('d.foo.a'), async('d.foo.b') ],
      'bar': [ sync('d.bar.a'), async('d.bar.b'), {
        'foo': [ sync('d.bar.b.foo.a'), async('d.bar.b.foo.b') ],
        'bar': [ sync('d.bar.b.bar.a'), async('d.bar.b.bar.b') ]
      } ]
    },
    async('e'),
    async('f')
  ],
  // { 'foo': [] } // runtime error only
]

let tree = staticTree(signalChain)

function runAction (action: ActionDescription, payload: any, next: (result: ActionResult<any>) => void): void {
  let result: ActionResult<any> = {
    payload: {}
  }
  payload.actions.push(action.name)
  if (action.outputs) {
    result.path = 'bar'
  }
  if (action.isAsync) {
    setTimeout(() => next(result))
  } else {
    next(result)
  }
}

executeTree(tree.tree, runAction, { foo: 'bar', actions: [] }, (result) => {
  console.log(JSON.stringify(result, null, 2))
})
