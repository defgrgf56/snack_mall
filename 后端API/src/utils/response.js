// src/utils/response.js - 统一响应格式
class Response {
  /**
   * 成功响应
   */
  static success(res, data = null, message = 'success', code = 200) {
    return res.status(200).json({
      code,
      message,
      data
    })
  }

  /**
   * 失败响应
   */
  static error(res, message = 'error', code = 400, data = null) {
    return res.status(code >= 500 ? 500 : 200).json({
      code,
      message,
      data
    })
  }

  /**
   * 分页响应
   */
  static paginate(res, data, total, page, pageSize) {
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        list: data,
        pagination: {
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(total / pageSize)
        }
      }
    })
  }

  /**
   * 未授权
   */
  static unauthorized(res, message = '未授权') {
    return res.status(200).json({
      code: 401,
      message,
      data: null
    })
  }

  /**
   * 禁止访问
   */
  static forbidden(res, message = '禁止访问') {
    return res.status(200).json({
      code: 403,
      message,
      data: null
    })
  }

  /**
   * 未找到
   */
  static notFound(res, message = '资源不存在') {
    return res.status(200).json({
      code: 404,
      message,
      data: null
    })
  }

  /**
   * 服务器错误
   */
  static serverError(res, message = '服务器错误') {
    return res.status(500).json({
      code: 500,
      message,
      data: null
    })
  }
}

module.exports = Response
