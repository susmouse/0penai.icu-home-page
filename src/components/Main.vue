<template>
    <!-- 导航中心组件 -->
    <div class="navigation-hub">
        <!-- 标题区域 -->
        <div class="logo">
            <h1>0penai.icu</h1>
        </div>

        <!-- 搜索栏区域 -->
        <div class="search-bar">
            <input v-model="searchQuery" @keyup.enter="search" placeholder="输入你要搜索的内容">
            <button @click="search">Search</button>
        </div>

        <!-- 书签区域 -->
        <div class="bookmarks">
            <!-- 遍历书签列表，生成每个书签的展示内容 -->
            <div v-for="(bookmark, index) in bookmarks" :key="index" class="bookmark">
                <a :href="bookmark.url" target="_blank" rel="noopener noreferrer">
                    <!-- 根据书签的图标类型展示不同的图标 -->
                    <span class="icon" v-if="bookmark.iconType === 'text'">{{ bookmark.icon }}</span>
                    <img v-else-if="bookmark.iconType === 'image'" :src="bookmark.icon" :alt="bookmark.name"
                        class="icon-image">
                    <img v-else :src="getDefaultIcon(bookmark.url)" :alt="bookmark.name" class="icon-image">
                    <span class="name">{{ bookmark.name }}</span>
                </a>
                <!-- 书签操作按钮：编辑和删除 -->
                <div class="bookmark-actions">
                    <button @click="editBookmark(index)" class="edit">编辑</button>
                    <button @click="deleteBookmark(index)" class="delete">删除</button>
                </div>
            </div>
            <!-- 添加书签按钮 -->
            <div class="add-bookmark" @click="addBookmark">
                <span>+</span>
            </div>
        </div>

        <!-- 编辑书签的模态框 -->
        <div v-if="isEditing" class="modal">
            <div class="modal-content">
                <h2>{{ isNewBookmark ? '添加' : '删除' }}书签</h2>
                <label>
                    链接:
                    <input v-model="editingBookmark.url" placeholder="例如：https://www.baidu.com" @blur="autoFetchIcon">
                </label>
                <label>
                    名称:
                    <input v-model="editingBookmark.name" placeholder="例如：百度">
                </label>
                <label>
                    图标类型:
                    <select v-model="editingBookmark.iconType">
                        <option value="text">文本</option>
                        <option value="image">图片链接</option>
                        <option value="auto">自动获取</option>
                    </select>
                </label>
                <!-- 根据图标类型显示不同的输入框 -->
                <label v-if="editingBookmark.iconType === 'text'">
                    图标文本:
                    <input v-model="editingBookmark.icon" placeholder="例如：🌟">
                </label>
                <label v-if="editingBookmark.iconType === 'image'">
                    图片链接:
                    <input v-model="editingBookmark.icon" placeholder="例如：https://example.com/icon.png">
                </label>
                <!-- 模态框操作按钮：保存和取消 -->
                <div class="modal-actions">
                    <button @click="saveBookmark">保存</button>
                    <button @click="cancelEdit">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';

// 搜索查询关键词
const searchQuery = ref('');
// 书签列表
const bookmarks = reactive([]);
// 是否处于编辑状态
const isEditing = ref(false);
// 当前编辑的书签索引
const editingIndex = ref(-1);
// 是否为新增书签
const isNewBookmark = ref(false);
// 当前编辑或新增的书签对象
const editingBookmark = reactive({
    icon: '',
    url: '',
    name: '',
    iconType: 'auto'
});

// 组件挂载时从本地存储加载书签
onMounted(() => {
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
        bookmarks.push(...JSON.parse(savedBookmarks));
    } else {
        // 如果没有保存的书签，使用默认书签
        bookmarks.push(
            { "icon": "🔍", "url": "https://www.bing.com", "name": "Bing", "iconType": "auto" },
            { "icon": "🤖", "url": "https://openai.com", "name": "ChatGPT", "iconType": "auto" },
            { "icon": "🔮", "url": "https://claude.ai", "name": "Claude", "iconType": "auto" }
        );
    }
});

// 监听书签列表的变化，保存到本地存储
watch(bookmarks, (newBookmarks) => {
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
}, { deep: true });

/**
 * 执行搜索操作
 * 如果搜索词不为空，跳转到 Bing 搜索页面
 */
function search() {
    if (searchQuery.value.trim()) {
        window.location.href = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery.value)}`;
    }
}

/**
 * 添加书签
 * 初始化编辑状态为新增书签，并打开编辑模态框
 */
function addBookmark() {
    isNewBookmark.value = true;
    editingBookmark.icon = '';
    editingBookmark.url = '';
    editingBookmark.name = '';
    editingBookmark.iconType = 'auto';
    isEditing.value = true;
}

/**
 * 编辑书签
 * @param {number} index - 要编辑的书签索引
 * 将当前书签信息复制到编辑对象，并打开编辑模态框
 */
function editBookmark(index) {
    isNewBookmark.value = false;
    editingIndex.value = index;
    Object.assign(editingBookmark, bookmarks[index]);
    isEditing.value = true;
}

/**
 * 删除书签
 * @param {number} index - 要删除的书签索引
 * 从书签列表中移除指定书签
 */
function deleteBookmark(index) {
    bookmarks.splice(index, 1);
}

/**
 * 自动获取图标
 * 如果图标类型为自动获取，尝试从后端获取图标
 */
async function autoFetchIcon() {
    if (editingBookmark.iconType === 'auto' && editingBookmark.url) {
        try {
            // 这里我们假设有一个后端 API 来获取网站图标
            // 实际使用时需要替换为真实的 API 地址
            const response = await fetch(`/api/fetch-icon?url=${encodeURIComponent(editingBookmark.url)}`);
            const data = await response.json();
            if (data.icon) {
                editingBookmark.icon = data.icon;
            }
        } catch (error) {
            console.error('Failed to fetch icon:', error);
        }
    }
}

/**
 * 保存书签
 * 将编辑或新增的书签保存到书签列表中
 */
function saveBookmark() {
    const bookmarkToSave = { ...editingBookmark };
    if (bookmarkToSave.iconType === 'auto') {
        bookmarkToSave.icon = ''; // Clear the icon, we'll use getDefaultIcon
    }
    if (isNewBookmark.value) {
        bookmarks.push(bookmarkToSave);
    } else {
        Object.assign(bookmarks[editingIndex.value], bookmarkToSave);
    }
    isEditing.value = false;
}

/**
 * 取消编辑
 * 关闭编辑模态框
 */
function cancelEdit() {
    isEditing.value = false;
}

/**
 * 获取默认图标
 * @param {string} url - 书签的URL
 * @returns {string} - 默认图标的URL
 */
function getDefaultIcon(url) {
    // 这里我们使用 Google 的 favicon 服务作为示例
    // return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}`;

    // 示例：https://organisational-cyan-rooster.faviconkit.com/openai.com/144
    // 去除"https://"，然后在后面添加"/144"
    url=url.replace('https://','');
    return `https://sunny-magenta-pinniped.faviconkit.com/${url}/256`;
}
</script>


<style scoped>
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    background-color: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;
}

.navigation-hub {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    width: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    min-height: 100vh;
    box-sizing: border-box;
    background-color: #f5f5f5;
    color: #333;
}

.logo h1 {
    font-size: 2.5rem;
    font-weight: 300;
    letter-spacing: 1px;
    margin: 0;
    animation: fadeInDown 0.5s ease-out;
}

.search-bar {
    width: 100%;
    max-width: 600px;
    display: flex;
    animation: fadeIn 0.5s ease-out;
}

.search-bar input {
    flex-grow: 1;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid #333;
    border-right: none;
    border-radius: 4px 0 0 4px;
    transition: all 0.3s ease;
}

.search-bar input:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.search-bar button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    background-color: #333;
    color: white;
    border: 2px solid #333;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.search-bar button:hover {
    background-color: #555;
}

.bookmarks {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
}

.bookmark {
    width: 120px;
    height: 120px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    animation: fadeIn 0.5s ease-out;
}

.add-bookmark {
    width: 115px;
    height: 115px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    animation: fadeIn 0.5s ease-out;
}

.bookmark:hover,
.add-bookmark:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.bookmark a {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 1rem;
    box-sizing: border-box;
}

.bookmark .icon {
    font-size: 2.5rem;
    /* 放大图标 */
    margin-bottom: 0.5rem;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.bookmark .name {
    font-size: 0.9rem;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
}

.bookmark-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.bookmark:hover .bookmark-actions {
    opacity: 1;
}

.bookmark-actions button {
    flex: 1;
    padding: 5px;
    font-size: 0.7rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.bookmark-actions .edit {
    background-color: #333;
    color: white;
}

.bookmark-actions .delete {
    background-color: #ff4d4d;
    color: white;
}

.add-bookmark {
    cursor: pointer;
    font-size: 2rem;
    color: #333;
    border: 2px dashed #33333381;
    background-color: transparent;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease-out;
}

.modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 300px;
    animation: zoomIn 0.3s ease-out;
}

.modal-content h2 {
    margin-top: 0;
    color: #333;
}

.modal-content label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
}

.modal-content input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
}

.modal-actions button {
    padding: 0.5rem 1rem;
    margin-left: 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.modal-actions button:first-child {
    background-color: #333;
    color: white;
}

.modal-actions button:last-child {
    background-color: #f0f0f0;
    color: #333;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.icon-image {
    width: 50px;
    /* 放大图标 */
    height: 50px;
    /* 放大图标 */
    object-fit: contain;
    padding-bottom: 10px;
}

select {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}
</style>
