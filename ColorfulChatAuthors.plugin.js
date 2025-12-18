/**
 * @name SimpleColorChat
 * @author balihinxd
 * @description Простая раскраска имён в чате
 * @version 2.1.7
 * @source https://github.com/balihinxd/SimpleColorfulChat
 */

module.exports = class SimpleColorChat {
    constructor() {
        this.observer = null;
        this.colorCache = new Map();
        this.settings = {
            enabled: true,
            colorMode: 'hash',
            saturation: 70,
            lightness: 60
        };
    }
    
    start() {
        console.log('%c[SimpleColorChat]', 'color: #7289da; font-weight: bold;', 'Плагин запущен');
        this.injectStyles();
        this.startObserving();
        setTimeout(() => this.colorizeAll(), 1000);
    }
    
    stop() {
        console.log('%c[SimpleColorChat]', 'color: #7289da; font-weight: bold;', 'Плагин остановлен');
        if (this.observer) this.observer.disconnect();
        const style = document.getElementById('simple-color-chat-styles');
        if (style) style.remove();
        
        // Убираем наши стили
        document.querySelectorAll('.scc-name').forEach(el => {
            el.classList.remove('scc-name');
            el.style.color = '';
        });
    }
    
    injectStyles() {
        const css = `
            .scc-name {
                transition: color 0.3s ease !important;
            }
        `;
        const style = document.createElement('style');
        style.id = 'simple-color-chat-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    startObserving() {
        this.observer = new MutationObserver(() => {
            this.colorizeAll();
        });
        
        const container = document.querySelector('.chatContent') || 
                         document.querySelector('[class*="messagesWrapper"]') ||
                         document.body;
        if (container) {
            this.observer.observe(container, { childList: true, subtree: true });
        }
    }
    
    colorizeAll() {
        if (!this.settings.enabled) return;
        
        const names = document.querySelectorAll('[class*="username"]');
        names.forEach(el => {
            const name = el.textContent;
            if (!name || name.trim() === '') return;
            
            if (!this.colorCache.has(name)) {
                const hue = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 360;
                this.colorCache.set(name, `hsl(${hue}, ${this.settings.saturation}%, ${this.settings.lightness}%)`);
            }
            
            el.classList.add('scc-name');
            el.style.color = this.colorCache.get(name);
        });
    }
    
    // Функция Random
    randomizeColors() {
        this.colorCache.clear();
        this.colorizeAll();
        BdApi.showToast('🎲 Цвета перемешаны!', { type: 'info' });
    }
    
    // Функция для установки своего цвета
    setSelfColor(color) {
        // Здесь можно добавить логику для своего цвета
        console.log('Установлен цвет:', color);
        BdApi.showToast(`✅ Цвет установлен: ${color}`, { type: 'info' });
    }
    
    // ПРОСТАЯ версия настроек - возвращает HTML элемент
    getSettingsPanel() {
        // Создаём div с настройками
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.color = 'var(--text-normal)';
        
        container.innerHTML = `
            <h3 style="margin-bottom: 20px; color: var(--header-primary);">Simple Color Chat</h3>
            <p style="margin-bottom: 20px; color: var(--text-muted);">
                Автоматически раскрашивает имена пользователей в разные цвета
            </p>
            
            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                <input type="checkbox" id="scc-enabled" ${this.settings.enabled ? 'checked' : ''} 
                       style="margin-right: 10px; cursor: pointer;">
                <label for="scc-enabled" style="cursor: pointer;">Включить раскраску имён</label>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Режим цветов:</label>
                <select id="scc-color-mode" style="width: 100%; padding: 8px; border-radius: 4px; 
                        background-color: var(--background-secondary); color: var(--text-normal);
                        border: 1px solid var(--background-modifier-accent); cursor: pointer;">
                    <option value="hash" ${this.settings.colorMode === 'hash' ? 'selected' : ''}>На основе хеша</option>
                    <option value="fixed" ${this.settings.colorMode === 'fixed' ? 'selected' : ''}>Фиксированные цвета</option>
                    <option value="random" ${this.settings.colorMode === 'random' ? 'selected' : ''}>Случайные цвета</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">
                    Насыщенность: <span id="scc-saturation-value">${this.settings.saturation}</span>%
                </label>
                <input type="range" id="scc-saturation" min="20" max="100" value="${this.settings.saturation}"
                       style="width: 100%; cursor: pointer;">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">
                    Яркость: <span id="scc-lightness-value">${this.settings.lightness}</span>%
                </label>
                <input type="range" id="scc-lightness" min="20" max="80" value="${this.settings.lightness}"
                       style="width: 100%; cursor: pointer;">
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background-color: var(--background-secondary); border-radius: 8px;">
                <h4 style="margin-bottom: 10px; color: var(--header-primary);">Ваш цвет</h4>
                <div style="margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 5px;" id="scc-color-palette"></div>
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 10px;">
                    <input type="text" id="scc-custom-color" placeholder="#RRGGBB или название цвета"
                           style="flex: 1; padding: 8px; background-color: var(--background-primary);
                                  border: 1px solid var(--background-modifier-accent); border-radius: 4px;
                                  color: var(--text-normal);">
                    <button id="scc-apply-color" style="padding: 8px 16px; background-color: var(--brand-experiment);
                            color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                        Применить
                    </button>
                </div>
            </div>
            
            <button id="scc-random" style="margin-bottom: 10px; padding: 12px; width: 100%;
                    background-color: #9b59b6; color: white; border: none; border-radius: 4px;
                    cursor: pointer; font-weight: bold; font-size: 14px;">
                🎲 Random - Перемешать все цвета
            </button>
            
            <button id="scc-recolor" style="margin-bottom: 10px; padding: 10px; width: 100%;
                    background-color: var(--brand-experiment); color: white; border: none;
                    border-radius: 4px; cursor: pointer;">
                Перекрасить все сообщения
            </button>
            
            <button id="scc-reset" style="padding: 10px; width: 100%;
                    background-color: var(--background-modifier-accent); color: var(--text-normal);
                    border: none; border-radius: 4px; cursor: pointer;">
                Сбросить настройки
            </button>
        `;
        
        // Добавляем палитру цветов
        const palette = container.querySelector('#scc-color-palette');
        const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', 
                       '#7209B7', '#F72585', '#3A86FF', '#FB5607', '#8338EC', '#FF006E',
                       '#7289DA', '#43B581', '#FAA61A', '#EB459E'];
        
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.style.width = '25px';
            swatch.style.height = '25px';
            swatch.style.backgroundColor = color;
            swatch.style.borderRadius = '4px';
            swatch.style.cursor = 'pointer';
            swatch.style.border = '1px solid var(--background-modifier-accent)';
            swatch.title = color;
            swatch.onclick = () => {
                this.setSelfColor(color);
            };
            palette.appendChild(swatch);
        });
        
        // Добавляем обработчики событий
        container.querySelector('#scc-enabled').onchange = (e) => {
            this.settings.enabled = e.target.checked;
            if (e.target.checked) this.colorizeAll();
        };
        
        container.querySelector('#scc-color-mode').onchange = (e) => {
            this.settings.colorMode = e.target.value;
            this.colorCache.clear();
            this.colorizeAll();
        };
        
        container.querySelector('#scc-saturation').oninput = (e) => {
            const value = e.target.value;
            container.querySelector('#scc-saturation-value').textContent = value;
            this.settings.saturation = parseInt(value);
            this.colorCache.clear();
            this.colorizeAll();
        };
        
        container.querySelector('#scc-lightness').oninput = (e) => {
            const value = e.target.value;
            container.querySelector('#scc-lightness-value').textContent = value;
            this.settings.lightness = parseInt(value);
            this.colorCache.clear();
            this.colorizeAll();
        };
        
        container.querySelector('#scc-random').onclick = () => {
            this.randomizeColors();
        };
        
        container.querySelector('#scc-recolor').onclick = () => {
            this.colorizeAll();
            BdApi.showToast('Сообщения перекрашены!', { type: 'info' });
        };
        
        container.querySelector('#scc-reset').onclick = () => {
            this.settings = {
                enabled: true,
                colorMode: 'hash',
                saturation: 70,
                lightness: 60
            };
            this.colorCache.clear();
            this.colorizeAll();
            
            // Обновляем UI
            container.querySelector('#scc-enabled').checked = true;
            container.querySelector('#scc-color-mode').value = 'hash';
            container.querySelector('#scc-saturation').value = 70;
            container.querySelector('#scc-lightness').value = 60;
            container.querySelector('#scc-saturation-value').textContent = '70';
            container.querySelector('#scc-lightness-value').textContent = '60';
            
            BdApi.showToast('Настройки сброшены!', { type: 'info' });
        };
        
        container.querySelector('#scc-apply-color').onclick = () => {
            const colorInput = container.querySelector('#scc-custom-color');
            const color = colorInput.value.trim();
            if (color) {
                this.setSelfColor(color);
                colorInput.value = '';
            }
        };
        
        container.querySelector('#scc-custom-color').onkeypress = (e) => {
            if (e.key === 'Enter') {
                container.querySelector('#scc-apply-color').click();
            }
        };
        
        return container;
    }
};
