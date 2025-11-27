/**
 * 工具函数集合
 * 包含各种通用功能，如DOM操作、文件处理、数据存储等
 */

class Utils {
    /**
     * 获取DOM元素
     * @param {string} selector - CSS选择器
     * @param {HTMLElement} parent - 父元素，默认为document
     * @returns {HTMLElement|null} - DOM元素或null
     */
    static $(selector, parent = document) {
        return parent.querySelector(selector);
    }

    /**
     * 获取多个DOM元素
     * @param {string} selector - CSS选择器
     * @param {HTMLElement} parent - 父元素，默认为document
     * @returns {NodeList} - DOM元素列表
     */
    static $$(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    /**
     * 添加事件监听器
     * @param {HTMLElement} element - DOM元素
     * @param {string} event - 事件类型
     * @param {Function} callback - 回调函数
     */
    static on(element, event, callback) {
        element.addEventListener(event, callback);
    }

    /**
     * 移除事件监听器
     * @param {HTMLElement} element - DOM元素
     * @param {string} event - 事件类型
     * @param {Function} callback - 回调函数
     */
    static off(element, event, callback) {
        element.removeEventListener(event, callback);
    }

    /**
     * 触发自定义事件
     * @param {HTMLElement} element - DOM元素
     * @param {string} eventName - 事件名称
     * @param {Object} detail - 事件详情
     */
    static emit(element, eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        element.dispatchEvent(event);
    }

    /**
     * 获取图片尺寸
     * @param {File} file - 图片文件
     * @returns {Promise<{width: number, height: number}>} - 图片尺寸Promise
     */
    static getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                const dimensions = {
                    width: img.width,
                    height: img.height
                };
                URL.revokeObjectURL(url);
                resolve(dimensions);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('无法读取图片尺寸'));
            };

            img.src = url;
        });
    }

    /**
     * 生成缩略图
     * @param {File} file - 图片文件
     * @param {number} maxWidth - 最大宽度
     * @param {number} maxHeight - 最大高度
     * @returns {Promise<string>} - 缩略图DataURL
     */
    static generateThumbnail(file, maxWidth = 300, maxHeight = 300) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                // 计算缩放比例
                const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
                const width = Math.round(img.width * scale);
                const height = Math.round(img.height * scale);

                // 创建Canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);

                // 转换为DataURL
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                URL.revokeObjectURL(url);
                resolve(dataURL);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('无法生成缩略图'));
            };

            img.src = url;
        });
    }

    /**
     * 保存数据到本地存储
     * @param {string} key - 存储键名
     * @param {*} data - 存储数据
     */
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }

    /**
     * 从本地存储获取数据
     * @param {string} key - 存储键名
     * @param {*} defaultValue - 默认值
     * @returns {*} - 获取的数据或默认值
     */
    static getFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('获取数据失败:', error);
            return defaultValue;
        }
    }

    /**
     * 保存数据到JSON文件（模拟，实际为本地存储）
     * @param {string} filename - 文件名
     * @param {*} data - 存储数据
     */
    static saveToJSON(filename, data) {
        // 实际项目中可以使用File API保存到本地文件
        // 这里简化为保存到localStorage
        const key = `json_${filename.replace('.json', '')}`;
        this.saveToStorage(key, data);
    }

    /**
     * 从JSON文件获取数据（模拟，实际为本地存储）
     * @param {string} filename - 文件名
     * @param {*} defaultValue - 默认值
     * @returns {*} - 获取的数据或默认值
     */
    static getFromJSON(filename, defaultValue = null) {
        const key = `json_${filename.replace('.json', '')}`;
        return this.getFromStorage(key, defaultValue);
    }

    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} delay - 延迟时间（毫秒）
     * @returns {Function} - 防抖处理后的函数
     */
    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * 节流函数
     * @param {Function} func - 要执行的函数
     * @param {number} limit - 时间限制（毫秒）
     * @returns {Function} - 节流处理后的函数
     */
    static throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 生成唯一ID
     * @returns {string} - 唯一ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} - 格式化后的大小
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 显示加载动画
     */
    static showLoading() {
        const loading = this.$('.loading');
        if (loading) {
            loading.classList.add('active');
        }
    }

    /**
     * 隐藏加载动画
     */
    static hideLoading() {
        const loading = this.$('.loading');
        if (loading) {
            loading.classList.remove('active');
        }
    }

    /**
     * 检查是否为横屏图片
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @returns {boolean} - 是否为横屏
     */
    static isLandscape(width, height) {
        return width > height;
    }

    /**
     * 检查是否为竖屏图片
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @returns {boolean} - 是否为竖屏
     */
    static isPortrait(width, height) {
        return height >= width;
    }

    /**
     * 获取文件扩展名
     * @param {string} filename - 文件名
     * @returns {string} - 文件扩展名
     */
    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    }

    /**
     * 检查文件类型是否为图片
     * @param {File} file - 文件对象
     * @returns {boolean} - 是否为图片
     */
    static isImage(file) {
        const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const extension = this.getFileExtension(file.name);
        return validExtensions.includes(extension);
    }
}

// 导出工具类
window.Utils = Utils;