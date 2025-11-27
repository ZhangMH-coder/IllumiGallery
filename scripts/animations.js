/**
 * 动画效果管理类
 * 负责动画效果的展示、选择和保存
 */
class AnimationManager {
    constructor() {
        this.animations = {
            fade: {
                name: '淡入淡出',
                description: '平滑的淡入淡出效果',
                className: 'animation-fade'
            },
            slide: {
                name: '滑动',
                description: '左右滑动切换效果',
                className: 'animation-slide'
            },
            zoom: {
                name: '缩放',
                description: '缩放过渡效果',
                className: 'animation-zoom'
            },
            rotate: {
                name: '旋转',
                description: '旋转过渡效果',
                className: 'animation-rotate'
            },
            flip: {
                name: '3D翻转',
                description: '3D翻转切换效果',
                className: 'animation-flip'
            },
            cube: {
                name: '立方体旋转',
                description: '立方体旋转过渡效果',
                className: 'animation-cube'
            },
            bounce: {
                name: '弹跳',
                description: '弹跳过渡效果',
                className: 'animation-bounce'
            },
            wave: {
                name: '波浪',
                description: '波浪式过渡效果',
                className: 'animation-wave'
            }
        };
        
        this.currentSettings = {
            landscape: 'slide',
            portrait: 'slide'
        };
        
        this.init();
    }
    
    /**
     * 初始化动画管理
     */
    init() {
        // 加载保存的设置
        this.loadSettings();
        // 渲染动画选项
        this.renderAnimationOptions();
        // 初始化事件监听
        this.initEventListeners();
        // 启动动画预览
        this.startAnimationPreviews();
    }
    
    /**
     * 加载保存的动画设置
     */
    loadSettings() {
        const savedSettings = Utils.getFromJSON('animation_settings.json', null);
        if (savedSettings) {
            this.currentSettings = { ...this.currentSettings, ...savedSettings };
        }
    }
    
    /**
     * 保存动画设置
     */
    saveSettings() {
        Utils.saveToJSON('animation_settings.json', this.currentSettings);
    }
    
    /**
     * 渲染动画选项
     */
    renderAnimationOptions() {
        // 渲染横屏动画选项
        this.renderAnimationGroup('landscape', this.currentSettings.landscape);
        // 渲染竖屏动画选项
        this.renderAnimationGroup('portrait', this.currentSettings.portrait);
    }
    
    /**
     * 渲染单个动画组
     * @param {string} type - 动画类型 ('landscape' 或 'portrait')
     * @param {string} selectedId - 当前选中的动画ID
     */
    renderAnimationGroup(type, selectedId) {
        const container = Utils.$(`#${type}-animations`);
        if (!container) return;
        
        // 清空容器
        container.innerHTML = '';
        
        // 创建动画选项
        Object.entries(this.animations).forEach(([id, animation]) => {
            const option = this.createAnimationOption(id, animation, selectedId === id);
            container.appendChild(option);
        });
    }
    
    /**
     * 创建单个动画选项元素
     * @param {string} id - 动画ID
     * @param {Object} animation - 动画配置
     * @param {boolean} isSelected - 是否选中
     * @returns {HTMLElement} - 动画选项元素
     */
    createAnimationOption(id, animation, isSelected) {
        const option = document.createElement('div');
        option.className = `animation-option ${isSelected ? 'selected' : ''}`;
        option.dataset.animationId = id;
        
        option.innerHTML = `
            <div class="animation-name">${animation.name}</div>
            <div class="animation-description">${animation.description}</div>
            <div class="animation-preview ${animation.className}">
                <div class="preview-image current"></div>
                <div class="preview-image next"></div>
            </div>
        `;
        
        return option;
    }
    
    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 横屏动画选项点击事件
        const landscapeContainer = Utils.$('#landscape-animations');
        if (landscapeContainer) {
            Utils.on(landscapeContainer, 'click', (e) => {
                const option = e.target.closest('.animation-option');
                if (option) {
                    this.selectAnimation('landscape', option);
                }
            });
        }
        
        // 竖屏动画选项点击事件
        const portraitContainer = Utils.$('#portrait-animations');
        if (portraitContainer) {
            Utils.on(portraitContainer, 'click', (e) => {
                const option = e.target.closest('.animation-option');
                if (option) {
                    this.selectAnimation('portrait', option);
                }
            });
        }
        
        // 保存按钮点击事件
        const saveBtn = Utils.$('#save-animations');
        if (saveBtn) {
            Utils.on(saveBtn, 'click', () => {
                this.saveSettings();
                this.showSaveMessage('success', '动画设置已保存！');
            });
        }
    }
    
    /**
     * 选择动画效果
     * @param {string} type - 动画类型 ('landscape' 或 'portrait')
     * @param {HTMLElement} option - 选中的选项元素
     */
    selectAnimation(type, option) {
        // 移除同组其他选项的选中状态
        const container = Utils.$(`#${type}-animations`);
        if (container) {
            const allOptions = container.querySelectorAll('.animation-option');
            allOptions.forEach(opt => opt.classList.remove('selected'));
        }
        
        // 添加当前选项的选中状态
        option.classList.add('selected');
        
        // 更新当前设置
        const animationId = option.dataset.animationId;
        this.currentSettings[type] = animationId;
    }
    
    /**
     * 启动动画预览
     */
    startAnimationPreviews() {
        const previewContainers = Utils.$$('.animation-preview');
        previewContainers.forEach(container => {
            this.animatePreview(container);
        });
    }
    
    /**
     * 执行动画预览
     * @param {HTMLElement} container - 预览容器
     */
    animatePreview(container) {
        const currentImage = container.querySelector('.preview-image.current');
        const nextImage = container.querySelector('.preview-image.next');
        
        if (!currentImage || !nextImage) return;
        
        // 定时切换动画
        setInterval(() => {
            // 显示下一张图片
            nextImage.classList.add('active');
            
            // 延迟后重置
            setTimeout(() => {
                nextImage.classList.remove('active');
            }, 800);
        }, 2000);
    }
    
    /**
     * 显示保存消息
     * @param {string} type - 消息类型 ('success' 或 'error')
     * @param {string} message - 消息内容
     */
    showSaveMessage(type, message) {
        const messageEl = Utils.$('#save-message');
        if (!messageEl) return;
        
        messageEl.textContent = message;
        messageEl.className = `save-message ${type}`;
        
        // 3秒后隐藏消息
        setTimeout(() => {
            messageEl.classList.remove(type);
        }, 3000);
    }
    
    /**
     * 获取当前动画设置
     * @returns {Object} - 当前动画设置
     */
    getCurrentSettings() {
        return { ...this.currentSettings };
    }
    
    /**
     * 获取指定类型的动画类名
     * @param {string} type - 动画类型 ('landscape' 或 'portrait')
     * @returns {string} - 动画类名
     */
    getAnimationClass(type) {
        const animationId = this.currentSettings[type];
        return this.animations[animationId]?.className || 'animation-slide';
    }
}

// 页面加载完成后初始化
Utils.on(document, 'DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
});