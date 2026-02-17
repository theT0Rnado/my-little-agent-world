import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type MessageHandler = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private isConnected = false;

  connect() {
    if (this.isConnected) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        
        // Подписка на новости
        this.client?.subscribe('/topic/raw-news', (message: IMessage) => {
          const data = JSON.parse(message.body);
          console.log('📰 Received news:', data);
          this.notifyHandlers('raw-news', data);
        });
        
        // Подписка на данные всех агентов
        this.client?.subscribe('/topic/get-all-agents-data', (message: IMessage) => {
          const data = JSON.parse(message.body);
          console.log('👥 Received agents data:', data);
          this.notifyHandlers('agents-data', data);
        });
        
        // Подписка на сообщения агентов
        this.client?.subscribe('/topic/get-agent-message', (message: IMessage) => {
          const data = JSON.parse(message.body);
          console.log('💬 Received agent message:', data);
          this.notifyHandlers('agent-message', data);
        });
      },
      
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        this.isConnected = false;
      },

      onDisconnect: () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      console.log('🛑 WebSocket disconnected manually');
    }
  }

  // Подписка на события
  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)?.push(handler);
  }

  // Отписка
  off(event: string, handler: MessageHandler) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private notifyHandlers(event: string, data: any) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Отправить сообщение агенту
  sendMessageToAgent(agentId: string, text: string) {
    if (!this.client?.connected) {
      console.error('❌ WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/send-message-to-agent',
      body: JSON.stringify({ 
        agentId, 
        message: text 
      })
    });
    
    console.log('📤 Sent message to agent:', agentId, text);
  }

  // Отправить глобальное событие
  sendGlobalEvent(text: string) {
    if (!this.client?.connected) {
      console.error('❌ WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/global-event',
      body: JSON.stringify({ text })
    });
    
    console.log('📤 Sent global event:', text);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const wsService = new WebSocketService();
