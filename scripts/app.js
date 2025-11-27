/**
 * 主应用入口
 * 初始化所有组件和功能
 */
class App {
    constructor() {
        this.gallery = null;
        this.lightbox = null;
        
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    /**
     * 初始化应用组件
     */
    initComponents() {
        // 初始化Lightbox
        this.lightbox = new Lightbox();
        
        // 初始化画廊
        this.gallery = new Gallery();
        
        // 初始化导航栏滚动效果
        this.initNavbarScroll();
        
        // 初始化平滑滚动
        this.initSmoothScroll();
        
        // 初始化搜索功能
        this.initSearch();
        
        // 隐藏初始加载动画
        Utils.hideLoading();
        
        console.log('幻光壁廊 - 二次元壁纸展示站已初始化');
    }

    /**
     * 初始化导航栏滚动效果
     */
    initNavbarScroll() {
        const navbar = Utils.$('.navbar');
        if (!navbar) return;
        
        let lastScrollTop = 0;
        
        Utils.on(window, 'scroll', Utils.throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // 向下滚动且超过100px，隐藏导航栏
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // 向上滚动或未超过100px，显示导航栏
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        }, 100));
    }

    /**
     * 初始化平滑滚动
     */
    initSmoothScroll() {
        const navLinks = Utils.$$('.nav-link');
        
        navLinks.forEach(link => {
            Utils.on(link, 'click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        // 平滑滚动到目标位置
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // 更新活动链接
                        this.updateActiveNavLink(link);
                    }
                }
            });
        });
    }

    /**
     * 更新活动导航链接
     * @param {HTMLElement} activeLink - 活动链接
     */
    updateActiveNavLink(activeLink) {
        const navLinks = Utils.$$('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * 初始化搜索功能
     */
    initSearch() {
        const searchInput = Utils.$('.search-input');
        if (!searchInput) return;
        
        Utils.on(searchInput, 'input', Utils.debounce((e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            this.handleSearch(searchTerm);
        }, 300));
    }

    /**
     * 处理搜索
     * @param {string} searchTerm - 搜索关键词
     */
    handleSearch(searchTerm) {
        // 搜索功能实现
        // 这里可以根据搜索词过滤壁纸
        console.log('搜索:', searchTerm);
        
        // TODO: 实现搜索逻辑
        // 1. 过滤壁纸列表
        // 2. 重新渲染画廊
    }

    /**
     * 获取应用状态
     * @returns {Object} - 应用状态
     */
    getAppState() {
        return {
            gallery: this.gallery ? {
                totalWallpapers: this.gallery.getTotalWallpapers(),
                landscapeCount: this.gallery.getLandscapeCount(),
                portraitCount: this.gallery.getPortraitCount()
            } : null,
            lightbox: this.lightbox ? {
                isOpen: this.lightbox.isLightboxOpen(),
                currentIndex: this.lightbox.getCurrentIndex()
            } : null
        };
    }
}

// 初始化应用
const app = new App();

// 导出应用实例（可选，用于调试）
window.app = app;