// 初始化图片数组
let images = [];

// 添加本地存储功能
function saveToLocalStorage() {
    try {
        localStorage.setItem('galleryImages', JSON.stringify(images));
        console.log('保存成功，当前图片数量:', images.length);
    } catch (error) {
        console.error('保存到本地存储时出错:', error);
        showNotification('保存失败，可能是存储空间已满', 'error');
    }
}

function loadFromLocalStorage() {
    try {
        const savedImages = localStorage.getItem('galleryImages');
        if (savedImages) {
            images = JSON.parse(savedImages);
            console.log('加载成功，图片数量:', images.length);
        } else {
            // 如果没有保存的数据，使用默认图片
            images = [
                {
                    src: "images/20181005193420_kanpv.jpg",
                    caption: "《明日之子》舞台表演"
                },
                {
                    src: "images/20200318171838_t2CPj.jpeg",
                    caption: "温暖的微笑"
                },
                {
                    src: "images/20200504204152_eevky.jpg",
                    caption: "创作时刻"
                },
                {
                    src: "images/20210905214206_6345a.jpg",
                    caption: "舞台演出"
                },
                {
                    src: "images/20220308175749_70558.jpg",
                    caption: "生活日常"
                },
                {
                    src: "images/20220612223733_f1397.jpg",
                    caption: "音乐现场"
                },
                {
                    src: "images/t014a220fcae441268b.jpg",
                    caption: "温柔的歌手"
                },
                {
                    src: "images/20190113000454_amqtb.jpg",
                    caption: "静谧时光"
                }
            ];
            saveToLocalStorage(); // 保存默认图片到本地存储
        }
    } catch (error) {
        console.error('从本地存储加载时出错:', error);
        showNotification('加载保存的照片失败', 'error');
    }
}

// 添加删除模式状态
let isDeleteMode = false;

// 删除模式切换按钮处理
document.getElementById('toggleDeleteMode').addEventListener('click', function() {
    isDeleteMode = !isDeleteMode;
    this.textContent = isDeleteMode ? '退出删除模式' : '进入删除模式';
    this.classList.toggle('active');
    
    // 更新画廊显示状态
    const gallery = document.querySelector('.gallery');
    gallery.classList.toggle('delete-mode');
    
    // 重新初始化画廊以添加/移除删除事件
    initGallery();
});

// 显示图片的基础函数
function initGallery() {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // 清空现有内容
    
    images.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        if (isDeleteMode) {
            item.classList.add('delete-mode');
        }
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.caption;
        
        item.appendChild(img);
        
        // 根据模式添加不同的点击事件
        if (isDeleteMode) {
            item.addEventListener('click', () => {
                if (confirm('确定要删除这张照片吗？')) {
                    images.splice(index, 1);
                    initGallery();
                    updateStats();
                    showNotification('照片已删除');
                }
            });
        }
        
        gallery.appendChild(item);
    });
    
    // 更新统计
    updateStats();
    saveToLocalStorage(); // 添加这行
}

// 更新统计数据
function updateStats() {
    const totalPhotos = document.getElementById('totalPhotos');
    if (totalPhotos) {
        totalPhotos.textContent = images.length;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initGallery();
});

// 添加单张照片的处理
document.getElementById('addPhotoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('photoInput');
    const captionInput = document.getElementById('captionInput');
    
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // 创建新的图片对象
            const newImage = {
                src: e.target.result,
                caption: captionInput.value
            };
            
            // 添加到图片数组
            images.push(newImage);
            
            // 重新初始化图片
            initGallery();
        };
        
        reader.readAsDataURL(file);
    }
});

// 批量上传功能
document.getElementById('batchPhotoInput').addEventListener('change', function(e) {
    const files = Array.from(this.files);
    if (files.length === 0) return;
    
    let processed = 0;
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const newImage = {
                    src: e.target.result,
                    caption: file.name.split('.')[0]
                };
                
                images.push(newImage);
                processed++;
                
                // 当所有文件都处理完时更新画廊
                if (processed === files.length) {
                    initGallery();
                    showNotification(`成功添加 ${processed} 张照片！`);
                }
            };
            
            reader.readAsDataURL(file);
        }
    });
});

// 拖放上传功能
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('click', () => {
    document.getElementById('batchPhotoInput').click();
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
    });
});

dropZone.addEventListener('drop', function(e) {
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    let processed = 0;
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const newImage = {
                    src: e.target.result,
                    caption: file.name.split('.')[0]
                };
                
                images.push(newImage);
                processed++;
                
                if (processed === files.length) {
                    initGallery();
                    showNotification(`成功添加 ${processed} 张照片！`);
                }
            };
            
            reader.readAsDataURL(file);
        }
    });
});

// 添加清除所有数据的功能（可选）
function clearGallery() {
    if (confirm('确定要清除所有照片吗？此操作不可恢复！')) {
        images = [];
        localStorage.removeItem('galleryImages');
        initGallery();
        showNotification('所有照片已清除');
    }
}

// 可以添加一个清除按钮（可选）
// 在 HTML 中添加：
// <button id="clearGallery" class="admin-btn">清除所有照片</button>

// 添加清除按钮事件（如果需要）
document.getElementById('clearGallery')?.addEventListener('click', clearGallery);
