/**
 * 画廊管理类
 * 负责壁纸的导入、分类、存储和展示
 */
class Gallery {
    constructor() {
        this.wallpapers = []; // 所有壁纸
        this.landscapeWallpapers = []; // 横屏壁纸
        this.portraitWallpapers = []; // 竖屏壁纸
        this.currentSlideIndex = 0; // 当前幻灯片索引
        this.isPlaying = false; // 是否自动播放
        this.slideInterval = null; // 幻灯片播放间隔
        this.slideDuration = 5000; // 幻灯片切换时间（毫秒）
        this.animationSettings = {
            landscape: 'slide',
            portrait: 'slide'
        }; // 动画效果设置
        this.isFullscreen = false; // 是否全屏状态
        
        this.init();
    }

    /**
     * 初始化画廊
     */
    init() {
        // 加载存储的壁纸数据
        this.loadWallpapers();
        // 加载动画设置
        this.loadAnimationSettings();
        // 初始化事件监听
        this.initEventListeners();
        // 渲染画廊
        this.renderGallery();
    }

    /**
     * 加载壁纸数据
     */
    loadWallpapers() {
        const savedWallpapers = Utils.getFromJSON('wallpapers.json', []);
        this.wallpapers = savedWallpapers;
        this.classifyWallpapers();
    }

    /**
     * 保存壁纸数据
     */
    saveWallpapers() {
        Utils.saveToJSON('wallpapers.json', this.wallpapers);
    }
    
    /**
     * 加载动画设置
     */
    loadAnimationSettings() {
        const savedSettings = Utils.getFromJSON('animation_settings.json', null);
        if (savedSettings) {
            this.animationSettings = { ...this.animationSettings, ...savedSettings };
        }
    }

    /**
     * 分类壁纸（横屏/竖屏）
     */
    classifyWallpapers() {
        this.landscapeWallpapers = this.wallpapers.filter(wallpaper => 
            Utils.isLandscape(wallpaper.width, wallpaper.height)
        );
        
        this.portraitWallpapers = this.wallpapers.filter(wallpaper => 
            Utils.isPortrait(wallpaper.width, wallpaper.height)
        );
    }

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 文件导入事件
        const fileInput = Utils.$('#file-input');
        if (fileInput) {
            Utils.on(fileInput, 'change', (e) => this.handleFileImport(e));
        }

        // 幻灯片控制事件
        const prevBtn = Utils.$('.prev-btn');
        const nextBtn = Utils.$('.next-btn');
        const playBtn = Utils.$('.play-btn');
        const fullscreenBtn = Utils.$('.fullscreen-btn');
        
        if (prevBtn) Utils.on(prevBtn, 'click', () => this.prevSlide());
        if (nextBtn) Utils.on(nextBtn, 'click', () => this.nextSlide());
        if (playBtn) Utils.on(playBtn, 'click', () => this.togglePlay());
        if (fullscreenBtn) Utils.on(fullscreenBtn, 'click', () => this.toggleFullscreen());

        // 键盘导航事件
        Utils.on(document, 'keydown', (e) => this.handleKeyboardNavigation(e));
        
        // 全屏变化事件
        Utils.on(document, 'fullscreenchange', () => this.handleFullscreenChange());
        Utils.on(document, 'webkitfullscreenchange', () => this.handleFullscreenChange());
        Utils.on(document, 'mozfullscreenchange', () => this.handleFullscreenChange());
        Utils.on(document, 'MSFullscreenChange', () => this.handleFullscreenChange());
    }

    /**
     * 处理文件导入
     * @param {Event} e - 文件选择事件
     */
    async handleFileImport(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        Utils.showLoading();
        
        try {
            // 处理每个文件
            for (const file of files) {
                if (Utils.isImage(file)) {
                    await this.addWallpaper(file);
                }
            }
            
            // 保存并重新渲染
            this.saveWallpapers();
            this.renderGallery();
            
            // 重置文件输入
            e.target.value = '';
        } catch (error) {
            console.error('导入壁纸失败:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    /**
     * 添加单个壁纸
     * @param {File} file - 图片文件
     */
    async addWallpaper(file) {
        try {
            // 获取图片尺寸
            const dimensions = await Utils.getImageDimensions(file);
            
            // 生成缩略图
            const thumbnail = await Utils.generateThumbnail(file);
            
            // 创建壁纸对象
            const wallpaper = {
                id: Utils.generateId(),
                name: file.name,
                originalName: file.name,
                size: file.size,
                width: dimensions.width,
                height: dimensions.height,
                type: file.type,
                thumbnail: thumbnail,
                url: URL.createObjectURL(file), // 临时URL，实际项目中应替换为真实路径
                uploadedAt: new Date().toISOString(),
                tags: []
            };
            
            // 添加到壁纸列表
            this.wallpapers.push(wallpaper);
            
            // 重新分类
            this.classifyWallpapers();
            
            return wallpaper;
        } catch (error) {
            console.error('添加壁纸失败:', error);
            throw error;
        }
    }

    /**
     * 渲染画廊
     */
    renderGallery() {
        this.renderLandscapeSlider();
        this.renderVerticalGallery();
        this.updateSlideCounter();
    }

    /**
     * 渲染横屏壁纸幻灯片
     */
    renderLandscapeSlider() {
        const screenInner = Utils.$('.screen-inner');
        if (!screenInner) return;

        // 清空现有幻灯片
        screenInner.innerHTML = '';

        // 如果没有横屏壁纸，显示提示
        if (this.landscapeWallpapers.length === 0) {
            const emptySlide = document.createElement('div');
            emptySlide.className = 'wallpaper-slide active';
            emptySlide.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); font-size: 18px;">暂无横屏壁纸</div>';
            screenInner.appendChild(emptySlide);
            return;
        }

        // 创建幻灯片
        this.landscapeWallpapers.forEach((wallpaper, index) => {
            const slide = document.createElement('div');
            slide.className = `wallpaper-slide ${index === 0 ? 'active' : ''}`;
            slide.dataset.index = index;
            
            const img = document.createElement('img');
            img.className = 'slide-image';
            img.src = wallpaper.url;
            img.alt = wallpaper.name;
            
            slide.appendChild(img);
            screenInner.appendChild(slide);
        });

        // 重置当前索引
        this.currentSlideIndex = 0;
    }

    /**
     * 渲染纵向电影海报画廊
     */
    renderVerticalGallery() {
        const galleryContainer = Utils.$('#vertical-gallery');
        if (!galleryContainer) return;

        // 清空现有内容
        galleryContainer.innerHTML = '';

        // 如果没有竖屏壁纸，显示提示
        if (this.portraitWallpapers.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'gallery-item active';
            emptyState.innerHTML = `
                <div class="gallery-item-inner">
                    <div style="text-align: center; color: rgba(255,255,255,0.6); font-size: 18px;">暂无竖屏壁纸</div>
                </div>
            `;
            galleryContainer.appendChild(emptyState);
            return;
        }

        // 创建画廊项
        this.portraitWallpapers.forEach((wallpaper, index) => {
            const item = document.createElement('div');
            item.className = `gallery-item ${index === 0 ? 'active' : ''}`;
            item.dataset.index = index;
            
            const inner = document.createElement('div');
            inner.className = 'gallery-item-inner';
            
            const img = document.createElement('img');
            img.className = 'gallery-image';
            img.src = wallpaper.url;
            img.alt = wallpaper.name;
            img.loading = 'lazy';
            
            // 点击图片打开Lightbox
            Utils.on(item, 'click', () => this.openLightbox(index, 'portrait'));
            
            inner.appendChild(img);
            item.appendChild(inner);
            galleryContainer.appendChild(item);
        });

        // 初始化导航事件
        this.initVerticalGalleryNav();
    }

    /**
     * 初始化纵向画廊导航
     */
    initVerticalGalleryNav() {
        const galleryContainer = Utils.$('#vertical-gallery');
        const prevNav = Utils.$('.gallery-nav-prev');
        const nextNav = Utils.$('.gallery-nav-next');
        
        if (!galleryContainer || !prevNav || !nextNav) return;
        
        // 点击上一张
        Utils.on(prevNav, 'click', () => this.navigateVerticalGallery(-1));
        
        // 点击下一张
        Utils.on(nextNav, 'click', () => this.navigateVerticalGallery(1));
        
        // 键盘导航
        Utils.on(document, 'keydown', (e) => {
            if (e.key === 'ArrowUp') {
                this.navigateVerticalGallery(-1);
            } else if (e.key === 'ArrowDown') {
                this.navigateVerticalGallery(1);
            }
        });
    }

    /**
     * 纵向画廊导航
     * @param {number} direction - 导航方向，-1为上一张，1为下一张
     */
    navigateVerticalGallery(direction) {
        if (this.portraitWallpapers.length === 0) return;
        
        const galleryItems = Utils.$$('.gallery-item');
        if (galleryItems.length === 0) return;
        
        // 找到当前活动项
        let currentIndex = 0;
        galleryItems.forEach((item, index) => {
            if (item.classList.contains('active')) {
                currentIndex = index;
            }
        });
        
        // 计算新索引
        let newIndex = currentIndex + direction;
        if (newIndex < 0) {
            newIndex = galleryItems.length - 1;
        } else if (newIndex >= galleryItems.length) {
            newIndex = 0;
        }
        
        // 更新画廊项状态
        this.updateVerticalGalleryItems(newIndex);
    }

    /**
     * 更新纵向画廊项状态
     * @param {number} activeIndex - 活动项索引
     */
    updateVerticalGalleryItems(activeIndex) {
        const galleryItems = Utils.$$('.gallery-item');
        if (galleryItems.length === 0) return;
        
        // 获取当前动画效果
        const animationType = this.animationSettings.portrait;
        
        galleryItems.forEach((item, index) => {
            // 移除所有状态类
            item.classList.remove('active', 'prev', 'next',
                                 'animation-fade', 'animation-slide', 'animation-zoom', 
                                 'animation-rotate', 'animation-flip', 'animation-cube', 
                                 'animation-bounce', 'animation-wave');
            
            // 添加当前动画类
            item.classList.add(`animation-${animationType}`);
            
            // 添加新状态类
            if (index === activeIndex) {
                item.classList.add('active');
            } else if (index === (activeIndex - 1 + galleryItems.length) % galleryItems.length) {
                item.classList.add('prev');
            } else if (index === (activeIndex + 1) % galleryItems.length) {
                item.classList.add('next');
            }
        });
    }

    /**
     * 切换到上一张幻灯片
     */
    prevSlide() {
        if (this.landscapeWallpapers.length === 0) return;
        
        const currentSlide = Utils.$(`.wallpaper-slide[data-index="${this.currentSlideIndex}"]`);
        this.currentSlideIndex = (this.currentSlideIndex - 1 + this.landscapeWallpapers.length) % this.landscapeWallpapers.length;
        const nextSlide = Utils.$(`.wallpaper-slide[data-index="${this.currentSlideIndex}"]`);
        
        this.transitionSlides(currentSlide, nextSlide, 'prev');
        this.updateSlideCounter();
    }

    /**
     * 切换到下一张幻灯片
     */
    nextSlide() {
        if (this.landscapeWallpapers.length === 0) return;
        
        const currentSlide = Utils.$(`.wallpaper-slide[data-index="${this.currentSlideIndex}"]`);
        this.currentSlideIndex = (this.currentSlideIndex + 1) % this.landscapeWallpapers.length;
        const nextSlide = Utils.$(`.wallpaper-slide[data-index="${this.currentSlideIndex}"]`);
        
        this.transitionSlides(currentSlide, nextSlide, 'next');
        this.updateSlideCounter();
    }

    /**
     * 幻灯片过渡动画
     * @param {HTMLElement} currentSlide - 当前幻灯片
     * @param {HTMLElement} nextSlide - 下一张幻灯片
     * @param {string} direction - 过渡方向 ('prev' 或 'next')
     */
    transitionSlides(currentSlide, nextSlide, direction) {
        if (!currentSlide || !nextSlide) return;
        
        // 获取当前动画效果
        const animationType = this.animationSettings.landscape;
        
        // 移除之前的动画类
        currentSlide.classList.remove('animation-fade', 'animation-slide', 'animation-zoom', 
                                     'animation-rotate', 'animation-flip', 'animation-cube', 
                                     'animation-bounce', 'animation-wave');
        nextSlide.classList.remove('animation-fade', 'animation-slide', 'animation-zoom', 
                                     'animation-rotate', 'animation-flip', 'animation-cube', 
                                     'animation-bounce', 'animation-wave');
        
        // 添加当前动画类
        currentSlide.classList.add(`animation-${animationType}`);
        nextSlide.classList.add(`animation-${animationType}`);
        
        // 设置初始状态
        nextSlide.classList.add(direction);
        nextSlide.classList.add('active');
        
        // 触发重排
        void nextSlide.offsetWidth;
        
        // 执行过渡动画
        currentSlide.classList.remove('active');
        currentSlide.classList.add(direction === 'prev' ? 'next' : 'prev');
        nextSlide.classList.remove(direction);
        
        // 清理类名
        setTimeout(() => {
            currentSlide.classList.remove('prev', 'next');
        }, 800);
    }

    /**
     * 切换自动播放
     */
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const playBtn = Utils.$('.play-btn');
        
        if (playBtn) {
            const svg = playBtn.querySelector('svg');
            if (this.isPlaying) {
                // 切换到暂停图标
                svg.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
                this.startSlideShow();
            } else {
                // 切换到播放图标
                svg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
                this.stopSlideShow();
            }
        }
    }

    /**
     * 开始幻灯片播放
     */
    startSlideShow() {
        if (this.slideInterval) return;
        
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.slideDuration);
    }

    /**
     * 停止幻灯片播放
     */
    stopSlideShow() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
    
    /**
     * 切换全屏模式
     */
    toggleFullscreen() {
        const cinemaContainer = Utils.$('.cinema-container');
        if (!cinemaContainer) return;
        
        if (!this.isFullscreen) {
            // 进入全屏
            if (cinemaContainer.requestFullscreen) {
                cinemaContainer.requestFullscreen();
            } else if (cinemaContainer.webkitRequestFullscreen) {
                cinemaContainer.webkitRequestFullscreen();
            } else if (cinemaContainer.mozRequestFullScreen) {
                cinemaContainer.mozRequestFullScreen();
            } else if (cinemaContainer.msRequestFullscreen) {
                cinemaContainer.msRequestFullscreen();
            }
        } else {
            // 退出全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    /**
     * 处理全屏状态变化
     */
    handleFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || 
                             document.webkitFullscreenElement || 
                             document.mozFullScreenElement || 
                             document.msFullscreenElement);
        
        const fullscreenBtn = Utils.$('.fullscreen-btn');
        if (fullscreenBtn) {
            const svg = fullscreenBtn.querySelector('svg');
            if (this.isFullscreen) {
                // 切换到退出全屏图标
                svg.innerHTML = '<polyline points="15 21 9 21 9 15"></polyline><polyline points="9 3 15 3 15 9"></polyline><line x1="9" y1="21" x2="16" y2="14"></line><line x1="15" y1="3" x2="8" y2="10"></line>';
            } else {
                // 切换到进入全屏图标
                svg.innerHTML = '<polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>';
            }
        }
    }

    /**
     * 更新幻灯片计数器
     */
    updateSlideCounter() {
        const counter = Utils.$('.slide-counter');
        if (counter) {
            counter.textContent = `${this.currentSlideIndex + 1} / ${this.landscapeWallpapers.length}`;
        }
    }

    /**
     * 处理键盘导航
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'ArrowLeft':
                this.prevSlide();
                break;
            case 'ArrowRight':
                this.nextSlide();
                break;
            case ' ': // 空格键
                e.preventDefault();
                this.togglePlay();
                break;
        }
    }

    /**
     * 打开Lightbox预览
     * @param {number} index - 壁纸索引
     * @param {string} type - 壁纸类型 ('landscape' 或 'portrait')
     */
    openLightbox(index, type) {
        const wallpapers = type === 'landscape' ? this.landscapeWallpapers : this.portraitWallpapers;
        
        // 确保有壁纸数据
        if (!wallpapers || wallpapers.length === 0) {
            console.warn('没有可预览的壁纸');
            return;
        }
        
        // 确保索引有效
        const validIndex = Math.max(0, Math.min(index, wallpapers.length - 1));
        
        // 触发Lightbox打开事件
        Utils.emit(document, 'openLightbox', {
            index: validIndex,
            type: type,
            wallpapers: wallpapers
        });
    }

    /**
     * 获取壁纸总数
     * @returns {number} - 壁纸总数
     */
    getTotalWallpapers() {
        return this.wallpapers.length;
    }

    /**
     * 获取横屏壁纸数量
     * @returns {number} - 横屏壁纸数量
     */
    getLandscapeCount() {
        return this.landscapeWallpapers.length;
    }

    /**
     * 获取竖屏壁纸数量
     * @returns {number} - 竖屏壁纸数量
     */
    getPortraitCount() {
        return this.portraitWallpapers.length;
    }
}

// 导出画廊类
window.Gallery = Gallery;