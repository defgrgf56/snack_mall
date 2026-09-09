/**
 * 数据导出工具
 * 基于 xlsx 和 file-saver 实现 Excel 导出功能
 */
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * 导出数据到 Excel
 * @param {Array} data - 要导出的数据数组
 * @param {String} filename - 文件名（不含扩展名）
 * @param {String} sheetName - 工作表名称
 * @param {Object} options - 其他选项
 */
export function exportToExcel(data, filename = '导出数据', sheetName = 'Sheet1', options = {}) {
  if (!data || data.length === 0) {
    throw new Error('没有可导出的数据')
  }

  try {
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    // 设置列宽
    const colWidths = Object.keys(data[0] || {}).map(key => {
      // 计算列宽：取标题和数据中的最大宽度
      const headerLen = key.length
      const dataLen = Math.max(
        ...data.map(row => String(row[key] || '').length)
      )
      const maxLen = Math.max(headerLen, dataLen)
      return { wch: Math.min(maxLen + 2, 50) } // 最大50字符宽度
    })
    worksheet['!cols'] = colWidths

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      ...options 
    })
    
    // 创建 Blob 对象
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const fullFilename = `${filename}_${timestamp}.xlsx`
    
    // 保存文件
    saveAs(blob, fullFilename)
    
    return {
      success: true,
      filename: fullFilename,
      count: data.length
    }
  } catch (error) {
    console.error('导出 Excel 失败:', error)
    throw new Error('导出失败: ' + error.message)
  }
}

/**
 * 导出数据到 CSV
 * @param {Array} data - 要导出的数据数组
 * @param {String} filename - 文件名（不含扩展名）
 */
export function exportToCSV(data, filename = '导出数据') {
  if (!data || data.length === 0) {
    throw new Error('没有可导出的数据')
  }

  try {
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    // 转换为 CSV
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    
    // 添加 UTF-8 BOM 以支持中文
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    
    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const fullFilename = `${filename}_${timestamp}.csv`
    
    // 保存文件
    saveAs(blob, fullFilename)
    
    return {
      success: true,
      filename: fullFilename,
      count: data.length
    }
  } catch (error) {
    console.error('导出 CSV 失败:', error)
    throw new Error('导出失败: ' + error.message)
  }
}

/**
 * 导出多个工作表到一个 Excel 文件
 * @param {Array} sheets - 工作表数组 [{ name: '工作表名', data: [] }]
 * @param {String} filename - 文件名（不含扩展名）
 */
export function exportMultiSheets(sheets, filename = '导出数据') {
  if (!sheets || sheets.length === 0) {
    throw new Error('没有可导出的数据')
  }

  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    
    // 添加所有工作表
    sheets.forEach(sheet => {
      if (sheet.data && sheet.data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(sheet.data)
        
        // 设置列宽
        const colWidths = Object.keys(sheet.data[0] || {}).map(key => {
          const headerLen = key.length
          const dataLen = Math.max(
            ...sheet.data.map(row => String(row[key] || '').length)
          )
          const maxLen = Math.max(headerLen, dataLen)
          return { wch: Math.min(maxLen + 2, 50) }
        })
        worksheet['!cols'] = colWidths
        
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name || 'Sheet')
      }
    })

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    })
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const fullFilename = `${filename}_${timestamp}.xlsx`
    
    saveAs(blob, fullFilename)
    
    return {
      success: true,
      filename: fullFilename,
      sheetCount: sheets.length
    }
  } catch (error) {
    console.error('导出多工作表 Excel 失败:', error)
    throw new Error('导出失败: ' + error.message)
  }
}

export default {
  exportToExcel,
  exportToCSV,
  exportMultiSheets
}