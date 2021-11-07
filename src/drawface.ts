import { Point, Scene, Vertex } from "./struct.js";

export { drawSolid };

function assert(value: any) {
  if (!value) throw new Error("Error!");
}

class OBJ {
  v: Array<Vertex> = [];
  f: Array<Array<number>> = [];
  constructor() {
  }
}

function getobj(obj: OBJ): string {
  let ans = "";
  for (let i = 0; i < obj.v.length; i++) {
    ans = ans + `v ${obj.v[i].x} ${obj.v[i].y} ${obj.v[i].z}\n`;
  }
  for (let i = 0; i < obj.f.length; i++) {
    ans = ans + `f `;
    for (let j = 0; j < obj.f[i].length; j++)
      ans = ans + `${obj.f[i][j]} `;
    ans = ans + `\n`;
  }
  return ans;
}

function triangulate(scene: Scene): false | OBJ {
  let idmap: { [key: number]: number } = {};
  let plist: Array<Vertex> = [];
  let trilist: Array<Array<number>> = [];
  for (let idx in scene.vdict) {
    let vert = scene.vdict[idx];
    plist.push(vert);
    idmap[idx] = plist.length - 1;
  }

  function randomTransVert(v: Vertex, trans1: Point, trans2: Point): Vertex {
    let xx = v.x * trans1.x + v.y * trans1.y + v.z * trans1.z;
    let yy = v.y * trans2.x + v.y * trans2.y + v.z * trans2.z;
    let nvert = new Vertex(new Point(xx, yy, 0.0));
    nvert.id = v.id;
    return nvert;
  }

  for (let si = 0; si < scene.solids.length; si++) {

    let nowSolid = scene.solids[si];
    for (let fi = 0; fi < nowSolid.faces.length; fi++) {
      let nowFace = nowSolid.faces[fi];

      // loops[0] contour
      let nowLoop = nowFace.loops[0];
      let contour: Array<Vertex> = [];
      let foo = nowLoop.bgEdge;

      let trans1 = new Point(0.432, 1.432, 0.893);
      let trans2 = new Point(0.932, 1.232, 1.23);

      do {
        assert(!(!foo || !foo.next || !foo.vert));
        contour.push(randomTransVert(foo.vert, trans1, trans2));
        foo = foo.next;
      } while (foo !== nowLoop.bgEdge)

      let swctx = new poly2tri.SweepContext(contour);
      // loop[i] hole

      let holes: Array<Array<Vertex>> = [];
      for (let li = 1; li < nowFace.loops.length; li++) {
        nowLoop = nowFace.loops[li];
        let hole: Array<Vertex> = [];
        let foo = nowLoop.bgEdge;
        do {
          assert(!(!foo || !foo.next || !foo.vert));
          hole.push(randomTransVert(foo.vert, trans1, trans2));
          foo = foo.next;
        } while (foo !== nowLoop.bgEdge)
        holes.push(hole);
      }

      swctx.addHoles(holes);

      swctx.triangulate();
      let triangles = swctx.getTriangles();
      triangles.forEach((tri) => {
        let bar: Array<number> = [];
        tri.getPoints().forEach((p) => {
          bar.push(idmap[(p as Vertex).id] + 1);
        });
        trilist.push(bar);
      })
    }
  }
  let ans = { v: plist, f: trilist } as OBJ;
  return ans;
}

function drawSolid(scene: Scene, content: String): string {
  content.split("\n").forEach((line) => {
    let words = line.replace(/[(),]+/g, ' ').split(' ').filter((str) => { return str }) as Array<string>;
    if (words[0] === 'mvsf') {
      let idx = parseInt(words[1]);
      let [x, y, z] = [parseFloat(words[2]), parseFloat(words[3]), parseFloat(words[4])];
      let loopid = parseInt(words[5]);
      let faceid = parseInt(words[6]);
      assert(scene.mvsf(idx, new Point(x, y, z), loopid, faceid));
    }
    else if (words[0] === 'mev') {
      let [idx, idy] = [parseInt(words[1]), parseInt(words[2])];
      let [x, y, z] = [parseFloat(words[3]), parseFloat(words[4]), parseFloat(words[5])];
      let loopid = parseInt(words[6]);
      let edgeid = parseInt(words[7]);
      assert(scene.mev(idx, idy, new Point(x, y, z), loopid, edgeid));
    }
    else if (words[0] === 'mef') {
      let [idx, idy] = [parseInt(words[1]), parseInt(words[2])];
      let [loopid, edgeid, faceid, newloopid] = [parseInt(words[3]), parseInt(words[4]), parseInt(words[5]), parseInt(words[6])];
      assert(scene.mef(idx, idy, loopid, edgeid, faceid, newloopid));
    }
    else if (words[0] === 'kemr') {
      let [ide, loopid] = [parseInt(words[1]), parseInt(words[2])];
      let newloopid = parseInt(words[3]);
      assert(scene.kemr(ide, loopid, newloopid));

    }
    else if (words[0] === 'kfmrh') {
      let [fs, fl] = [parseInt(words[1]), parseInt(words[2])];
      assert(scene.kfmrh(fs, fl));
    }
    else if (words[0] === 'sweep') {
      let [x, y, z] = [parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3])];
      assert(scene.sweep(new Point(x, y, z)));
    }
    else return;
  })
  let obj = triangulate(scene);
  assert(obj);
  let objstring = getobj(obj);
  return objstring;
}
