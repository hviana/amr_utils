# amr_utils

Library for manipulating Abstract Meaning Representation (AMR) graphs

## How to use

This library has useful methods to process the understanding of human language,
with emphasis on the methods `joinGraph`, `searchPattern` and `search`.
Examples:

```typescript
const graph1 = await NLP.parse("mary is cool");
/*
{
  c: [ [ ":instance", "cool-04" ], [ ":ARG1", "p" ] ],
  p: [ [ ":instance", "person" ], [ ":name", "n" ] ],
  n: [ [ ":instance", "name" ], [ ":op1", '"mary"' ] ]
}
 */
const graph2 = await NLP.parse("joe is ugly");
/*
{
  u: [ [ ":instance", "ugly" ], [ ":domain", "p" ] ],
  p: [ [ ":instance", "person" ], [ ":name", "n" ] ],
  n: [ [ ":instance", "name" ], [ ":op1", '"Joe"' ] ]
}

 */
const merged_graph = utils.joinGraph(graph1, {
  graph: graph2,
  mode: "merge",
  rangeIds: ["p"], //starts operation on node 'p'
}, ["p"]);
/*
{
  c: [ [ ":instance", "cool-04" ], [ ":ARG1", "p" ] ],
  p: [ [ ":name", "a" ], [ ":instance", "person" ] ],
  a: [ [ ":instance", "and" ], [ ":op1", "n" ], [ ":op2", "n1" ] ],
  n: [ [ ":instance", "name" ], [ ":op1", '"mary"' ] ],
  n1: [ [ ":instance", "name" ], [ ":op1", '"Joe"' ] ]
}
 */
```

See the documentation:

```typescript
  /**
   * Performs the following operations on graphs: 'append', 'replace' and 'merge'.
   * @param {graph} AMRGraph, the main graph that will be used in the operation.
   * @param {piece} GraphPiece, The other graph that will be 'joined' to the main graph
   * given an operation, the parameters of this interface are:
   * 'graph' => the graph itself.
   * 'rangeIds' => an array of 2 positions (start node and end node), if not specified both
   *          will be the root; if only rangeIds[0] is not specified,
   *          it will assume the value of rangeIds[1].
   * 'relations' => a 2-position vector, it's the "glue" relationships
   *          for the "append" operation, the input relationship and (optionally)
   *          the output relationship.
   * 'mode' => operation type, accepts the values: 'append', 'replace' and 'merge'.
   * 'joinEntity' => entity used to 'join' nodes, if not specified, the entity
   *          'and' will be used.
   * 'joinRel' => relation used to 'join' nodes, if not specified, the relation
   *          ':op' will be used.
   * 'isJoinable' => optional, a function "(id1:string, id2:string, graph:AMRGraph, utils: AMRUtils) => boolean",
   *          must return true if the two nodes are joinable.
   * @param {rangeIds} string[], an array of 2 positions (start node and end node),
   * if not specified both will be the root; if only rangeIds[0] is not specified,
   * it will assume the value of rangeIds[1].
   * @param {algParams} AlgParams, the algorithm parameters. Identifies "non-joinable"
   *  relationships and entities. Accepts regular expressions and strings. if not specified:
   * 'notJoinableRelations' => [/^:instance$/].
   * 'notJoinableEntities' => [/^name$/].
   * @return {{graph:AMRGraph;map:{[key:string]:string}}} The new graph generated given the operations,
   *          and the map which maps the old ids of the joined graph to the new ids in the new graph.
   */
  joinGraph(
    graph: AMRGraph,
    piece: GraphPiece,
    rangeIds?: [string, string?],
    algParams?: AlgParams,
  ): AMRGraph

  /**
   * Does a heuristic search of the graph based on a pattern,
   * which pattern is a graph and a reference (id / amr var name) to an a usually "amr-unknown" instance node.
   * Each possible answer has a score, the higher the better.
   * @param {graph} AMRGraph, the graph.
   * @param {patternGraph} AMRGraph, the graph representing a pattern.
   * @param {patternFindId} string, optional, pattern graph id to look for, if not specified, look for instance nodes "amr-unknown".
   * @param {getScores} boolean, optional, if true, returns the scores of the nodes found; default true.
   * @param {func} ScoreFunc optional, a function "(id1:string, id2:string, graph:AMRGraph, patternGraph: AMRGraph, utils: AMRUtils) => number",
   *          returns the score of 2 nodes, larger values ​​represent a more relevant pattern,
   *          return 0 if there is no pattern, this optimizes the algorithm.
   * @return {ScoreResultOrString[]} An ordered list with the results.
   */
  searchPattern(
    graph: AMRGraph,
    patternGraph: AMRGraph,
    patternFindId: string,
    getScores: boolean = true,
    func?: ScoreFunc,
  ): ScoreResult[] | string[]

  /**
   *  Performs a search given a condition, based on the types
   *  of relationships and instances of the graph, returning
   *  the nodes/ids (names of AMR variables) that match
   *  the condition. The search is done starting with the "root"
   *  parameter. The first id is returned given the minimum search
   *  depth, this gives an idea of ​​"context" given the specified root.
   *  If you want to search the entire depth of the graph,
   *  you need to pass the argument fullSearch=true.
   * @param {graph} AMRGraph, the graph.
   * @param {subjectInstance} stringOrRegExp, subject instance name (ex: "person"), can be empty.
   * @param {predicate} stringOrRegExp, predicate name (ex: ":mod"), can be empty.
   * @param {objectInstance} stringOrRegExp, subject instance name (ex: "name"), can be empty.
   * @param {root} AMRGraph, search start node, if it is empty it will start at the root.
   * @param {fullSearch} boolean, search full graph depth.
   * @param {func} SearchFunc optional, a function "(parent:string,relation:string,child:string,graph:AMRGraph,utils:AMRUtils)=>string[]",
   *                          the function need to return found ids.
   *                          This search still considers the previous parameters like "subjectInstance" and so on;
   *                          if you want to ignore them, you can pass the value "" in these parameters.
   * @return {string[]} the ids that satisfy the condition given the minimum search depth.
   */
  search(
    graph: AMRGraph,
    subjectInstance?: (RegExp | string),
    predicate?: (RegExp | string),
    objectInstance?: (RegExp | string),
    root?: string,
    fullSearch?: boolean,
  ): string[]

   /**
   * Returns a subgraph from a starting node (id), to an ending node (endId if it exists).
   * @param {graph} AMRGraph, the graph.
   * @param {id} string, start of subgraph.
   * @param {endId} string, end of subgraph, optional.
   * @return {AMRGraph} the subgraph.
   */
  subGraphAt(
    graph: AMRGraph,
    id: string,
    endId?: string,
  ): AMRGraph

  /**
   * Finds the id (name of the AMR variable) of the root of a graph.
   * @param {graph} AMRGraph, the graph.
   * @return {string} the id value of the root of a graph.
   */
  rootId(graph: AMRGraph): string

  /**
   * Returns a graph with a single node given an instance name.
   * @param {instance} string, instance name.
   * @return {AMRGraph} the graph.
   */
  createInstance(instance: string): AMRGraph

  /**
   * clone a graph.
   * @param {graphs} AMRGraph[], Graph that will be cloned.
   * @return {AMRGraph} the clone.
   */
  clone(graph: AMRGraph): AMRGraph

  /**
   * Clone N graphs.
   * @param {graphs} AMRGraph[], Graphs that will be cloned.
   * @return {AMRGraph[]} the clones.
   */
  cloneN(graphs: AMRGraph[]): AMRGraph[]

  /**
   * Convert triples to an AMR graph instance from the library.
   * @param {triples} Triple[], triples, in the form: [['s','p','o'],...].
   * @return {AMRGraph} AMR graph instance.
   */
  triplesToAMRGraph(triples: Triple[]): AMRGraph

  /**
   * Convert AMR graph instance from the library to the triples.
   * @param {AMRGraph[]} AMRGraph instance.
   * @return {Triple[]} triples, in the form: [['s','p','o'],...].
   */
  AMRGraphToTriples(graph: AMRGraph): Triple[]

  /**
   * Returns the instance name of a node.
   * @param {graph} AMRGraph instance.
   * @param {id} string, id/var name of node.
   * @return {string} instance name.
   */
  instanceOf(graph: AMRGraph, id: string): string

  /**
   * Finds the parents of a node.
   * @param {graph} AMRGraph, the graph.
   * @param {id} string, the id value of the node.
   * @param {predicate} stringOrRegExp, optional, relationship name.
   * @return {string[]} the parents.
   */
  parentsOf(graph: AMRGraph, id: string, predicate?: string | RegExp): string[]
  
  /**
   * Finds the childs of a node.
   * @param {graph} AMRGraph, the graph.
   * @param {id} string, the id value of the node.
   * @param {predicate} stringOrRegExp, optional, relationship name.
   * @param {ignoreInstance} boolean, if true, ignore instance child node.
   * @return {string[]} the childs.
   */
  childsOf(
    graph: AMRGraph,
    id: string,
    predicate?: string | RegExp,
    ignoreInstance?: boolean,
  ): string[]

  /**
   * Transforms a string into an array of words.
   * @param {input} string, text input.
   * @return {string[]} array of words.
   */
  tokenize(input: string): string[]

  /**
   * Transforms a string into an array of name leafs.
   * @param {input} string, text input.
   * @return {string[]} array with name leafs.
   */
  tokenizeName(input: string): string[] {
    return this.tokenize(input).map((p) => `\"${p}\"`);
  }

  /**
   * Create a list-type AMR node.
   * @param {ops} StringOrAMRGraph[], child nodes.
   * @param {instance} string, instance type, ex: "and", "or", "multi-sentence".
   * @param {rel} string, relation name, ex: ":op", ":sn".
   * @return {AMRGraph} a graph with the list node.
   */
  createListNode(
    ops: (string | AMRGraph)[],
    instance: string,
    rel: string,
  ): AMRGraph

  /**
   * Adds new elements to an existing list node.
   * @param {ops} StringOrAMRGraph[], child nodes.
   * @param {graph} AMRGraph, the graph.
   * @param {id} string, the id value of the list node, If empty, use the root node.
   * @param {rel} string, relation name, ex: ":op", ":sn", If empty,
   * check what type of relationship exists for its child nodes.
   */
  appendListNode(
    ops: (string | AMRGraph)[],
    graph: AMRGraph,
    id?: string,
    rel?: string,
  ): void
  
  /**
   * Returns possible reifications based on a semantic relationship.
   * @param {relation} string, relation name.
   * @return {stringOrRegExp[]} Possible reifications.
   */
  reificationFromRelation(relation: string): (string | RegExp)[]
  
  /**
   * Returns possible semantic relationships based on an reification instance type.
   * @param {instance} string, instance name.
   * @return {stringOrRegExp[]} Possible relations.
   */
  relationFromReification(instance: string): (string | RegExp)[]
```

There is also a collection of other simpler methods for manipulating AMR Graphs.
All are documented in the code and are self explanatory.

## Communicating with Python

You can create a python server to do deep learning processing and communicate
with your application, see the example:

In python:

```python
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import penman
import amrlib

stog = amrlib.load_stog_model('models/stog')
gtos = amrlib.load_gtos_model('models/gtos')

port = 41425

class NLPHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        data_string = self.rfile.read(int(self.headers.get('content-length')))
        data = json.loads(data_string);
        res=None
        if "text" in data:
                res = penman.decode(stog.parse_sents([data["text"]])[0]).triples;
        elif "graph" in data:
                res, _ = gtos.generate([penman.encode(penman.Graph(data["graph"]), indent=None)])
                res = res[0]
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps({"res":res}).encode('utf-8'))
        return
server_object = HTTPServer(server_address=('', port), RequestHandlerClass=NLPHandler)
print('starting NLP core at port: '+str(port))
server_object.serve_forever()
```

In application:

```typescript
import {
  AMRGraph,
  AMRUtils,
} from "https://raw.githubusercontent.com/hviana/amr_utils/main/mod.ts";

export default class NLP {
  static utils = new AMRUtils();
  static url = "http://localhost:41425";
  static async #post(data: any): Promise<any> {
    return (await (await fetch(NLP.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    })).json()).res;
  }
  static async gen(graph: AMRGraph): Promise<string> {
    return await this.#post({ graph: NLP.utils.AMRGraphToTriples(graph) });
  }
  static async parse(text: string): Promise<AMRGraph> {
    return NLP.utils.triplesToAMRGraph(await this.#post({ text: text }));
  }
}
```

## Bundle lib to any runtime or web browsers:

```
deno bundle https://raw.githubusercontent.com/hviana/amr_utils/main/mod.ts amr_utils.js
```

## About

Author: Henrique Emanoel Viana, a Brazilian computer scientist, enthusiast of
web technologies, cel: +55 (41) 99999-4664. URL:
https://sites.google.com/view/henriqueviana

Improvements and suggestions are welcome!
