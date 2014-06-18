"use strict"

var NUM_VERTS = 10

var shell = require("gl-now")({
  tickRate: 2,
  clearColor: [0,0,0,0] 
})
var camera = require("game-shell-orbit-camera")(shell)
var now = require("right-now")
var createScatter = require("gl-scatter-plot")
var createClipper = require("../trim")
var mat4 = require("gl-matrix").mat4
var createAxes = require("gl-axes")

camera.lookAt(
  [10,0,0],
  [0,0,0],
  [0,1,0])

var phases, freqs, clipper, pointCloud, axes

function getVerts() {
  var t = 0.0001 * now()
  var verts = new Array(NUM_VERTS)
  for(var i=0; i<NUM_VERTS; ++i) {
    var p = phases[i]
    var f = freqs[i]
    verts[i] = [
      Math.sin(f[0] * t + p[0]),
      Math.sin(f[1] * t + p[1]),
      Math.sin(f[2] * t + p[2]) ]
  }
  return verts
}


shell.on("gl-init", function() {
  var gl = shell.gl

  //Initialize curve parameters
  phases = new Array(NUM_VERTS)
  freqs = new Array(NUM_VERTS)
  for(var i=0; i<NUM_VERTS; ++i) {
    phases[i] = [
      2.0 * Math.PI * Math.random(), 
      2.0 * Math.PI * Math.random(), 
      2.0 * Math.PI * Math.random() ]
    freqs[i] = [ 
      (Math.random() * 30)|0,
      (Math.random() * 30)|0,
      (Math.random() * 30)|0 ]
  }

  //Create point cloud
  var pcVerts = new Array(1000)
  var pcColors = new Array(1000)
  for(var i=0; i<1000; ++i) {
    pcVerts[i] = [
      2*Math.random()-1,
      2*Math.random()-1,
      2*Math.random()-1]
    pcColors[i] = [
      Math.random(),
      Math.random(),
      Math.random()]
  }
  pointCloud = createScatter(gl, {
    positions: pcVerts,
    colors: pcColors,
    size: 12,
    orthographic: true
  })

  //Initialize shell
  clipper = createClipper(gl, getVerts())

  axes = createAxes(gl, {
    bounds: [[-1,-1,-1], [1,1,1]]
  })
})

shell.on("gl-render", function() {
  var gl = shell.gl
  var cameraParameters = {
    view: camera.view(),
    projection: mat4.perspective(
        mat4.create(),
        Math.PI/4.0,
        shell.width/shell.height,
        0.1,
        1000.0)
  }
  gl.clear(gl.DEPTH_BUFFER_BIT)
  gl.depthMask(true)
  gl.enable(gl.DEPTH_TEST)

  axes.draw(cameraParameters)

  clipper.update(getVerts())
  clipper.draw(cameraParameters)

  pointCloud.draw(cameraParameters)
})