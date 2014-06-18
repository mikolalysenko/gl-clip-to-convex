"use strict"

module.exports = createTrimPolytope

var createBuffer = require("gl-buffer")
var createVAO = require("gl-vao")
var createState = require("gl-state")
var glslify = require("glslify")
var convexHull = require("incremental-convex-hull")

var createShader = glslify({
  vertex: "./shaders/vertex.glsl",
  fragment: "./shaders/fragment.glsl"
})

var IDENTITY = [ 1,0,0,0, 
                 0,1,0,0,
                 0,0,1,0,
                 0,0,0,1 ]

function TrimPolytope(gl, shader, buffer, vao, state) {
  this.gl = gl
  this.shader = shader
  this.buffer = buffer
  this.vao = vao
  this.state = state
  this.vertexCount = 0
}

var proto = TrimPolytope.prototype

proto.draw = function(camera) {
  var gl = this.gl

  this.shader.bind()
  this.shader.uniforms = {
    model: camera.model || IDENTITY,
    view: camera.view || IDENTITY,
    projection: camera.projection || IDENTITY
  }
  this.state.push()

  gl.clearDepth(0)
  gl.clear(gl.DEPTH_BUFFER_BIT)
  gl.depthMask(true)
  gl.depthFunc(gl.ALWAYS)
  gl.enable(gl.DEPTH_TEST)
  gl.frontFace(gl.CW)
  gl.cullFace(gl.BACK)
  gl.enable(gl.CULL_FACE)
  gl.colorMask(false, false, false, false)

  this.vao.bind()
  this.vao.draw(gl.TRIANGLES, this.vertexCount)

  this.state.pop()
}

proto.update = function(vertices) {
  var cells = convexHull(vertices)
  var nverts = new Array(cells.length * 9)
  var ptr = 0
  for(var i=0; i<cells.length; ++i) {
    var c = cells[i]
    for(var j=0; j<3; ++j) {
      var x = vertices[c[j]]
      for(var k=0; k<3; ++k) {
        nverts[ptr++] = x[k]
      }
    }
  }
  this.buffer.update(nverts)
  this.vertexCount = cells.length*3
}

proto.dispose = function() {
  this.shader.dispose()
  this.vao.dispose()
  this.buffer.dispose()
}

function createTrimPolytope(gl, vertices) {
  var shader = createShader(gl)
  shader.attributes.position.location = 0

  var buffer = createBuffer(gl)
  var vao = createVAO(gl, [{
      "buffer": buffer,
      "size": 3
    }])
  var state = createState(gl, [
    gl.DEPTH_CLEAR_VALUE,
    gl.DEPTH_TEST,
    gl.DEPTH_WRITEMASK,
    gl.DEPTH_FUNC,
    gl.FRONT_FACE,
    gl.CULL_FACE_MODE,
    gl.CULL_FACE,
    gl.COLOR_WRITEMASK ])

  var clipper = new TrimPolytope(
    gl, 
    shader,
    buffer,
    vao,
    state)
  clipper.update(vertices) 
  return clipper
}