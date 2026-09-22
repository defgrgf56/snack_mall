// src/websocket.js - WebSocket 服务器
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');

const JWT_SECRET = process.env.JWT_SECRET || 'snack-mall-secret-key-2026';

class AdminWebSocket {
  constructor(server) {
    this.wss = new WebSocket.Server({ noServer: true });
    // 管理员连接池: adminId → Set<ws>
    this.adminClients = new Map();

    // 监听 upgrade 事件，手动处理路径
    server.on('upgrade', (request, socket, head) => {
      const { pathname } = url.parse(request.url, true);
      if (pathname === '/ws/admin') {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    this.startHeartbeat();
    console.log('✓ WebSocket 服务器已创建 (路径: /ws/admin)');
  }

  handleConnection(ws, request) {
    const { query } = url.parse(request.url, true);
    const token = query.token;

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const adminId = decoded.id;

      // 存储连接
      if (!this.adminClients.has(adminId)) {
        this.adminClients.set(adminId, new Set());
      }
      this.adminClients.get(adminId).add(ws);

      ws.adminId = adminId;
      ws.isAlive = true;

      ws.on('pong', () => { ws.isAlive = true; });

      ws.on('close', () => {
        const clients = this.adminClients.get(adminId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) {
            this.adminClients.delete(adminId);
          }
        }
        console.log(`WebSocket 管理员 ${adminId} 断开连接`);
      });

      ws.on('error', (err) => {
        console.error(`WebSocket 错误 (admin ${adminId}):`, err.message);
      });

      // 连接成功确认
      ws.send(JSON.stringify({ type: 'connected', adminId }));
      console.log(`✓ 管理员 ${adminId} 已连接 WebSocket`);

    } catch (error) {
      ws.close(1008, 'Invalid token');
    }
  }

  // 推送通知给所有管理员
  broadcast(notification) {
    const payload = JSON.stringify({
      type: 'notification',
      data: notification
    });

    this.adminClients.forEach((clients) => {
      clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
    });
  }

  // 推送通知给指定管理员
  sendToAdmin(adminId, notification) {
    const clients = this.adminClients.get(adminId);
    if (!clients) return;

    const payload = JSON.stringify({
      type: 'notification',
      data: notification
    });

    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }

  // 心跳检测：清理断开的连接
  startHeartbeat() {
    this._heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  // 获取当前在线管理员数
  getOnlineCount() {
    return this.adminClients.size;
  }

  // 关闭服务器
  close() {
    clearInterval(this._heartbeatInterval);
    this.wss.close();
  }
}

module.exports = AdminWebSocket;