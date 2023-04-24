/*
Created by: Henrique Emanoel Viana
Github: https://github.com/hviana
Page: https://sites.google.com/view/henriqueviana
cel: +55 (41) 99999-4664
*/

export type Triple = [string, string, string]; //triples (s,p,o)

export interface AMRGraph {
  [key: string]: [string, string][];
}

export interface AlgParams {
  notJoinableRelations: (RegExp | string)[];
  notJoinableEntities: (RegExp | string)[];
}

export type SearchFunc = (
  parent: string,
  relation: string,
  child: string,
  graph: AMRGraph,
  utils: AMRUtils,
) => string[];

export type IsJoinableFunc = (
  id1: string,
  id2: string,
  graph: AMRGraph,
  utils: AMRUtils,
) => boolean;

export type ScoreFunc = (
  id1: string,
  id2: string,
  graph: AMRGraph,
  patternGraph: AMRGraph,
  utils: AMRUtils,
) => number;

export interface ScoreResult {
  id: string;
  score: number;
}

export interface GraphPiece {
  graph: AMRGraph;
  rangeIds?: [string, string?];
  relations?: [string, string?]; //used for mode = "append"
  mode: "append" | "replace" | "merge";
  joinEntity?: string; //ex: "and"
  joinRel?: string; //ex: ":op"
  isJoinable?: IsJoinableFunc;
}

export class AMRUtils {
  static #reifications: { [key: string]: string[] } = {
    ":accompanier": ["accompany-01"],
    ":age": ["age-01"],
    ":beneficiary": ["benefit-01", "receive-01"],
    ":cause": ["cause-01"],
    ":concession": ["have-concession-91"],
    ":condition": ["have-condition-91"],
    ":cost": ["cost-01"],
    ":degree": ["have-degree-91"],
    ":destination": ["be-destined-for-91"],
    ":duration": ["last-01"],
    ":employed-by": ["have-org-role-91"],
    ":example": ["exemplify-01"],
    ":extent": ["have-extent-91"],
    ":frequency": ["have-frequency-91"],
    ":instrument": ["have-instrument-91"],
    ":li": ["have-li-91"],
    ":location": ["be-located-at-91"],
    ":manner": ["have-manner-91"],
    ":meaning": ["mean-01"],
    ":mod": ["have-mod-91"],
    ":name": ["have-name-91"],
    ":ord": ["have-ord-91"],
    ":part": ["have-part-91"],
    ":poss": ["have-03", "own-01"],
    ":polarity": ["have-polarity-91"],
    ":purpose": ["have-purpose-91"],
    ":quant": ["have-quant-91"],
    ":role": ["have-org-role-91"],
    ":source": ["be-from-91"],
    ":subevent": ["have-subevent-91"],
    ":subset": ["include-91"],
    ":superset": ["include-91"],
    ":time": ["be-temporally-at-91"],
    ":topic": ["concern-02"],
    ":value": ["have-value-91"],
  };
  static #prepositions: string[] = [
    "say-01",
    "instead-of-91",
    "rate-entity-91",
    "regardless-91",
  ];
  static #notInverses = [":consist-of"];
  static #conjunctions: string[] = ["cause-01", "contrast-01", "and", "or"];
  static #joinEntities = ["and", "or", "multi-sentence"];
  static #jokerInstances = [...AMRUtils.#joinEntities, ...["amr-unknown"]];
  static #prepositionsWords = [
    "a",
    "abaft",
    "aboard",
    "about",
    "above",
    "absent",
    "across",
    "afore",
    "after",
    "against",
    "along",
    "alongside",
    "amid",
    "amidst",
    "among",
    "amongst",
    "an",
    "anenst",
    "apropos",
    "apud",
    "around",
    "as",
    "aside",
    "astride",
    "at",
    "athwart",
    "atop",
    "barring",
    "before",
    "behind",
    "below",
    "beneath",
    "beside",
    "besides",
    "between",
    "beyond",
    "but",
    "by",
    "circa",
    "concerning",
    "despite",
    "down",
    "during",
    "except",
    "excluding",
    "failing",
    "following",
    "for",
    "forenenst",
    "from",
    "given",
    "in",
    "including",
    "inside",
    "into",
    "lest",
    "like",
    "mid",
    "midst",
    "minus",
    "modulo",
    "near",
    "next",
    "notwithstanding",
    "of",
    "off",
    "on",
    "onto",
    "opposite",
    "out",
    "outside",
    "over",
    "pace",
    "past",
    "per",
    "plus",
    "pro",
    "qua",
    "regarding",
    "round",
    "sans",
    "save",
    "since",
    "than",
    "through",
    "throughout",
    "till",
    "times",
    "to",
    "toward",
    "towards",
    "under",
    "underneath",
    "unlike",
    "until",
    "unto",
    "up",
    "upon",
    "versus",
    "via",
    "vice",
    "with",
    "within",
    "without",
    "worth",
  ];
  static #wordsToIgnoreInInstanceName = ["have", "be"];
  static #nameSep = "-";
  static #defaultAlgParams: AlgParams = {
    notJoinableRelations: [/^:instance$/],
    notJoinableEntities: [/^name$/],
  };
  static #defaultScoreFunc: ScoreFunc = (
    id1: string,
    id2: string,
    graph: AMRGraph,
    patternGraph: AMRGraph,
    utils: AMRUtils,
  ) => {
    if (!utils.instanceOf(graph, id1)) { //is leaf
      if (id1 === id2) {
        return 1;
      }
    } else {
      const instance1 = utils.instanceOf(graph, id1);
      const instance2 = utils.instanceOf(patternGraph, id2);
      if (
        instance1 === instance2
      ) {
        return 1;
      } else if (
        AMRUtils.jokerInstances.includes(instance1) ||
        AMRUtils.jokerInstances.includes(instance2)
      ) {
        return 0.5;
      }
    }
    return 0; //fix ts
  };
  static #defaultIsJoinableFunc = (
    id1: string,
    id2: String,
    graph: AMRGraph,
    utils: AMRUtils,
  ) => false;
  static get reifications() {
    return AMRUtils.#reifications;
  }
  static get prepositions() {
    return AMRUtils.#prepositions;
  }
  static get conjunctions() {
    return AMRUtils.#conjunctions;
  }
  static get joinEntities() {
    return AMRUtils.#joinEntities;
  }
  static get notInverses() {
    return AMRUtils.#notInverses;
  }
  static get defaultAlgParams() {
    return AMRUtils.#defaultAlgParams;
  }
  static get jokerInstances() {
    return AMRUtils.#jokerInstances;
  }
  static get defaultScoreFunc() {
    return AMRUtils.#defaultScoreFunc;
  }
  static get defaultIsJoinableFunc() {
    return AMRUtils.#defaultIsJoinableFunc;
  }
  #incrementId(s: string): string {
    if (!s.match(/\d+$/)) {
      s += "0";
    }
    //@ts-ignore
    return s.replace(/\d+$/, (n) => ++n);
  }
  #incrementIds(
    newGraph: AMRGraph,
    graph: AMRGraph,
  ): { [key: string]: string } {
    const map: { [key: string]: string } = {};
    const newIds = new Set();
    for (const id in newGraph) {
      var newId = id;
      if (!map[newId]) {
        if (newId in graph) {
          while (
            newId in graph || newId in newGraph ||
            newIds.has(newId)
          ) {
            newId = this.#incrementId(newId);
          }
        }
        newIds.add(newId);
        map[id] = newId;
      }
    }
    for (const id in newGraph) {
      const idData = newGraph[id];
      for (const relations of idData) {
        if (map[relations[1]]) {
          relations[1] = map[relations[1]];
        }
      }
      delete newGraph[id];
      newGraph[map[id]] = idData;
    }
    return map;
  }
  #matchAny(source: string, patterns: (string | RegExp)[]) {
    for (const p of patterns) {
      if (typeof p === "string") {
        if (source === p) {
          return true;
        }
      } else if (source.match(p)) {
        return true;
      }
    }
    return false;
  }
  #islist(graph: AMRGraph, id: string): boolean {
    for (const r of graph[id]) {
      if (r[0] !== ":instance") {
        return (!!r[0].match(/:op\d+$/) || !!r[0].match(/:sn\d+$/));
      }
    }
    return false;
  }
  #merge(graphs: AMRGraph[]): { [key: string]: string }[] {
    var maps: { [key: string]: string }[] = [];
    for (var i = 1; i < graphs.length; i++) {
      maps.push(this.#incrementIds(graphs[i], graphs[0]));
      Object.assign(graphs[0], graphs[i]);
    }
    return maps;
  }
  #createMultiOpNode(
    instance: string,
    rel: string,
    graph: AMRGraph,
    ids: string[],
  ): string { //return root id
    var existsJoinEntity = null;
    for (const id of ids) {
      if (this.instanceOf(graph, id) === instance) {
        existsJoinEntity = id;
        break;
      }
    }
    if (!existsJoinEntity) {
      var joinGlue = this.createInstance(instance);
      this.#incrementIds(
        joinGlue,
        graph,
      );
      existsJoinEntity = Object.keys(joinGlue)[0];
      Object.assign(graph, joinGlue);
    }
    for (const id of ids) {
      const n = graph[existsJoinEntity].length; //:instance relation => n+1
      if (id !== existsJoinEntity) {
        if (this.instanceOf(graph, id) === instance) {
          for (const r in graph[id]) {
            if (graph[id][r][0] !== ":instance") {
              const obj = graph[id][r][1];
              graph[existsJoinEntity].push([
                `${rel}${n + parseInt(r)}`,
                obj,
              ]);
            }
          }
        } else {
          graph[existsJoinEntity].push([
            `${rel}${n}`,
            id,
          ]);
        }
      }
    }
    for (const s in graph) {
      if (s !== existsJoinEntity) {
        for (const id of ids) {
          this.#changeReference(graph, id, existsJoinEntity, s);
        }
      }
    }
    return existsJoinEntity;
  }

  #entitiesIsEquals(graph: AMRGraph, id1: string, id2: string) {
    if (!graph[id1] || !graph[id2]) { //is leaf
      return id1 === id2;
    }
    if (graph[id1].length !== graph[id1].length) {
      return false;
    }
    for (const relation of graph[id1]) {
      var hasRelation = false;
      for (const r2 of graph[id2]) {
        if (
          (r2[0] === relation[0]) && (r2[1] === relation[1])
        ) {
          hasRelation = true;
          break;
        }
      }
      if (!hasRelation) {
        return false;
      }
    }
    return true;
  }
  #mergeDuplicatedRelations(
    graph: AMRGraph,
    instance: string,
    rel: string,
  ): void {
    for (const subject in graph) {
      const toMerge: { [key: string]: string[] } = {};
      for (const relations of graph[subject]) {
        if (!toMerge[relations[0]]) {
          toMerge[relations[0]] = [];
        }
        toMerge[relations[0]].push(
          relations[1],
        );
      }
      for (const predicate in toMerge) {
        if (toMerge[predicate].length > 1) {
          const newEntity = this.#createMultiOpNode(
            instance,
            rel,
            graph,
            toMerge[predicate],
          );
          for (var j = graph[subject].length; j--;) {
            if (graph[subject][j][0] === predicate) {
              graph[subject].splice(j, 1);
            }
          }
          graph[subject].push([predicate, newEntity]);
        }
      }
    }
  }
  #removeRepeatedTriplesAndNotJoinableDuplicatedRelations(
    graph: AMRGraph,
    notJoinableRelations: (RegExp | string)[],
  ): void {
    for (const s in graph) {
      const countMap: { [key: string]: string[] } = {};
      for (var j = graph[s].length; j--;) {
        const predicate = graph[s][j][0];
        const object = graph[s][j][1];
        if (
          countMap[predicate] &&
          (!this.#matchAny(predicate, notJoinableRelations) ||
            countMap[predicate].includes(object))
        ) {
          graph[s].splice(j, 1);
        } else {
          if (!countMap[predicate]) {
            countMap[predicate] = [object];
          } else {
            countMap[predicate].push(object);
          }
        }
      }
    }
  }
  #removeCiclesAndDisconecteds(
    graph: AMRGraph,
    startId: string,
    past: Set<string> = new Set(),
    finished: Set<string> = new Set(),
  ): AMRGraph {
    var res: AMRGraph = {};
    past.add(startId);
    finished.add(startId);
    past = new Set(past);
    if (graph[startId]) {
      res[startId] = [];
      for (const relation of graph[startId]) {
        if (!past.has(relation[1])) {
          res[startId].push(relation);
          if (!finished.has(relation[1])) {
            res = {
              ...res,
              ...this.#removeCiclesAndDisconecteds(
                graph,
                relation[1],
                past,
                finished,
              ),
            };
          }
        }
      }
    }
    return res;
  }
  #mergeEqualsOpAndFixIndexes(graph: AMRGraph, id: string) {
    const instance = graph[id].filter((r) => r[0] === ":instance")[0];
    const rel = graph[id].filter((r) => r[0] !== ":instance")[0][0].replace(
      /\d+$/,
      "",
    );
    const objs = new Set(
      graph[id].filter((r) => r[0] !== ":instance").map((r) => r[1]).sort(),
    );
    const merged: string[] = [];
    for (const o of objs) {
      var isDup = false;
      for (const m of merged) {
        if (this.#entitiesIsEquals(graph, o, m)) {
          isDup = true;
          break;
        }
      }
      if (!isDup) {
        merged.push(o);
      }
    }
    graph[id] = [instance];
    for (var i = 0; i < merged.length; i++) {
      graph[id].push([
        `${rel}${i + 1}`,
        merged[i],
      ]);
    }
  }
  #isJoinableEntities(
    graph: AMRGraph,
    ids: string[],
    notJoinableEntities: (RegExp | string)[],
    joinEntity: string,
  ): boolean {
    const firstInstance = this.instanceOf(graph, ids[0]);
    for (const id of ids) {
      const instance = this.instanceOf(graph, id);
      if (!firstInstance) { //firstInstance is leafs
        if (id !== ids[0]) {
          return false;
        }
      }
      if (instance === joinEntity) {
        return false;
      }
      if (instance !== firstInstance) {
        return false;
      }
      for (const ne of notJoinableEntities) {
        if (typeof ne === "string") {
          if (ne === instance) {
            return false;
          }
        } else if (instance.match(ne)) {
          return false;
        }
      }
    }
    return true;
  }
  #groupByMergeableInstanceOnSameRelation(
    graph: AMRGraph,
    id: string,
    isList: boolean = false,
    notJoinableEntities: (RegExp | string)[],
    notJoinableRelations: (RegExp | string)[],
    joinEntity: string,
    joinableFunc: IsJoinableFunc,
  ): {
    "mergeable": { [key: string]: string[] };
    "not_mergeable": { [key: string]: string[] };
  } {
    const group: {
      "mergeable": { [key: string]: string[] };
      "not_mergeable": { [key: string]: string[] };
    } = { "mergeable": {}, "not_mergeable": {} };
    if (!graph[id]) { //is leaf
      return group;
    }
    const merged = new Set<string>();
    for (const i1 in graph[id]) {
      const r1 = graph[id][i1];
      if (this.#matchAny(r1[0], notJoinableRelations)) {
        continue;
      }
      const relType1 = isList ? "__list_item" : r1[0];
      for (const i2 in graph[id]) {
        const r2 = graph[id][i2];
        if (
          this.#matchAny(r2[0], notJoinableRelations) || (merged.has(r1[1]) &&
            merged.has(r2[1]))
        ) {
          continue;
        }
        const relType2 = isList ? "__list_item" : r2[0];
        if ((relType1 === relType2) && (i1 !== i2)) {
          merged.add(r2[1]);
          merged.add(r1[1]);
          if (
            this.#isJoinableEntities(
              graph,
              [r1[1], r2[1]],
              notJoinableEntities,
              joinEntity,
            ) || joinableFunc(r1[1], r2[1], graph, this)
          ) {
            if (!group["mergeable"][r1[1]]) {
              group["mergeable"][r1[1]] = [];
            }
            group["mergeable"][r1[1]].push(r2[1]);
          } else {
            if (!group["not_mergeable"][r1[1]]) {
              group["not_mergeable"][r1[1]] = [];
            }
            group["not_mergeable"][r1[1]].push(r2[1]);
          }
        }
      }
    }
    return group;
  }
  #changeReference(
    graph: AMRGraph,
    oldId: string,
    newId: string,
    nodeId?: string,
  ): void {
    if (graph[oldId]) { //is not leaf
      for (const s in graph) {
        for (const relation of graph[s]) {
          if (relation[1] === oldId && newId !== s) {
            relation[1] = newId;
          }
        }
      }
    } else if (nodeId) {
      for (const relation of graph[nodeId]) {
        if (relation[1] === oldId) {
          relation[1] = newId;
        }
      }
    }
  }
  #mergeRelations(
    graph: AMRGraph,
    id1: string,
    id2: string,
    notJoinableRelations: (RegExp | string)[],
  ) {
    if (!graph[id1] || !graph[id2]) { //leaf has no relation
      return;
    }
    for (const relation of graph[id2]) {
      var hasRelation = false;
      for (const r2 of graph[id1]) {
        if (
          (r2[0] === relation[0]) && (r2[1] === relation[1])
        ) {
          hasRelation = true;
          break;
        }
      }
      if (!hasRelation && !this.#matchAny(relation[0], notJoinableRelations)) {
        graph[id1].push(relation);
      }
    }
  }
  #listIsNecessary(graph: AMRGraph, id: string): string | void {
    if (
      graph[id].length < 3 &&
      AMRUtils.joinEntities.includes(this.instanceOf(graph, id))
    ) {
      const candidate = graph[id].filter((r) => r[0] !== ":instance")[0][1];
      if (graph[candidate]) { //is not leaf
        this.#changeReference(
          graph,
          id,
          candidate,
        );
        return candidate;
      }
    }
  }
  #mergeEntities(
    notJoinableEntities: (RegExp | string)[],
    notJoinableRelations: (RegExp | string)[],
    graph: AMRGraph,
    graphRangeIds: [string, string?],
    graphPieceRangeIds: [string, string?],
    joinEntity: string,
    joinRel: string,
    joinableFunc?: IsJoinableFunc,
    finished: Set<string> = new Set(),
    parent?: string,
  ): { [key: string]: string } {
    var res = {};
    if (
      (
        !finished.has(graphRangeIds[0] + graphPieceRangeIds[0]) &&
        (graphRangeIds[0] !== graphRangeIds[1]) &&
        (graphPieceRangeIds[0] !== graphPieceRangeIds[1])
      ) || finished.size === 0
    ) {
      finished.add(graphRangeIds[0] + graphPieceRangeIds[0]);
      if (
        this.#isJoinableEntities(
          graph,
          [graphRangeIds[0], graphPieceRangeIds[0]],
          notJoinableEntities,
          joinEntity,
        ) || joinableFunc!(graphRangeIds[0], graphPieceRangeIds[0], graph, this)
      ) {
        this.#mergeRelations(
          graph,
          graphRangeIds[0],
          graphPieceRangeIds[0],
          notJoinableRelations,
        );
        this.#changeReference(
          graph,
          graphPieceRangeIds[0],
          graphRangeIds[0],
          parent,
        );
        if (graph[graphRangeIds[0]]) { //if is not leaf
          res = { ...res, ...{ [graphPieceRangeIds[0]]: graphRangeIds[0] } };
          const isList = this.#islist(graph, graphRangeIds[0]);
          const groups = this.#groupByMergeableInstanceOnSameRelation(
            graph,
            graphRangeIds[0],
            isList,
            notJoinableEntities,
            notJoinableRelations,
            joinEntity,
            joinableFunc!,
          );
          for (const t of ["mergeable", "not_mergeable"]) {
            if (isList && (t === "not_mergeable")) {
              continue;
            }
            //@ts-ignore
            for (const id in groups[t]) {
              //@ts-ignore
              for (const id2 of groups[t][id]) {
                res = {
                  ...res,
                  ...this.#mergeEntities(
                    notJoinableEntities,
                    notJoinableRelations,
                    graph,
                    [id, graphRangeIds[1]],
                    [id2, graphPieceRangeIds[1]],
                    joinEntity,
                    joinRel,
                    joinableFunc,
                    finished,
                    graphRangeIds[0],
                  ),
                };
              }
            }
          }
          if (isList) {
            this.#mergeEqualsOpAndFixIndexes(graph, graphRangeIds[0]);
            const newId2 = this.#listIsNecessary(graph, graphRangeIds[0]);
            if (newId2) {
              res = {
                ...res,
                ...{
                  [graphRangeIds[0]]: newId2,
                  [graphPieceRangeIds[0]]: newId2,
                },
              };
            }
          }
        }
      } else {
        var newId = this.#createMultiOpNode(joinEntity, joinRel, graph, [
          graphRangeIds[0],
          graphPieceRangeIds[0],
        ]);
        const groups = this.#groupByMergeableInstanceOnSameRelation(
          graph,
          newId,
          true,
          notJoinableEntities,
          notJoinableRelations,
          joinEntity,
          joinableFunc!,
        );
        for (const id in groups["mergeable"]) {
          for (const id2 of groups["mergeable"][id]) {
            res = {
              ...res,
              ...this.#mergeEntities(
                notJoinableEntities,
                notJoinableRelations,
                graph,
                [id, graphRangeIds[1]],
                [id2, graphPieceRangeIds[1]],
                joinEntity,
                joinRel,
                joinableFunc,
                finished,
                newId,
              ),
            };
          }
        }
        this.#mergeEqualsOpAndFixIndexes(graph, newId);
        const newId2 = this.#listIsNecessary(graph, newId);
        res = {
          ...res,
          ...{
            [graphRangeIds[0]]: (newId2 || newId),
            [graphPieceRangeIds[0]]: (newId2 || newId),
          },
        };
      }
    }
    return res;
  }
  #subGraphAt(
    graph: AMRGraph,
    id: string,
    endId?: string,
    finished: Set<string> = new Set(),
  ): AMRGraph {
    if (!graph[id] || finished.has(id)) {
      return {};
    }
    finished.add(id);
    var res: AMRGraph = { [id]: [] };
    for (const relations of graph[id]) {
      res[id].push([relations[0], relations[1]]);
      if (relations[1] !== endId) {
        res = {
          ...res,
          ...this.#subGraphAt(graph, relations[1], endId, finished),
        };
      }
    }
    return this.clone(res);
  }
  #search(
    graph: AMRGraph,
    subjectInstance?: RegExp | string,
    predicate?: RegExp | string,
    objectInstance?: RegExp | string,
    root?: string,
    fullSearch?: boolean,
    func?: SearchFunc,
    finished: Set<string> = new Set(),
  ): string[] {
    if (!root) {
      root = this.rootId(graph);
    }
    const res: string[] = [];
    if (!graph[root] || finished.has(root)) {
      return res;
    }
    finished.add(root);
    var foundSubject = true;
    var foundPredicate = true;
    var foundObject = true;
    if (subjectInstance) {
      if (!this.#matchAny(this.instanceOf(graph, root), [subjectInstance])) {
        foundSubject = false;
      }
    }
    var objects = [];
    for (const relation of graph[root]) {
      objects.push(relation[1]);
      if (foundSubject) {
        if (predicate) {
          if (!this.#matchAny(relation[0], [predicate])) {
            foundPredicate = false;
          } else {
            foundPredicate = true;
          }
          if (foundPredicate) {
            if (objectInstance) {
              var instance: string | RegExp = this.instanceOf(
                graph,
                relation[1],
              );
              if (instance === "") {
                instance = relation[1];
              }
              if (!this.#matchAny(instance, [objectInstance])) {
                foundObject = false;
              } else {
                foundObject = true;
              }
            }
          }
        }
      }
      if (foundSubject && foundPredicate && foundObject) {
        if (func) {
          res.push(...func(root, relation[0], relation[1], graph, this));
        } else {
          res.push(root);
          break;
        }
      }
    }
    if (res.length === 0) {
      for (const o of objects) {
        res.push(
          ...this.#search(
            graph,
            subjectInstance,
            predicate,
            objectInstance,
            o,
            fullSearch,
            func,
            finished,
          ),
        );
      }
    }
    if (fullSearch) {
      var resPart = [...res];
      while (resPart.length) {
        const childs = [];
        for (const p of resPart) {
          childs.push(...this.childsOf(graph, p));
        }
        resPart = [];
        for (const c of childs) {
          resPart.push(...this.#search(
            graph,
            subjectInstance,
            predicate,
            objectInstance,
            c,
            fullSearch,
            func,
            finished,
          ));
        }
        res.push(...resPart);
      }
    }
    return res;
  }
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
  ): { graph: AMRGraph; map: { [key: string]: string } } {
    if (!Object.keys(graph).length) {
      return { graph: this.clone(piece.graph), map: {} };
    }
    if (!Object.keys(piece.graph).length) {
      return { graph: this.clone(graph), map: {} };
    }
    if (!algParams) {
      algParams = AMRUtils.defaultAlgParams;
    }
    if (!piece.joinEntity) {
      piece.joinEntity = "and";
    }
    if (!piece.joinRel) {
      piece.joinRel = ":op";
    }
    var res = this.clone(graph);
    var graphRootId = this.rootId(res);
    if (!rangeIds) {
      rangeIds = [graphRootId, graphRootId];
    } else {
      if (rangeIds.length < 2) {
        rangeIds[1] = rangeIds[0];
      }
    }
    const pieceMap: any = this.#merge([res, this.clone(piece.graph)])[0];
    if (!piece.rangeIds) {
      var pieceGraphRootId = pieceMap[this.rootId(piece.graph)];
      piece.rangeIds = [pieceGraphRootId, pieceGraphRootId];
    } else {
      piece.rangeIds[0] = pieceMap[piece.rangeIds[0]];
      if (piece.rangeIds.length > 1) {
        piece.rangeIds[1] = pieceMap[piece.rangeIds[1]!];
      } else {
        piece.rangeIds[1] = piece.rangeIds[0];
      }
    }
    var resMap: any = {};
    if (piece.mode === "append") {
      res[rangeIds[0]].push([
        `${piece.relations![0]}`,
        piece.rangeIds[0],
      ]);
      if (piece.relations![1]) {
        res[piece.rangeIds[1]!].push([
          `${piece.relations![1]}`,
          rangeIds[1]!,
        ]);
      }
    } else if (piece.mode === "replace") {
      const mergedIds: string[] = [];
      for (const i in rangeIds) {
        if (!mergedIds.includes(rangeIds[i]!)) {
          res[piece.rangeIds[i]!].push(
            ...res[rangeIds[i]!].filter((r) => r[0] !== ":instance"),
          );
          this.#changeReference(res, rangeIds[i]!, piece.rangeIds[i]!);
          if (rangeIds[i] === graphRootId) {
            graphRootId = piece.rangeIds[i]!;
          }
          delete res[rangeIds[i]!];
          mergedIds.push(rangeIds[i]!);
        }
      }
    } else if (piece.mode === "merge") {
      resMap = this.#mergeEntities(
        algParams.notJoinableEntities,
        algParams.notJoinableRelations,
        res,
        rangeIds,
        piece.rangeIds,
        piece.joinEntity,
        piece.joinRel,
        piece.isJoinable || AMRUtils.defaultIsJoinableFunc,
      );
      if (graphRootId in resMap) {
        graphRootId = resMap[graphRootId];
      }
    }
    this.#removeRepeatedTriplesAndNotJoinableDuplicatedRelations(
      res,
      algParams.notJoinableRelations,
    );
    this.#mergeDuplicatedRelations(res, piece.joinEntity, piece.joinRel);
    res = this.#removeCiclesAndDisconecteds(res, graphRootId);
    const map: any = { ...pieceMap, ...resMap };
    for (const k in map) {
      const past = new Set();
      while (map[map[k]] && !past.has(map[map[k]])) {
        past.add(map[map[k]]);
        map[k] = map[map[k]];
      }
    }
    const keys = Object.keys(map);
    for (const k of keys) {
      if ((!res[k] && !piece.graph[k]) || (k === map[k])) {
        delete map[k];
      }
    }
    return {
      graph: res,
      map: map,
    };
  }

  /**
   * Returns the instance name of a node.
   * @param {graph} AMRGraph instance.
   * @param {id} string, id/var name of node.
   * @return {string} instance name.
   */
  instanceOf(graph: AMRGraph, id: string): string {
    if (!graph[id]) {
      return "";
    }
    for (const relations of graph[id]) {
      if (relations[0] === ":instance") {
        return relations[1];
      }
    }
    return "";
  }

  /**
   * Convert AMR graph instance from the library to the triples.
   * @param {AMRGraph[]} AMRGraph instance.
   * @return {Triple[]} triples, in the form: [['s','p','o'],...].
   */
  AMRGraphToTriples(graph: AMRGraph): Triple[] {
    var res: Triple[] = [];
    for (const subject in graph) {
      for (const relations of graph[subject]) {
        res.push([subject, relations[0], relations[1]]);
      }
    }
    return res;
  }

  /**
   * Convert triples to an AMR graph instance from the library.
   * @param {triples} Triple[], triples, in the form: [['s','p','o'],...].
   * @return {AMRGraph} AMR graph instance.
   */
  triplesToAMRGraph(triples: Triple[]): AMRGraph {
    const res: AMRGraph = {};
    for (const t of triples) {
      if (!res[t[0]]) {
        res[t[0]] = [];
      }
      res[t[0]].push([
        t[1],
        t[2],
      ]);
    }
    return res;
  }

  /**
   * clone a graph.
   * @param {graphs} AMRGraph[], Graph that will be cloned.
   * @return {AMRGraph} the clone.
   */
  clone(graph: AMRGraph): AMRGraph {
    const res: AMRGraph = {};
    for (const subject in graph) {
      res[subject] = [];
      for (const relations of graph[subject]) {
        res[subject].push([relations[0], relations[1]]);
      }
    }
    return res;
  }

  /**
   * Clone N graphs.
   * @param {graphs} AMRGraph[], Graphs that will be cloned.
   * @return {AMRGraph[]} the clones.
   */
  cloneN(graphs: AMRGraph[]): AMRGraph[] {
    const res: AMRGraph[] = [];
    for (const g of graphs) {
      res.push(this.clone(g));
    }
    return res;
  }

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
  ): AMRGraph {
    return this.#subGraphAt(graph, id, endId);
  }

  /**
   * Returns a graph with a single node given an instance name.
   * @param {instance} string, instance name.
   * @return {AMRGraph} the graph.
   */
  createInstance(instance: string): AMRGraph {
    return {
      [instance.charAt(0)]: [[":instance", instance]],
    };
  }

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
    subjectInstance?: RegExp | string,
    predicate?: RegExp | string,
    objectInstance?: RegExp | string,
    root?: string,
    fullSearch?: boolean,
    func?: SearchFunc,
  ): string[] {
    return this.#search(
      graph,
      subjectInstance,
      predicate,
      objectInstance,
      root,
      fullSearch,
      func,
    );
  }
  /**
   * Finds the parents of a node.
   * @param {graph} AMRGraph, the graph.
   * @param {id} string, the id value of the node.
   * @param {predicate} stringOrRegExp, optional, relationship name.
   * @return {string[]} the parents.
   */
  parentsOf(
    graph: AMRGraph,
    id: string,
    predicate?: string | RegExp,
  ): string[] {
    const res: string[] = [];
    for (const id2 in graph) {
      for (const relations of graph[id2]) {
        if (relations[1] === id) {
          if (predicate) {
            if (this.#matchAny(relations[0], [predicate])) {
              res.push(id2);
            }
          } else {
            res.push(id2);
          }
        }
      }
    }
    return res;
  }

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
  ): string[] {
    const res: string[] = [];
    if (graph[id]) {
      for (const relations of graph[id]) {
        if (!(relations[0] === ":instance" && ignoreInstance)) {
          if (predicate) {
            if (this.#matchAny(relations[0], [predicate])) {
              res.push(relations[1]);
            }
          } else {
            res.push(relations[1]);
          }
        }
      }
    }
    return res;
  }

  /**
   * Finds the id (name of the AMR variable) of the root of a graph.
   * @param {graph} AMRGraph, the graph.
   * @return {string} the id value of the root of a graph.
   */
  rootId(graph: AMRGraph): string {
    for (const id in graph) {
      var isRoot = true;
      for (const id2 in graph) {
        for (const relations of graph[id2]) {
          if (relations[1] === id) {
            isRoot = false;
            break;
          }
        }
      }
      if (isRoot) {
        return id;
      }
    }
    return "";
  }
  /**
   * Transforms a string into an array of words.
   * @param {input} string, text input.
   * @return {string[]} array of words.
   */
  tokenize(input: string): string[] {
    return input.match(/\S+/g)!;
  }
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
  ): AMRGraph {
    const graph = this.createInstance(instance);
    this.appendListNode(ops, graph, "", rel);
    return graph;
  }
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
  ): void {
    if (!id) {
      id = this.rootId(graph);
    }
    if (!rel) {
      rel = graph[id].filter((r) => r[0] !== ":instance")[0][0].replace(
        /\d+$/,
        "",
      );
    }
    const n = graph[id].length;
    for (var i = 0; i < ops.length; i++) {
      const obj = (typeof ops[i] === "object")
        ? this.rootId(ops[i] as AMRGraph)
        : ops[i];
      graph[id].push([
        `${rel}${n + i}`,
        obj as string,
      ]);
    }
  }
  /**
   * Returns the inverse of a relation.
   * @param {x} string, relation name.
   * @return {string} inverse relation name.
   */
  inverse(x: string): string {
    if (x.endsWith("-of") && !AMRUtils.notInverses.includes(x)) {
      return x.replace(/-of$/, "");
    } else {
      return `${x}-of`;
    }
  }

  possibleWordFromInstance(instance: string): string {
    if (!instance.includes(AMRUtils.#nameSep)) {
      return instance;
    }
    const parts: string[] = instance.split(AMRUtils.#nameSep);
    const filtered: string[] = parts.filter((p) => {
      if (
        /^\d+$/.test(p) || AMRUtils.#prepositionsWords.includes(p) ||
        AMRUtils.#wordsToIgnoreInInstanceName.includes(p)
      ) {
        return false;
      }
      return true;
    });
    if (!filtered.length) {
      return parts[0];
    }
    return filtered.sort((a, b) => b.length - a.length)[0];
  }

  #childPathLength(
    graph: AMRGraph,
    id1: string,
    id2: string,
  ): number {
    if (graph[id1]) { //is not leaf
      const childs = this.childsOf(graph, id1, "", true);
      if (childs.includes(id2)) {
        return 1;
      } else {
        for (const c of childs) {
          const childSum = this.#childPathLength(graph, c, id2);
          if (childSum) {
            return 1 + childSum;
          }
        }
      }
    }
    return 0;
  }

  //considering reifications (safe)
  pathLength(
    graph: AMRGraph,
    id1: string,
    id2: string,
  ): number {
    var parentPathLen = this.#childPathLength(graph, id1, id2);
    var parent = id1;
    while (!parentPathLen) { //parent (id2) is child of a reification, there is no path id1 => id2
      parent = this.parentsOf(graph, parent)[0];
      if (parent) {
        parentPathLen = this.#childPathLength(graph, parent, id2);
      } else {
        break;
      }
    }
    return parentPathLen;
  }
  /**
   * Returns possible semantic relationships based on an reification instance type.
   * @param {instance} string, instance name.
   * @return {stringOrRegExp[]} Possible relations.
   */
  relationFromReification(instance: string): (string | RegExp)[] {
    const res: (string | RegExp)[] = [
      `:${this, instance.replace(/-\d+$/, "") //name-N to :name
      }`,
    ];
    res.push(this.inverse(res[0] as string));
    for (const r in AMRUtils.reifications) {
      if (AMRUtils.reifications[r].includes(instance)) {
        res.push(r);
        res.push(this.inverse(r));
      }
    }
    return res;
  }
  /**
   * Returns possible reifications based on a semantic relationship.
   * @param {relation} string, relation name.
   * @return {stringOrRegExp[]} Possible reifications.
   */
  reificationFromRelation(relation: string): (string | RegExp)[] {
    const res: (string | RegExp)[] = [
      new RegExp(`${relation.substring(1)}-[0-9]+$`),
      new RegExp(`${this.inverse(relation).substring(1)}-[0-9]+$`),
      new RegExp(`${relation.substring(1)}$`),
      new RegExp(`${this.inverse(relation).substring(1)}$`),
    ]; //:name to name-N (name-01)
    if (AMRUtils.reifications[relation]) {
      res.push(...AMRUtils.reifications[relation]);
    }
    if (AMRUtils.reifications[this.inverse(relation)]) {
      res.push(...AMRUtils.reifications[this.inverse(relation)]);
    }
    return res;
  }
  /*
    graphTriple: [parent1, rel, child1],
    patternGraphTriple: [parent2, rel, child2].

    graphTriple[2] is a child, graphTriple[0] is a parent,
    important these differences given the "direction" parameter.

    Beware, never return an entity of type reification
    (return its children) unless it's a reification in the pattern too.
    Only consider nodes where the node score compared
    to the pattern node is greater than zero.
  */
  #hasMatch(
    direction: "child" | "parent",
    graphOriginId: string,
    patternGraphOriginId: string,
    graph: AMRGraph,
    patternGraph: AMRGraph,
    graphTriple: [string, string, string],
    patternGraphTriple: [string, string, string],
    func: ScoreFunc,
  ): string[] | undefined {
    const comparators: [string, string][] = []; //first comparator is aways graph reference (not pattern)

    const relFromPatternOriginReifications = this.relationFromReification(
      this.instanceOf(patternGraph, patternGraphOriginId),
    );
    const relFromPatternSubjectReifications = this.relationFromReification(
      this.instanceOf(patternGraph, patternGraphTriple[0]),
    );
    const relFromGraphOriginReifications = this.relationFromReification(
      this.instanceOf(graph, graphOriginId),
    );
    const relFromGraphSubjectOriginReifications = this.relationFromReification(
      this.instanceOf(graph, graphTriple[0]),
    );
    const reificationFromGraphRelation = this.reificationFromRelation(
      graphTriple[1],
    );
    const reificationFromPatternRelation = this.reificationFromRelation(
      patternGraphTriple[1],
    );
    if (
      patternGraphTriple[1] === ":instance" || graphTriple[1] === ":instance"
    ) {
      return undefined;
    }
    if (direction === "parent") {
      if (
        (patternGraphTriple[2] !== patternGraphOriginId) ||
        (graphTriple[2] !== graphOriginId)
      ) {
        return undefined;
      }
    }
    if (
      graphTriple[1] === patternGraphTriple[1]
    ) {
      if (direction === "child") {
        if (
          this.#nodeScore(
            graphTriple[2],
            patternGraphTriple[2],
            graph,
            patternGraph,
            func,
          )
        ) {
          return [graphTriple[2], patternGraphTriple[2]];
        }
      } else {
        if (
          this.#nodeScore(
            graphTriple[0],
            patternGraphTriple[0],
            graph,
            patternGraph,
            func,
          )
        ) {
          return [graphTriple[0], patternGraphTriple[0]];
        }
      }
    } else if (
      graphTriple[1] === this.inverse(patternGraphTriple[1]) ||
      patternGraphTriple[1] === this.inverse(graphTriple[1])
    ) {
      if (direction === "child") {
        if (
          this.#nodeScore(
            graphTriple[0],
            patternGraphTriple[2],
            graph,
            patternGraph,
            func,
          )
        ) {
          return [graphTriple[0], patternGraphTriple[2]];
        }
      } else {
        if (
          this.#nodeScore(
            graphTriple[2],
            patternGraphTriple[0],
            graph,
            patternGraph,
            func,
          )
        ) {
          return [graphTriple[2], patternGraphTriple[0]];
        }
      }
    } else if (
      this.#matchAny(graphTriple[1], relFromPatternOriginReifications)
    ) {
      const reificationsChilds = this.childsOf(
        patternGraph,
        patternGraphOriginId,
        "",
        true,
      );
      for (const c of reificationsChilds) {
        comparators.push([graphTriple[0], c]);
        comparators.push([graphTriple[2], c]);
      }
    } else if (
      this.#matchAny(graphTriple[1], relFromPatternSubjectReifications)
    ) {
      const reificationsChilds = this.childsOf(
        patternGraph,
        patternGraphTriple[0],
        "",
        true,
      );
      for (const c of reificationsChilds) {
        comparators.push([graphTriple[0], c]);
        comparators.push([graphTriple[2], c]);
      }
    } else if (
      this.#matchAny(patternGraphTriple[1], relFromGraphOriginReifications)
    ) {
      const reificationsChilds = this.childsOf(graph, graphOriginId, "", true);
      for (const c of reificationsChilds) {
        comparators.push([c, patternGraphTriple[0]]);
        comparators.push([c, patternGraphTriple[2]]);
      }
    } else if (
      this.#matchAny(
        patternGraphTriple[1],
        relFromGraphSubjectOriginReifications,
      )
    ) {
      const reificationsChilds = this.childsOf(graph, graphTriple[0], "", true);
      for (const c of reificationsChilds) {
        comparators.push([c, patternGraphTriple[0]]);
        comparators.push([c, patternGraphTriple[2]]);
      }
    } else if (
      this.#matchAny(patternGraphTriple[0], reificationFromGraphRelation)
    ) {
      const reificationsChilds = this.childsOf(
        patternGraph,
        patternGraphTriple[0],
        "",
        true,
      );
      for (const c of reificationsChilds) {
        comparators.push([graphTriple[0], c]);
        comparators.push([graphTriple[2], c]);
      }
    } else if (
      this.#matchAny(graphTriple[0], reificationFromPatternRelation)
    ) {
      const reificationsChilds = this.childsOf(graph, graphTriple[0], "", true);
      for (const c of reificationsChilds) {
        comparators.push([c, patternGraphTriple[0]]);
        comparators.push([c, patternGraphTriple[2]]);
      }
    } else if (
      this.#matchAny(patternGraphTriple[2], reificationFromGraphRelation)
    ) {
      const reificationsChilds = this.childsOf(
        patternGraph,
        patternGraphTriple[2],
        "",
        true,
      );
      for (const c of reificationsChilds) {
        comparators.push([graphTriple[0], c]);
        comparators.push([graphTriple[2], c]);
      }
    } else if (
      this.#matchAny(graphTriple[2], reificationFromPatternRelation)
    ) {
      const reificationsChilds = this.childsOf(graph, graphTriple[2], "", true);
      for (const c of reificationsChilds) {
        comparators.push([c, patternGraphTriple[0]]);
        comparators.push([c, patternGraphTriple[2]]);
      }
    }
    //we do this (comparators) because we don't know which relations
    //of a reitification are the ones we want, so we took the one with the highest score
    var bestScore = 0;
    var bestResult: undefined | string[] = undefined;
    for (const c of comparators) {
      const score = this.#nodeScore(c[0], c[1], graph, patternGraph, func);
      if (score > bestScore) {
        bestScore = score;
        bestResult = c; //c[0] is aways graph reference (not pattern)
      }
    }
    return bestResult;
  }

  #parentsSearch(
    id: string,
    graph: AMRGraph,
    patternGraphId: string,
    patternGraph: AMRGraph,
    func: ScoreFunc,
  ): { id: string; patternId: string }[] {
    const result: { id: string; patternId: string }[] = [];
    const patternParents = this.parentsOf(patternGraph, patternGraphId);
    const graphParents = this.parentsOf(graph, id);
    for (const pp of patternParents) {
      var parentResult: string[] | undefined = undefined;
      for (const rel of patternGraph[pp]) {
        if (rel[0] !== ":instance") {
          for (const p of graphParents) {
            for (const rel2 of graph[p]) {
              if (rel2[0] !== ":instance") {
                parentResult = this.#hasMatch(
                  "parent",
                  id,
                  patternGraphId,
                  graph,
                  patternGraph,
                  [p, rel2[0], rel2[1]],
                  [pp, rel[0], rel[1]],
                  func,
                );
                if (parentResult) {
                  break;
                }
              }
            }
            if (parentResult) {
              break;
            }
          }
          if (parentResult) {
            break;
          }
        }
      }
      if (parentResult) {
        result.push({ id: parentResult[0], patternId: parentResult[1] });
      } else {
        var bestResult: { id: string; patternId: string }[] = [];
        var minLen = Number.MAX_SAFE_INTEGER;
        for (const p of graphParents) {
          const grandParentResult: { id: string; patternId: string }[] = this
            .#parentsSearch(
              p,
              graph,
              patternGraphId,
              patternGraph,
              func,
            );
          if (grandParentResult.length) {
            const pathLen = this.pathLength(
              graph,
              grandParentResult[0].id,
              p,
            );
            if (pathLen < minLen) {
              minLen = pathLen;
              bestResult = grandParentResult;
            }
          }
        }
        result.push(...bestResult);
      }
    }
    return [...new Map(result.map((item) => [item["id"], item])).values()];
  }
  #childsSearch(
    id: string,
    graph: AMRGraph,
    patternGraphId: string,
    patternGraph: AMRGraph,
    func: ScoreFunc,
  ): { id: string; patternId: string }[] {
    const result: { id: string; patternId: string }[] = [];
    if (patternGraph[patternGraphId]) { //is not leaf
      for (const rel of patternGraph[patternGraphId]) {
        if (rel[0] !== ":instance") {
          const matchRes = this.search(graph, "", "", "", id, false, (
            parent: string,
            relation: string,
            child: string,
            graph: AMRGraph,
            utils: AMRUtils,
          ) => {
            const childResult: string[] = [];
            if (relation !== ":instance") {
              const match = this.#hasMatch(
                "child",
                id,
                patternGraphId,
                graph,
                patternGraph,
                [parent, relation, child],
                [patternGraphId, rel[0], rel[1]],
                func,
              );
              if (match) {
                childResult.push(...match);
              }
            }
            return childResult;
          });
          if (matchRes.length) {
            result.push({ id: matchRes[0], patternId: matchRes[1] });
          }
        }
      }
    }
    return [...new Map(result.map((item) => [item["id"], item])).values()];
  }

  #nodeScore(
    id: string,
    patternGraphId: string,
    graph: AMRGraph,
    patternGraph: AMRGraph,
    func: ScoreFunc,
  ): number {
    var score = 0;
    score += func(
      id,
      patternGraphId,
      graph,
      patternGraph,
      this,
    );
    return score;
  }
  #informationProximity(
    id: string,
    graph: AMRGraph,
    patternGraphId: string,
    patternGraph: AMRGraph,
    func: ScoreFunc,
    finalized = new Map<string, number>(),
  ): number {
    if (!finalized.has(id + patternGraphId)) {
      var score = 1.0;
      finalized.set(id + patternGraphId, score); //prevent cicle
      const nodeScore = this.#nodeScore(
        id,
        patternGraphId,
        graph,
        patternGraph,
        func,
      );
      const childsSearch = this.#childsSearch(
        id,
        graph,
        patternGraphId,
        patternGraph,
        func,
      );
      for (const c of childsSearch) {
        var childScore = this.#informationProximity(
          c.id,
          graph,
          c.patternId,
          patternGraph,
          func,
          finalized,
        );
        score += (1 / this.pathLength(graph, id, c.id)) * childScore;
      }
      const parentsSearch = this.#parentsSearch(
        id,
        graph,
        patternGraphId,
        patternGraph,
        func,
      );
      for (const p of parentsSearch) {
        var parentScore = this.#informationProximity(
          p.id,
          graph,
          p.patternId,
          patternGraph,
          func,
          finalized,
        );
        score += (1 / this.pathLength(graph, p.id, id)) * parentScore;
      }
      score = score * (1 + nodeScore);
      return score;
    } else {
      return finalized.get(id + patternGraphId)!;
    }
  }

  #normalizeResults(
    patternGraph: AMRGraph,
    patternFindId: string,
    results: ScoreResult[],
    func: ScoreFunc,
  ): void {
    const maxScore = this.#informationProximity(
      patternFindId,
      patternGraph,
      patternFindId,
      patternGraph,
      func,
    );
    for (const r of results) {
      r.score = r.score / maxScore;
    }
  }

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
    patternFindId?: string,
    getScores: boolean = true,
    func: ScoreFunc = AMRUtils.#defaultScoreFunc,
  ): ScoreResult[] | string[] {
    const results: ScoreResult[] = [];
    if (!patternFindId) {
      patternFindId = this.search(patternGraph, "amr-unknown")[0];
    }
    for (const id in graph) {
      const result = this.#informationProximity(
        id,
        graph,
        patternFindId,
        patternGraph,
        func,
      );
      if (result > 0) {
        results.push({ id: id, score: result });
      }
    }
    this.#normalizeResults(
      patternGraph,
      patternFindId,
      results,
      func,
    );
    results.sort((a: ScoreResult, b: ScoreResult) => {
      return (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0);
    });
    if (!getScores) {
      return results.map((r) => r.id);
    }
    return results;
  }
}
