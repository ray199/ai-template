// 通用文件工具函数

const fs = require('fs');
const path = require('path');

/**
 * 读取文件内容
 * @param {string} filePath - 文件路径
 * @returns {string} 文件内容
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return '';
  }
}

/**
 * 写入文件内容
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 * @returns {boolean} 是否成功
 */
function writeFile(filePath, content) {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否存在
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 列出目录下的文件
 * @param {string} dirPath - 目录路径
 * @param {string} pattern - 文件匹配模式
 * @returns {string[]} 文件路径列表
 */
function listFiles(dirPath, pattern) {
  try {
    const files = fs.readdirSync(dirPath);
    if (!pattern) {
      return files.map(file => path.join(dirPath, file));
    }
    
    const regex = new RegExp(pattern);
    return files
      .filter(file => regex.test(file))
      .map(file => path.join(dirPath, file));
  } catch (error) {
    console.error(`Error listing files in ${dirPath}:`, error);
    return [];
  }
}

/**
 * 复制文件
 * @param {string} sourcePath - 源文件路径
 * @param {string} destPath - 目标文件路径
 * @returns {boolean} 是否成功
 */
function copyFile(sourcePath, destPath) {
  try {
    // 确保目标目录存在
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.copyFileSync(sourcePath, destPath);
    return true;
  } catch (error) {
    console.error(`Error copying file from ${sourcePath} to ${destPath}:`, error);
    return false;
  }
}

/**
 * 删除文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否成功
 */
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
}

module.exports = {
  readFile,
  writeFile,
  fileExists,
  listFiles,
  copyFile,
  deleteFile
};