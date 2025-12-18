/**
 * @name SimpleColorfulChat
 * @description Простая раскраска имён в чате
 * @version 1.0.0
 * @aurot balihinxd
 * @source https://github.com/balihinxd/SimpleColorfulChat
 */

module.exports = class SimpleColorfulChat {
  constructor() {
    this.name = "Simple Colorful Chat";
    this.author = "YourName";
    this.version = "1.0.0";
    this.description = "Раскрашивает имена пользователей в разные цвета";
  }
  
  start() {
    console.log('SimpleColorfulChat запущен');
    this.colorCache = new Map();
    this.injectStyles();
    this.observeChat();
  }
  
  stop() {
    console.log('SimpleColorfulChat остановлен');
    // Очистка
    const style = document.getElementById('simple-colorful-chat-css');
    if (style) style.remove();
    
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  injectStyles() {
    const css = `
      .sc-colorful-name {
        color: var(--sc-user-color) !important;
        transition: color 0.3s ease !important;
      }
    `;
    
    const style = document.createElement('style');
    style.id = 'simple-colorful-chat-css';
    style.textContent = css;
    document.head.appendChild(style);
  }
  
  observeChat() {
    // Наблюдаем за чатом
    this.observer = new MutationObserver(() => {
      this.colorizeNames();
    });
    
    // Начинаем наблюдение
    const target = document.querySelector('.chatContent') || 
                   document.querySelector('[class*="messagesWrapper"]');
    
    if (target) {
      this.observer.observe(target, {
        childList: true,
        subtree: true
      });
      
      // Первоначальная раскраска
      setTimeout(() => this.colorizeNames(), 1000);
    }
  }
  
  colorizeNames() {
    // Находим все имена пользователей
    const nameElements = document.querySelectorAll('[class*="username"], [class*="author"]');
    
    nameElements.forEach(element => {
      const username = element.textContent || element.innerText;
      if (!username) return;
      
      // Генерируем цвет
      const color = this.getColor(username);
      
      // Применяем цвет
      element.classList.add('sc-colorful-name');
      element.style.setProperty('--sc-user-color', color);
    });
  }
  
  getColor(str) {
    if (this.colorCache.has(str)) {
      return this.colorCache.get(str);
    }
    
    // Простая генерация цвета
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    const color = `hsl(${hue}, 70%, 65%)`;
    
    this.colorCache.set(str, color);
    return color;
  }
  
  getSettingsPanel() {
    return `
      <div style="padding: 20px;">
        <h3>Simple Colorful Chat</h3>
        <p>Автоматически раскрашивает имена пользователей</p>
        <button onclick="document.querySelectorAll('.sc-colorful-name').forEach(el => el.classList.remove('sc-colorful-name')); setTimeout(() => module.exports.colorizeNames(), 100);" style="padding: 10px; background: #7289da; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Перекрасить имена
        </button>
      </div>
    `;
  }
};