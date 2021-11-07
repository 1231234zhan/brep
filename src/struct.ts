
export { Point, Vertex, HalfEdge, Loop, Face, Solid, Scene }

function rand(): number {
  return Math.floor(Math.random() * 11451418)
}

function validid(id: number): number {
  return id ? id : rand();
}

class Point {
  x: number = .0;
  y: number = .0;
  z: number = .0;
  constructor(xx: number, yy: number, zz: number) {
    this.x = xx;
    this.y = yy;
    this.z = zz;
  }
}

function addPoint(a: Point, b: Point): Point {
  return new Point(a.x + b.x, a.y + b.y, a.z + b.z);
}

class Vertex extends Point {
  // c: Point;
  id: number = 0;  // id must larger than zero, id=0 is not valid!
  constructor(p: Point) {
    super(p.x, p.y, p.z);
  }
}

class HalfEdge {
  id: number = 0;  // twin halfedge will share same id
  next: HalfEdge | null = null;
  prev: HalfEdge | null = null;
  vert: Vertex | null = null;
  floop: Loop | null = null;
  twin: HalfEdge | null = null;
  constructor() {
  }
}


class Loop {
  id: number = 0;
  fface: Face | null = null;
  bgEdge: HalfEdge | null = null;
  constructor() {
  }
}

class Face {
  id: number = 0;
  fsolid: Solid | null = null;
  loops: Array<Loop> = [];
  constructor() {
  }
}

class Solid {
  faces: Array<Face> = [];
  constructor() {
  }
}

class Scene {
  solids: Array<Solid> = [];
  vdict: { [key: number]: Vertex } = {};
  edict: { [key: number]: HalfEdge } = {};
  ldict: { [key: number]: Loop } = {};
  fdict: { [key: number]: Face } = {};

  vid: number = 10000;

  mvsf(idx: number, p: Point, loopid: number = rand(), faceid: number = rand()): false | number {
    let solid = new Solid();
    let face = new Face();
    let loop = new Loop();

    let vert = new Vertex(p);
    vert.id = validid(idx);
    this.vdict[vert.id] = vert;

    this.solids.push(solid);
    solid.faces.push(face);
    face.loops.push(loop);

    loop.fface = face;
    loop.id = validid(loopid);
    this.ldict[loop.id] = loop;

    face.fsolid = solid;
    face.id = validid(faceid);
    this.fdict[face.id] = face;
    return loopid;
  }

  findVertEdgebyNext(pEdge: HalfEdge | null, vert: Vertex): HalfEdge | null {
    if (!pEdge) return null;
    let bgEdge = pEdge;
    do {
      if (pEdge.next?.vert === vert) return pEdge;
      pEdge = pEdge.next;
    } while (pEdge && pEdge !== bgEdge);
    return null;
  }

  findVertEdgebyPrev(pEdge: HalfEdge | null, vert: Vertex): HalfEdge | null {
    if (!pEdge) return null;
    let bgEdge = pEdge;
    do {
      if (pEdge.vert === vert) return pEdge;
      pEdge = pEdge.prev;
    } while (pEdge && pEdge !== bgEdge);
    return null;
  }

  mev(idx: number, idy: number, py: Point, loopid: number, edgeid: number = rand()): false | number {
    let vertx = this.vdict[idx];
    let nowLoop = this.ldict[loopid];
    if (!vertx) return false;

    let verty = new Vertex(py);
    verty.id = validid(idy);
    this.vdict[verty.id] = verty;

    let edgex = new HalfEdge();
    let edgey = new HalfEdge();

    edgey.id = edgex.id = validid(edgeid);
    this.edict[edgey.id] = edgex;

    edgex.vert = vertx;
    edgey.vert = verty;
    edgex.twin = edgey;
    edgey.twin = edgex;

    edgex.floop = nowLoop;
    edgey.floop = nowLoop;

    if (nowLoop.bgEdge === null) {
      nowLoop.bgEdge = edgey;
      edgex.next = edgex.prev = edgey;
      edgey.next = edgey.prev = edgex;
    } else {
      let prevVertxEdge: HalfEdge | null = nowLoop.bgEdge;
      prevVertxEdge = this.findVertEdgebyNext(prevVertxEdge, vertx);
      let nextVertxEdge = prevVertxEdge?.next;
      if (!prevVertxEdge || !nextVertxEdge) return false;

      nextVertxEdge.prev = edgey;
      edgey.next = nextVertxEdge;

      prevVertxEdge.next = edgex;
      edgex.prev = prevVertxEdge;

      edgex.next = edgey;
      edgey.prev = edgex;
    }
    return loopid;
  }

  checkSameLoop(edge1: null | HalfEdge, edge2: null | HalfEdge): boolean {
    let bgEdge = edge1;
    do {
      if (edge1 === edge2) return true;
      if (!edge1) return false;
      edge1 = edge1.next;
    } while (edge1 && edge1 !== bgEdge);
    return false;
  }

  mef(idx: number, idy: number, loopid: number, edgeid: number = rand(), faceid: number = rand(), newloopid: number = rand()): false | number {
    let nowLoop = this.ldict[loopid];

    let vertx = this.vdict[idx];
    let verty = this.vdict[idy];
    if (!vertx || !verty) return false;

    let newFace = new Face;
    let newLoop = new Loop;
    let edgex = new HalfEdge();
    let edgey = new HalfEdge();

    edgey.id = edgex.id = validid(edgeid);
    this.edict[edgey.id] = edgex;

    edgex.vert = vertx;
    edgey.vert = verty;
    edgex.floop = nowLoop;
    edgey.floop = newLoop;
    edgex.twin = edgey;
    edgey.twin = edgex;

    let edgeXP: HalfEdge | null = nowLoop.bgEdge;
    let edgeYP: HalfEdge | null = nowLoop.bgEdge;
    edgeXP = this.findVertEdgebyNext(edgeXP, vertx);
    edgeYP = this.findVertEdgebyNext(edgeYP, verty);

    let edgeXN = edgeXP?.next;
    let edgeYN = edgeYP?.next;

    if (!edgeXN || !edgeXP || !edgeYN || !edgeYP) return false;

    edgex.prev = edgeXP;
    edgex.next = edgeYN;
    edgey.prev = edgeYP;
    edgey.next = edgeXN;

    edgeXP.next = edgex;
    edgeYP.next = edgey;
    edgeXN.prev = edgey;
    edgeYN.prev = edgex;

    newLoop.bgEdge = edgey;
    if (this.checkSameLoop(newLoop.bgEdge, nowLoop.bgEdge))
      nowLoop.bgEdge = edgex;
    // TODO: change new loop edges' floop
    newLoop.fface = newFace;
    newLoop.id = validid(newloopid);
    this.ldict[newLoop.id] = newLoop;

    newFace.loops.push(newLoop);
    let nowSolid = nowLoop.fface?.fsolid;
    if (!nowSolid) return false;
    newFace.fsolid = nowSolid;
    newFace.id = validid(faceid);
    this.fdict[newFace.id] = newFace;

    nowSolid.faces.push(newFace);
    return newloopid;
  }

  kemr(ide: number, loopid: number, newloopid: number = rand()): false | number {
    let nowLoop = this.ldict[loopid];

    let edgei = this.edict[ide];
    let edgej = edgei.twin;
    if (!edgei || !edgej) return false;

    let edgePi = edgei.prev;
    let edgeNi = edgei.next;
    let edgePj = edgej.prev;
    let edgeNj = edgej.next;

    if (!edgePi || !edgePj || !edgeNi || !edgeNj) return false;

    edgePi.next = edgeNj;
    edgeNj.prev = edgePi;
    edgeNi.prev = edgePj;
    edgePj.next = edgeNi;

    delete this.edict[ide];
    // without being refered, edgei and edgej should be deleted automaticly

    // check which loop is new loop
    let newLoop = new Loop;
    let faface = nowLoop.fface;
    if (!faface) return false;
    let verti = edgei.vert;
    let vertj = edgej.vert;
    if (!verti || !vertj) return false;
    let foo: HalfEdge | null = nowLoop.bgEdge;
    let bar: HalfEdge | null = nowLoop.bgEdge;
    foo = this.findVertEdgebyPrev(foo, verti);
    bar = this.findVertEdgebyPrev(bar, vertj);
    if (foo) {
      // vertj at new loop
      newLoop.bgEdge = edgePj;
    } else if (bar) {
      // verti at new loop
      newLoop.bgEdge = edgePi;
    }
    else return false;

    newLoop.fface = faface;
    faface.loops.push(newLoop);
    newLoop.id = validid(newloopid);
    this.ldict[newLoop.id] = newLoop;

    return newloopid;
  }

  kfmrh(fs: number, fl: number): boolean {
    let faceS = this.fdict[fs];
    let faceL = this.fdict[fl];

    // only one loop is allowed to exist in small face
    if (faceS.loops.length != 1) return false;
    let loopS = faceS.loops[0];
    faceS.loops.splice(0, 1);

    faceL.loops.push(loopS);
    loopS.fface = faceL;

    // delete faceS
    delete this.fdict[fs];
    let nowSolid = faceS.fsolid;
    if (!nowSolid) return false;
    for (let i = 0; i < nowSolid.faces.length; i++)
      if (nowSolid.faces[i].id === faceS.id) {
        nowSolid.faces.splice(i, 1);
        return true;
      }
    return false;
  }

  sweepLoop(vec: Point, loopid: number): boolean {
    let nowLoop = this.ldict[loopid];
    let foo: null | HalfEdge = nowLoop.bgEdge;
    let newVertList: Array<number> = [];
    let oldVertList: Array<number> = [];

    do {
      if (!foo || !foo.vert) return false;
      let idx = foo.vert.id;
      newVertList.push(this.vid);
      oldVertList.push(idx);
      this.vid += 1;
      foo = foo.next;
    } while (foo !== nowLoop.bgEdge)

    // make new vertex and edge
    for (let i = 0; i < oldVertList.length; i++) {
      let oldVert = this.vdict[oldVertList[i]];
      this.mev(oldVertList[i], newVertList[i], addPoint(oldVert, vec), loopid);
    }

    // make new face
    newVertList.push(newVertList[0]);
    for (let i = 1; i < newVertList.length; i++) {
      this.mef(newVertList[i - 1], newVertList[i], loopid);
    }

    return true;
  }
  // Use Point to represent sweep direction and length
  sweep(vec: Point): boolean {
    for (let si = 0; si < this.solids.length; si++) {
      let nowSolid = this.solids[si];

      // the largest face's index is 0
      let oldFaceNum = nowSolid.faces.length;
      let faceL = nowSolid.faces[0];
      this.sweepLoop(vec, faceL.loops[0].id);

      // normally, inner faces' index start from 2
      for (let i = 2; i < oldFaceNum; oldFaceNum--) {
        let faceS = nowSolid.faces[i];
        if (faceS.loops.length != 1) return false;

        if (!this.sweepLoop(vec, faceS.loops[0].id)) return false;
        if (!this.kfmrh(faceS.id, faceL.id)) return false;
      }
    }
    return true;
  }
}

function test1() {
  let scene = new Scene();
  let p1 = new Point(0, 0, 0);
  let p2 = new Point(1, 0, 0);
  let p3 = new Point(0, 1, 0);
  let lid = scene.mvsf(1, p1, 1);
  if (lid === false) return;
  lid = scene.mev(1, 2, p2, lid);
  if (lid === false) return;
  lid = scene.mev(2, 3, p3, lid);
  if (lid === false) return;
  lid = scene.mef(1, 3, lid);
  if (lid === false) return;
  console.log(scene.solids[0])
  console.log(scene.solids[0].faces[0])
  console.log(scene.solids[0].faces[1])
}

function test2() {
  let scene = new Scene();
  let p1 = new Point(0, 0, 0);
  let p2 = new Point(3, 0, 0);
  let p3 = new Point(0, 3, 0);
  let p4 = new Point(1, 1, 0);
  let p5 = new Point(2, 1, 0);
  let p6 = new Point(1, 2, 0);

  let lid = scene.mvsf(1, p1, 1, 20);
  if (lid === false) return;
  lid = scene.mev(1, 2, p2, lid, 11);
  if (lid === false) return;
  lid = scene.mev(2, 3, p3, lid, 12);
  if (lid === false) return;
  lid = scene.mef(1, 3, lid, 13, 21, 2);
  if (lid === false) return;

  lid = scene.mev(1, 4, p4, lid, 14);
  if (lid === false) return;
  lid = scene.mev(4, 5, p5, lid, 15);
  if (lid === false) return;
  lid = scene.mev(5, 6, p6, lid, 16);
  if (lid === false) return;
  lid = scene.mef(4, 6, lid, 17, 22, 3);
  if (lid === false) return;
  lid = scene.kemr(14, 2, 4);
  if (lid === false) return;
  // TODO : repeat id number identification
  console.log(scene.solids[0].faces[0])
  console.log(scene.solids[0].faces[1])
  console.log(scene.solids[0].faces[2])
}

// test2();