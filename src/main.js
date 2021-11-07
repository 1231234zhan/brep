
import { render, stopAni, renderInit } from "./show.js";
import { drawSolid } from "./drawface.js"
import { Scene } from "./struct.js";

function inputRender() {
  stopAni();
  setTimeout(() => {
    let content = document.querySelector('#input').value;
    let scene = new Scene();
    let objstring;
    try {
      objstring = drawSolid(scene, content);
      document.querySelector('#output').value = objstring;

      render(objstring);

    } catch (e) {
      console.log(e);
    }
  }, 500);

}


function main() {
  renderInit();
  inputRender();
  let btn = document.querySelector('#draw');
  btn.addEventListener("click", inputRender);
}

main();