/**
 * Lightbox 类
 * 实现壁纸全屏预览功能
 */
class Lightbox {
    constructor() {
        this.lightbox = Utils.$('#lightbox');
        this.lightboxImage = Utils.$('#lightbox-image');
        this.currentIndex = 0;
        this.currentWallpapers = [];
        this.isOpen = false;
        
        this.init();
    }

    /**
     * 初始化Lightbox
     */
    init() {
        this.initEventListeners();
    }

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 关闭按钮事件
        const closeBtn = Utils.$('.lightbox-close');
        if (closeBtn) {
            Utils.on(closeBtn, 'click', () => this.close());
        }

        // 导航按钮事件
        const prevBtn = Utils.$('.lightbox-nav.prev');
        const nextBtn = Utils.$('.lightbox-nav.next');
        
        if (prevBtn) Utils.on(prevBtn, 'click', () => this.prev());
        if (nextBtn) Utils.on(nextBtn, 'click', () => this.next());

        // 点击遮罩关闭
        const overlay = Utils.$('.lightbox-overlay');
        if (overlay) {
            Utils.on(overlay, 'click', () => this.close());
        }

        // 键盘导航事件
        Utils.on(document, 'keydown', (e) => this.handleKeyboard(e));

        // 监听打开Lightbox事件
        Utils.on(document, 'openLightbox', (e) => this.open(e.detail));
    }

    /**
     * 打开Lightbox
     * @param {Object} data - 打开参数
     * @param {number} data.index - 初始索引
     * @param {Array} data.wallpapers - 壁纸列表
     */
    open(data) {
        if (!data || !data.wallpapers || data.wallpapers.length === 0) return;
        if (!this.lightbox || !this.lightboxImage) return;
        
        this.currentIndex = data.index || 0;
        this.currentWallpapers = data.wallpapers;
        
        // 显示Lightbox
        this.lightbox.classList.add('active');
        this.isOpen = true;
        
        // 加载并显示图片
        this.loadImage();
        
        // 阻止页面滚动
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭Lightbox
     */
    close() {
        if (!this.isOpen) return;
        
        // 隐藏Lightbox
        this.lightbox.classList.remove('active');
        this.isOpen = false;
        
        // 恢复页面滚动
        document.body.style.overflow = '';
    }

    /**
     * 加载并显示当前图片
     */
    loadImage() {
        if (!this.lightboxImage || this.currentWallpapers.length === 0) return;
        
        const wallpaper = this.currentWallpapers[this.currentIndex];
        if (!wallpaper) return;
        
        // 显示加载动画
        Utils.showLoading();
        
        // 创建新图片对象，预加载
        const img = new Image();
        img.onload = () => {
            // 图片加载完成，显示图片
            this.lightboxImage.src = img.src;
            this.lightboxImage.alt = wallpaper.name;
            
            // 隐藏加载动画
            Utils.hideLoading();
        };
        
        img.onerror = () => {
            console.error('无法加载图片:', wallpaper.url);
            Utils.hideLoading();
        };
        
        img.src = wallpaper.url;
    }

    /**
     * 切换到上一张图片
     */
    prev() {
        if (this.currentWallpapers.length <= 1) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.currentWallpapers.length) % this.currentWallpapers.length;
        this.loadImage();
    }

    /**
     * 切换到下一张图片
     */
    next() {
        if (this.currentWallpapers.length <= 1) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.currentWallpapers.length;
        this.loadImage();
    }

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyboard(e) {
        if (!this.isOpen) return;
        
        switch (e.key) {
            case 'Escape':
                this.close();
                break;
            case 'ArrowLeft':
                this.prev();
                break;
            case 'ArrowRight':
                this.next();
                break;
        }
    }

    /**
     * 获取当前Lightbox状态
     * @returns {boolean} - 是否打开
     */
    isLightboxOpen() {
        return this.isOpen;
    }

    /**
     * 获取当前显示的壁纸索引
     * @returns {number} - 当前索引
     */
    getCurrentIndex() {
        return this.currentIndex;
    }

    /**
     * 获取当前壁纸列表
     * @returns {Array} - 壁纸列表
     */
    getCurrentWallpapers() {
        return this.currentWallpapers;
    }
}

// 导出Lightbox类
window.Lightbox = Lightbox;