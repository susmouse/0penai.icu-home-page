<template>

    <!-- 粒子效果背景 -->
    <canvas class="background"></canvas>
    <!-- 导航中心组件 -->
    <div class="navigation-hub">

        <!-- 添加侧边栏按钮 -->
        <button class="sidebar-button" @click="showSidebar">
            <span>☰</span>
        </button>

        <!-- 侧边栏 -->
        <div :class="['sidebar', { open: isSidebarOpen }]" @mouseleave="hideSidebar">
            <div class="sidebar-content">
                <button @click="hideSidebar" class="phone-button">关闭侧边栏</button>
                <button @click="showSettingModal">数据管理</button>
                <button>关于</button>
                <!-- 其他侧边栏内容 -->
            </div>
        </div>

        <!-- 标题区域 -->
        <div class="logo">
            <img src="../assets/logo.svg" alt="0penai.icu" class="logo-image" />
        </div>

        <div class="search-container">
            <div class="search-engine-selector">
                <button @click="toggleSearchEngineDropdown" class="search-engine-button">
                    {{ currentSearchEngine.name }}
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div v-if="showSearchEngineDropdown" class="search-engine-dropdown">
                    <div v-for="(engine, index) in searchEngines" :key="index" class="search-engine-option">
                        <span @click="selectSearchEngine(index)">{{ engine.name }}</span>
                        <button @click="deleteSearchEngine(index)" class="delete-engine">
                            ×
                        </button>
                    </div>
                    <div @click="openSearchEngineModal" class="search-engine-option add-engine">
                        <span>+ 添加搜索引擎</span>
                    </div>
                </div>
            </div>
            <div class="search-bar">
                <input v-model="searchQuery" @keyup.enter="search" :placeholder="`在 ${currentSearchEngine.name} 中搜索`"
                    class="search-input" />
                <button @click="search" class="search-button">搜索</button>
            </div>
        </div>

        <!-- 书签区域 -->
        <div class="bookmarks" @dragover.prevent @drop="onDrop">
            <!-- 遍历书签列表，生成每个书签的展示内容 -->
            <div v-for="(bookmark, index) in bookmarks" :key="index" class="bookmark" draggable="true"
                @dragstart="startDrag($event, index)">
                <a :href="bookmark.url" target="_blank" rel="noopener noreferrer">
                    <!-- 根据书签的图标类型展示不同的图标 -->
                    <span class="icon" v-if="bookmark.iconType === 'text'">{{ bookmark.icon }}</span>
                    <span class="icon svg" v-else-if="bookmark.iconType === 'svg'" v-html="bookmark.icon"></span>
                    <img v-else :src="getDefaultIcon(bookmark.url)" :alt="bookmark.name" class="icon-image" />
                    <span class="name">{{ bookmark.name }}</span>
                </a>
                <!-- 书签操作按钮：编辑和删除 -->
                <div class="bookmark-actions">
                    <button @click="editBookmark(index)" class="edit">
                        编辑
                    </button>
                    <button @click="deleteBookmark(index)" class="delete">
                        删除
                    </button>
                </div>
            </div>
            <!-- 添加书签按钮 -->
            <div class="add-bookmark" @click="addBookmark">
                <span>+</span>
            </div>
        </div>

        <!-- 网站信息 -->
        <!-- <div class="icp-beian-number">粤ICP备2024314909号</div> -->
        <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noopener noreferrer" class="icp-beian-number">
            粤ICP备2024314909号
        </a>

        <!-- 编辑书签的模态框 -->
        <div v-if="isEditing" class="modal">
            <div class="modal-content">
                <h2>{{ isNewBookmark ? '添加' : '编辑' }}书签</h2>
                <label>
                    链接:
                    <input v-model="editingBookmark.url" placeholder="例如：https://www.baidu.com" />
                </label>
                <label>
                    名称:
                    <input v-model="editingBookmark.name" placeholder="例如：百度" />
                </label>
                <label>
                    图标类型:
                    <select v-model="editingBookmark.iconType">
                        <option value="text">文本</option>
                        <option value="svg">SVG</option>
                    </select>
                </label>
                <!-- 根据图标类型显示不同的输入框 -->
                <label v-if="editingBookmark.iconType === 'text'">
                    图标文本:
                    <input v-model="editingBookmark.icon" placeholder="例如：🌟" />
                </label>
                <label v-if="editingBookmark.iconType === 'svg'">
                    SVG内容:
                    <textarea v-model="editingBookmark.icon" placeholder="例如：<svg>...</svg>"
                        class="model-textarea"></textarea>
                </label>
                <!-- 模态框操作按钮：保存和取消 -->
                <div class="modal-actions">
                    <button @click="saveBookmark">保存</button>
                    <button @click="cancelEdit">取消</button>
                </div>
            </div>
        </div>

        <!-- 添加搜索引擎的模态框 -->
        <div v-if="isEditingSearchEngine" class="modal">
            <div class="modal-content">
                <h2>添加搜索引擎</h2>
                <div class="input-group">
                    <label for="search-engine-name">名称:</label>
                    <input id="search-engine-name" v-model="editingSearchEngine.name" placeholder="例如：Google" />
                </div>
                <div class="input-group">
                    <label for="search-engine-url">URL:</label>
                    <input id="search-engine-url" v-model="editingSearchEngine.url"
                        placeholder="例如：https://www.google.com/search?q=" />
                </div>
                <!-- <div class="checkbox-group">
                    <span for="default-engine" style="width: 8rem;">设为默认：</span>
                    <input type="checkbox" id="default-engine" v-model="editingSearchEngine.isDefault">
                </div> -->
                <div class="modal-actions">
                    <button @click="saveSearchEngine" class="save-button">
                        保存
                    </button>
                    <button @click="cancelEditSearchEngine" class="cancel-button">
                        取消
                    </button>
                </div>
            </div>
        </div>

        <!-- 通过JSON直接设置当前数据的模态框 -->
        <div v-if="isSetting" class="modal">
            <div class="modal-content">
                <h2>配置项</h2>
                <h4>搜索引擎设置</h4>
                <textarea v-model="searchEnginesToJson" placeholder="请输入搜索引擎列表" class="modal-textarea"></textarea>
                <h4>书签设置</h4>
                <textarea v-model="bookmarkToJson" placeholder="请输入书签列表" class="modal-textarea"></textarea>
                <div class="modal-actions">
                    <button @click="isSetting = false">返回</button>
                    <button @click="saveSettings()">保存</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { gsap } from 'gsap';

// 侧边栏状态
const isSidebarOpen = ref(false);
function showSidebar() {
    isSidebarOpen.value = true;
}
function hideSidebar() {
    isSidebarOpen.value = false;
}


// 导入导出相关
const isSetting = ref(false);
const searchEnginesToJson = ref(null);
const bookmarkToJson = ref(null);
// 打开配置页面模态框
function showSettingModal() {
    isSetting.value = true;
    searchEnginesToJson.value = JSON.stringify(searchEngines);
    bookmarkToJson.value = JSON.stringify(bookmarks);
}
// 保存设置
function saveSettings() {
    isSetting.value = false;
    // 检测用户输入是否合法
    try {
        const parsedSearchEngines = JSON.parse(searchEnginesToJson.value);
        const parsedBookmarks = JSON.parse(bookmarkToJson.value);
        if (!Array.isArray(parsedSearchEngines) || !Array.isArray(parsedBookmarks)) {
            throw new Error('输入格式不正确');
        }
        // 设置搜索引擎和书签列表为用户输入
        // 清空搜索引擎和书签列表
        searchEngines.splice(0, searchEngines.length);
        bookmarks.splice(0, bookmarks.length);
        searchEngines.push(...parsedSearchEngines);
        bookmarks.push(...parsedBookmarks);
    } catch (error) {
        alert('输入的JSON格式不正确，请检查后重试。');
    }
}

// 搜索引擎列表
const searchEngines = reactive([]);
// 当前激活的搜索引擎
const currentSearchEngine = ref({});
// 是否显示搜索引擎下拉框
const showSearchEngineDropdown = ref(false);
// 是否正在编辑搜索引擎
const isEditingSearchEngine = ref(false);
// 正在编辑的搜索引擎
const editingSearchEngine = reactive({
    name: '',
    url: ''
});
// 搜索查询关键词
const searchQuery = ref('');

/**
 * 监听搜索引擎列表的变化，保存到本地存储
 */
watch(searchEngines, (newSearchEngines) => {
    localStorage.setItem('searchEngines', JSON.stringify(newSearchEngines));
    setCurrentSearchEngine();
}, { deep: true });

/**
 * 设置当前激活的搜索引擎
 */
function setCurrentSearchEngine() {
    currentSearchEngine.value = searchEngines[0];
}

/**
 * 切换搜索引擎下拉框可见度
 */
function toggleSearchEngineDropdown() {
    showSearchEngineDropdown.value = !showSearchEngineDropdown.value;
}

/**
 * 选择对应搜索引擎
 * @param {number} index - 要选择的搜索引擎索引
 */
function selectSearchEngine(index) {
    currentSearchEngine.value = searchEngines[index];
    showSearchEngineDropdown.value = false;
    // 对搜索引擎进行重新排序，被选中的放到第一位
    searchEngines.unshift(searchEngines.splice(index, 1)[0]);
}

/**
 * 删除对应搜索引擎
 * @param {number} index - 要删除的搜索引擎索引
 */
function deleteSearchEngine(index) {
    if (searchEngines.length > 1) {
        searchEngines.splice(index, 1);
        if (currentSearchEngine.value === searchEngines[index]) {
            setCurrentSearchEngine();
        }
    } else {
        alert('至少保留一个搜索引擎');
    }
}

/**
 * 打开添加搜索引擎模态框
 */
function openSearchEngineModal() {
    editingSearchEngine.name = '';
    editingSearchEngine.url = '';
    isEditingSearchEngine.value = true;
    showSearchEngineDropdown.value = false;
}

/**
 * 保存添加的搜索引擎
 */
function saveSearchEngine() {
    if (editingSearchEngine.name && editingSearchEngine.url) {
        searchEngines.push({ ...editingSearchEngine });
        isEditingSearchEngine.value = false;
        setCurrentSearchEngine();
    } else {
        alert('请填写完整的搜索引擎信息');
    }
}

/**
 * 取消编辑搜索引擎
 */
function cancelEditSearchEngine() {
    isEditingSearchEngine.value = false;
}

/**
 * 执行搜索操作
 * 如果搜索查询不为空，则使用当前搜索引擎进行搜索，并跳转到搜索结果页面
 */
function search() {
    if (searchQuery.value.trim()) {
        window.location.href = `${currentSearchEngine.value.url}${encodeURIComponent(searchQuery.value)}`;
    }
}

// 书签相关

// 书签列表
const bookmarks = reactive([]);
// 是否正在编辑书签
const isEditing = ref(false);
// 是否是新增书签
const isNewBookmark = ref(false);
// 正在编辑的书签索引
const editingIndex = ref(-1);
// 正在编辑的书签
const editingBookmark = reactive({
    url: '',
    name: '',
    iconType: 'text',
    icon: ''
});

/**
 * 监听书签列表的变化，并将其保存到本地存储中
 * @param {Array} newBookmarks - 新的书签列表
 */
watch(bookmarks, (newBookmarks) => {
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
}, { deep: true });


/**
 * 添加书签
 * 初始化编辑状态为新增书签，并打开编辑模态框
 */
function addBookmark() {
    isNewBookmark.value = true;
    editingBookmark.icon = '';
    editingBookmark.url = '';
    editingBookmark.name = '';
    editingBookmark.iconType = 'text';
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
 * 保存书签
 * 将编辑或新增的书签保存到书签列表中
 */
function saveBookmark() {
    const bookmarkToSave = { ...editingBookmark };
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
 * 开始拖拽书签
 * @param {Event} event - 拖拽事件
 * @param {number} index - 被拖拽的书签索引
 */
function startDrag(event, index) {
    event.dataTransfer.setData('bookmarkIndex', index);
}

/**
 * 处理书签的拖放操作
 * @param {Event} event - 拖放事件
 */
function onDrop(event) {
    const dragIndex = event.dataTransfer.getData('bookmarkIndex');
    const dropIndex = [...event.target.parentElement.children].indexOf(event.target);
    const [draggedBookmark] = bookmarks.splice(dragIndex, 1);
    bookmarks.splice(dropIndex, 0, draggedBookmark);
}

// 页面初始化进行组件挂载
onMounted(() => {
    // 初始化动画
    gsap.from('.navigation-hub', { opacity: 0, y: -50, duration: 1 });
    gsap.from('.search-container', { opacity: 0, x: -50, duration: 1, delay: 0.5 });
    gsap.from('.bookmarks', { opacity: 0, y: 50, duration: 1, delay: 0.75 });

    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
        bookmarks.push(...JSON.parse(savedBookmarks));
    } else {
        // 如果没有保存的书签，使用默认书签
        bookmarks.push(
            {
                "icon": "<svg t=\"1726374151060\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"12737\" width=\"200\" height=\"200\"><path d=\"M0 0m200 0l624 0q200 0 200 200l0 624q0 200-200 200l-624 0q-200 0-200-200l0-624q0-200 200-200Z\" fill=\"#2C23FF\" p-id=\"12738\"></path><path d=\"M441.234 170.48q8.094 0.4 14.698 4.09 7.587 4.24 11.83 11.885 5.321 9.591 4.02 22.846-0.69 7.034-3.47 16.717-1.454 5.058-4.902 15.373-3.207 9.593-4.46 13.942-0.542 1.88-0.956 3.51 51.137 16.71 115.69 56.705 42.611 26.4 91.412 63.134-18.088-56.865-22.426-96.153-3.912-35.42 3.125-58.839 4.131-13.75 12.035-23.753 8.557-10.83 20.967-16.69 10.647-5.027 21.15-6.472 11.395-1.567 22.24 1.095 20.48 5.027 36.475 24.313 13.407 16.164 23.905 43.002 5.52 14.112 10.36 31.45 26.755-11.726 48.745-19.43 33.891-11.871 57.48-14.484 13.294-1.473 23.973-0.098 12.878 1.658 22.447 7.474 11.226 6.823 16.923 18.473 5.05 10.325 5.05 23.38 0 21.664-13.874 44.718-12.137 20.167-35.41 42.116-39.404 37.163-112.983 81.526 9.267 34.881 9.267 84.14 0 35.608-21.325 76.683-15.207 29.29-41.535 61.883 12.251 8.958 21.015 17.287 17.868 16.981 23.041 33.325 3.271 10.333 1.691 20.336-1.58 10.013-7.799 18.464-9.11 12.384-27.695 20.162-25.332 10.602-71.247 14-18.426 1.364-39.36 1.515-16.075 0.117-32.415-0.482-252.567 93.646-404.825-3.969-55.77-35.755-92.223-87.024-17.126-24.085-29.524-51.043-11.905-25.887-19.21-53.893-7.029-26.948-9.632-55.209-2.517-27.328-0.827-55.11 1.647-27.075 7.232-53.693 5.498-26.205 14.61-51.009 10-27.223 24.41-52.189 14.113-24.452 32.17-46.248 17.749-21.422 38.916-39.81 20.903-18.158 44.651-32.933 23.585-14.674 49.4-25.652 25.802-10.973 53.192-17.983 27.55-7.05 56.038-9.92 28.823-2.903 57.94-1.459z m-102.077 57.88q-47.968 12.276-89.137 37.889-41.458 25.793-71.96 62.61-31.432 37.94-48.487 84.366-7.907 21.526-12.689 44.314-4.864 23.181-6.297 46.75-1.467 24.12 0.713 47.794 2.243 24.35 8.28 47.497 12.77 48.961 41.407 89.235 31.066 43.692 79.01 74.43 133.364 85.502 366.595-2.258a23.99 23.99 0 0 1 9.486-1.515q17.628 0.76 34.906 0.634 19.334-0.14 36.165-1.385 18.458-1.366 32.67-3.975 14.626-2.684 23.587-6.435 3.193-1.336 5.34-2.67-0.47-0.756-1.098-1.635-2.87-4.02-8.014-8.909-12.58-11.955-36.317-26.799a24.001 24.001 0 0 1-5.23-36.274q35.277-39.774 52.532-73.008 15.926-30.676 15.926-54.567 0-54.938-12.327-86.195c-4.345-11.018-0.002-23.559 10.226-29.53q81.13-47.367 120.884-84.86 18.477-17.426 27.216-31.946 7.001-11.633 7.001-19.969 0-0.686-0.046-1.242-1.056-0.29-2.503-0.478-4.978-0.64-12.559 0.2-18.16 2.011-46.896 12.077-30.15 10.562-70.787 29.663a23.998 23.998 0 0 1-33.66-16.619q-6.836-31.42-15.23-52.88-7.68-19.634-16.148-29.845-5.88-7.09-10.972-8.34-4.517-1.108-11.452 2.167-2.225 1.05-3.8 3.044-2.23 2.821-3.728 7.807-1.96 6.525-2.388 15.883-0.479 10.455 1.003 23.875 6.398 57.937 47.991 163.382a23.995 23.995 0 0 1-0.312 18.366 24 24 0 0 1-37.261 8.975q-84.76-69.73-152.394-111.633-66.142-40.98-114.908-54.813-7.906-2.242-13.725-7.607-5.638-5.198-8.482-12.562-3.645-9.436-2.202-21.894 0.861-7.434 3.74-17.427 1.532-5.324 5.06-15.876 1.598-4.78 2.684-8.176-41.466 0.14-81.413 10.364zM405.951 762q-68.583 0-128.34-32.035-52.523-28.158-99.73-82.17-11.846-13.554-21.434-29.942-9.42-16.1-15.857-33.557-6.57-17.819-9.458-35.502-3.063-18.764-1.734-35.956 1.462-18.919 8.158-34.759 7.443-17.605 20.824-30.24 14.087-13.302 33.72-20.09Q211.615 421 235.95 421q32.995 0 71.856 17.37 36.676 16.394 79.351 48.598 83.007 62.64 190.908 186.788a24.002 24.002 0 0 1 5.885 15.744c0 13.255-10.745 24-24 24a24.002 24.002 0 0 1-18.114-8.256q-104.6-120.352-183.592-179.962-38.325-28.92-70.025-43.09Q258.705 469 235.95 469q-16.27 0-28.164 4.113-9.873 3.414-16.452 9.626-6.05 5.712-9.567 14.031-3.652 8.641-4.512 19.767-0.885 11.446 1.25 24.523 2.144 13.134 7.12 26.628 4.972 13.481 12.252 25.926 7.292 12.463 16.145 22.592 41.452 47.43 86.268 71.454 24.064 12.901 49.687 19.456Q376.887 714 405.951 714c13.255 0 24 10.745 24 24s-10.745 24-24 24z\" fill=\"#FFFFFF\" p-id=\"12739\"></path></svg>",
                "url": "https://chat.deepseek.com/",
                "name": "Deepseek",
                "iconType": "svg"
            },
            {
                "icon": "<svg t=\"1726369105386\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"5489\" width=\"150\" height=\"150\"><path d=\"M565.265178 954.519092c-22.289934 0-48.400999-8.151747-67.952455-14.838727a103.425292 103.425292 0 0 1-26.875292-11.272338c-12.737105-7.769634-15.411897-8.342804-19.806198-24.773669 21.971506-5.158528 81.581157-41.905075 103.871091-55.342721 148.896757-89.159735 119.028246-10.444426 119.028246-364.981743 15.029784 3.566389 82.791182 32.415932 82.791182 57.316972 0 133.102747 20.570425 273.847757-52.604243 354.91943-22.799418 25.47421-91.834527 58.972796-138.388646 58.972796z m-433.061569-299.321966c258.626916 136.860193 184.369594 157.048504 357.721593 52.094759 44.579867-27.193719 90.433445-49.292596 132.593263-77.568969v101.896839c-95.528287 22.226248-272.319304 227.038896-419.050754 100.686815l-25.856323-25.155782c-37.319718-43.943012-45.344094-72.410442-45.344094-151.889977z m375.744596-19.105658c-19.933569-13.310275-79.479535-51.330533-101.896839-57.316972v-133.739602a1158.312326 1158.312326 0 0 0 101.896839-57.316973c43.943012 10.189684 70.690933 47.063603 114.633945 57.316973v127.371049c-17.831947 12.10025-95.846715 58.718054-114.633945 63.749211z m-426.693016-178.31947c0-63.685525-4.26693-90.306074 38.84817-145.776166 23.945757-30.88748 47.509402-39.612396 82.090641-57.953828v261.110652c44.134069 23.372588 83.873836 49.037854 129.345301 74.448379l131.765351 78.396881c-59.545966 15.921381-63.685525 61.32916-109.602788 33.753328-104.699003-62.730242-272.38299-129.345301-272.38299-243.91556z m866.123138 127.37105c0 79.543221-47.573087 161.188063-121.002497 178.31947v-165.582365c0-82.791182 9.743885-84.574377-48.910483-116.608196L565.265178 362.371082c15.79401-23.62733 22.608361-19.105657 48.146256-34.835982 41.714019-25.47421 39.039227-16.112438 117.053995 28.785857 94.190891 54.196382 216.849212 100.559444 216.849212 228.885777z m-541.326961-197.425127v-95.528287c43.751956-23.181531 90.688187-50.94842 133.357489-76.804743 82.154327-49.547338 95.528287-63.303412 185.006449-63.303412 48.464684 0 102.533695 36.746548 125.651541 65.405034 42.223503 52.22213 39.930824 92.662439 39.930824 151.125751-31.078536-16.494551-192.393971-121.002497-222.899337-121.002498s-229.650003 123.422547-261.110652 140.108155z m-50.94842 159.213812c-16.36718-10.95391-63.112355-39.99451-82.791183-44.579867 0-168.320842-33.880699-314.606493 67.952455-390.519639 56.043262-41.714019 113.169178-53.814269 181.376375-30.696423 25.47421 8.661231 35.536523 20.888852 56.36169 26.429493-11.781822 16.048752-80.68956 50.311565-102.278953 63.303412-154.564769 93.235608-120.620384 7.451206-120.620384 376.063024z m-292.953415 121.002498c0 169.148754 115.143429 280.853165 274.293556 273.847756 59.800708-2.674792 26.811606-7.705949 69.417222 25.47421 97.820966 76.741057 228.822091 73.747838 319.637649 1.018969a251.939936 251.939936 0 0 0 52.604244-55.661149c58.20857-85.274918-10.95391-45.598836 81.96327-83.619094 130.236898-53.241099 199.399378-217.358696 128.64476-355.428914-27.448461-53.559526-40.249252-28.849543-28.276373-104.699003 18.723544-118.582447-63.176041-230.032116-157.621674-269.771884-98.90362-41.586648-129.090559 12.737105-178.892639-37.574459A161.888604 161.888604 0 0 0 580.103905 28.913674C474.003821-27.766443 331.284559 1.528898 258.428319 93.681853c-81.326415 102.979494 9.489143 54.705866-92.407697 98.648878C15.149614 257.353652-33.251385 439.175825 41.579107 561.06992c56.807488 92.598753 20.570425 4.967471 20.570424 106.800625z\" fill=\"#10A37F\" p-id=\"5490\"></path></svg>",
                "url": "https://openai.com",
                "name": "ChatGPT",
                "iconType": "svg"
            },
            {
                "icon": "<svg t=\"1726369475508\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"6522\" width=\"200\" height=\"200\"><path d=\"M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z\" fill=\"#D97757\" p-id=\"6523\"></path><path d=\"M278.698667 638.592l151.04-84.736 2.56-7.381333-2.56-4.053334H422.4l-25.258667-1.578666-86.314666-2.304-74.88-3.114667-72.533334-3.882667-18.261333-3.882666L128 505.088l1.749333-11.264 15.36-10.282667 21.973334 1.92 48.64 3.328 72.874666 5.034667 52.906667 3.114667 78.336 8.149333h12.458667l1.706666-5.034667-4.266666-3.114666-3.285334-3.114667-75.434666-51.072L269.354667 388.693333 226.56 357.632l-23.125333-15.744-11.648-14.762667-5.077334-32.256 20.992-23.082666 28.202667 1.92 7.210667 1.962666 28.586666 21.930667 61.013334 47.232 79.744 58.666667 11.648 9.728 4.693333-3.328 0.554667-2.346667-5.248-8.704-43.349334-78.293333L334.506667 240.896l-20.608-33.066667-5.418667-19.797333a95.018667 95.018667 0 0 1-3.328-23.296l23.893333-32.426667 13.226667-4.309333 31.914667 4.266667 13.44 11.648 19.797333 45.269333 32.085333 71.296 49.792 96.981333 14.592 28.757334 7.765334 26.581333 2.901333 8.192h5.077333v-4.693333l4.053334-54.613334 7.594666-66.986666 7.381334-86.272 2.56-24.277334 12.032-29.141333 23.893333-15.744 18.688 8.96 15.36 21.930667-2.133333 14.208-9.130667 59.221333-17.92 92.885333-11.648 62.165334h6.826667l7.765333-7.765334 31.488-41.813333 52.906667-66.005333 23.296-26.24 27.221333-28.928 17.493333-13.824h33.066667l24.32 36.138666-10.88 37.290667-34.048 43.136-28.16 36.522667-40.448 54.4-25.301333 43.52 2.346666 3.498666 6.016-0.554666 91.392-19.456 49.365334-8.96 58.922666-10.069334 26.624 12.416 2.944 12.629334-10.496 25.856-63.018666 15.530666-73.856 14.762667-110.08 26.026667-1.365334 0.981333 1.578667 1.962667 49.578667 4.693333 21.205333 1.109333h51.882667l96.64 7.210667 25.301333 16.725333 15.146667 20.394667-2.56 15.530667-38.826667 19.797333-52.522667-12.416-122.453333-29.141333-42.026667-10.496h-5.845333v3.498666l34.986667 34.176 64.170666 57.898667 80.298667 74.624 4.096 18.474667-10.325333 14.549333-10.88-1.536-70.570667-53.034667-27.221333-23.893333-61.653334-51.882667h-4.053333v5.418667l14.165333 20.778667 75.093334 112.682666 3.84 34.56-5.418667 11.306667-19.456 6.826667-21.376-3.925334-43.946667-61.568-45.312-69.376-36.522666-62.165333-4.48 2.56-21.589334 232.106667-10.112 11.904-23.338666 8.917333-19.456-14.762667-10.282667-23.893333 10.282667-47.232 12.458666-61.568 10.112-48.981333 9.130667-60.8 5.461333-20.181334-0.426666-1.365333-4.437334 0.554667-45.866666 62.976-69.802667 94.208-55.253333 59.050666-13.226667 5.248-22.912-11.818666 2.133333-21.205334 12.8-18.816 76.458667-97.152 46.08-60.245333 29.738667-34.773333-0.213334-5.034667h-1.706666L260.181333 721.92l-36.181333 4.693333-15.530667-14.592 1.92-23.893333 7.381334-7.765333 61.056-41.984-0.170667 0.213333z\" fill=\"#FFFFFF\" p-id=\"6524\"></path></svg>",
                "url": "https://claude.ai",
                "name": "Claude",
                "iconType": "svg"
            }
        );
    }

    // 读取本地存储的搜索引擎列表
    const savedSearchEngines = localStorage.getItem('searchEngines');
    if (savedSearchEngines) {
        searchEngines.push(...JSON.parse(savedSearchEngines));
    } else {
        // 默认搜索引擎
        searchEngines.push(
            { name: 'Bing', url: 'https://www.bing.com/search?q=' },
            { name: 'Google', url: 'https://www.google.com/search?q=' },
            { name: 'Baidu', url: 'https://www.baidu.com/s?wd=' }
        );
    }
    setCurrentSearchEngine();
});

</script>


<style scoped>
@import "../assets/style.css";
</style>
