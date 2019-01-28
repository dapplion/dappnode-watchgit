const fs = require('fs')
const {promisify} = require('util')
const shell = require('./shell')

async function readFileAndCreate(path) {
    try {
        const data = await promisify(fs.readFile)(path, 'utf8')
        return data.trim()
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log(`File not found at ${path}, creating a new empty one`)
            await shell(`mkdir -p "$(dirname "${path}")" && touch "${path}"`)
            return '';
        } else {
            e.message = `Error reading file at ${path}: ${e.message}`
            throw e
        }
    }
}  

module.exports = readFileAndCreate
