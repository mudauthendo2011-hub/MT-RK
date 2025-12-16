const fs = require("fs")
const path = require("path")
const rootDir = __dirname
const modules = {}

const bin = path.join(__dirname, "bin")

if (!fs.existsSync(bin)) {
  fs.mkdirSync(bin, { recursive: true })
}

global.bin = bin
global.strd = path.join(__dirname, "store")

const configPath = path.join(__dirname, "..", "config.js")
modules.config = () => require(configPath)

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const filePath = path.join(dirPath, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      processDir(filePath)
    } else if (
      stats.isFile() &&
      path.extname(file) === ".js" &&
      file !== "index.js"
    ) {
      const mod = require(filePath)

      if (typeof mod === "object") {
        Object.assign(modules, mod)
      } else {
        modules[path.basename(file, ".js")] = mod
      }
    }
  })
}

processDir(rootDir)
module.exports = modules
