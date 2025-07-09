class BlogPlatform {
    constructor() {
        this.posts = this.loadPosts();
        this.currentEditingPost = null;
        this.currentSection = 'editor';
        this.initializeElements();
        this.bindEvents();
        this.updatePreview();
    }

    initializeElements() {
        // Section elements
        this.editorSection = document.getElementById('editorSection');
        this.savedPostsSection = document.getElementById('savedPostsSection');
        this.postViewSection = document.getElementById('postViewSection');
        
        // Editor elements
        this.postTitle = document.getElementById('postTitle');
        this.markdownEditor = document.getElementById('markdownEditor');
        this.previewContent = document.getElementById('previewContent');
        this.saveBtn = document.getElementById('saveBtn');
        this.previewToggle = document.getElementById('previewToggle');
        
        // Navigation elements
        this.newPostBtn = document.getElementById('newPostBtn');
        this.savedPostsBtn = document.getElementById('savedPostsBtn');
        this.backToEditor = document.getElementById('backToEditor');
        this.backToList = document.getElementById('backToList');
        
        // Post view elements
        this.postsList = document.getElementById('postsList');
        this.postViewContent = document.getElementById('postViewContent');
        this.editPost = document.getElementById('editPost');
        this.deletePost = document.getElementById('deletePost');
        
        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
        
        // Preview pane elements
        this.previewPane = document.querySelector('.preview-pane');
        this.editorPane = document.querySelector('.editor-pane');
    }

    bindEvents() {
        // Navigation events
        this.newPostBtn.addEventListener('click', () => this.showEditor());
        this.savedPostsBtn.addEventListener('click', () => this.showSavedPosts());
        this.backToEditor.addEventListener('click', () => this.showEditor());
        this.backToList.addEventListener('click', () => this.showSavedPosts());
        
        // Editor events
        this.markdownEditor.addEventListener('input', () => this.updatePreview());
        this.saveBtn.addEventListener('click', () => this.savePost());
        this.previewToggle.addEventListener('click', () => this.togglePreview());
        
        // Post view events
        this.editPost.addEventListener('click', () => this.editCurrentPost());
        this.deletePost.addEventListener('click', () => this.deleteCurrentPost());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    this.savePost();
                    break;
                case 'n':
                    e.preventDefault();
                    this.showEditor();
                    break;
            }
        }
    }

    updatePreview() {
        const markdownContent = this.markdownEditor.value;
        this.previewContent.innerHTML = marked.parse(markdownContent);
    }

    showEditor() {
        this.currentSection = 'editor';
        this.editorSection.classList.remove('hidden');
        this.savedPostsSection.classList.add('hidden');
        this.postViewSection.classList.add('hidden');
        this.currentEditingPost = null;
        this.clearEditor();
    }

    showSavedPosts() {
        this.currentSection = 'saved';
        this.editorSection.classList.add('hidden');
        this.savedPostsSection.classList.remove('hidden');
        this.postViewSection.classList.add('hidden');
        this.renderPostsList();
    }

    showPostView(post) {
        this.currentSection = 'view';
        this.editorSection.classList.add('hidden');
        this.savedPostsSection.classList.add('hidden');
        this.postViewSection.classList.remove('hidden');
        this.renderPostView(post);
    }

    clearEditor() {
        this.postTitle.value = '';
        this.markdownEditor.value = `# Welcome to BlogCraft!

This is a **powerful** markdown editor that supports:

- **Bold** and *italic* text
- [Links](https://example.com)
- \`Code snippets\`
- Lists and more!

## Getting Started

Simply start typing your markdown content here and see the live preview on the right!`;
        this.updatePreview();
    }

    savePost() {
        const title = this.postTitle.value.trim();
        const content = this.markdownEditor.value.trim();
        
        if (!title) {
            this.showToast('Please enter a post title', 'error');
            return;
        }
        
        if (!content) {
            this.showToast('Please enter some content', 'error');
            return;
        }
        
        const post = {
            id: this.currentEditingPost ? this.currentEditingPost.id : Date.now(),
            title,
            content,
            preview: this.generatePreview(content),
            createdAt: this.currentEditingPost ? this.currentEditingPost.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentEditingPost) {
            const index = this.posts.findIndex(p => p.id === this.currentEditingPost.id);
            this.posts[index] = post;
            this.showToast('Post updated successfully!');
        } else {
            this.posts.unshift(post);
            this.showToast('Post saved successfully!');
        }
        
        this.savePosts();
        this.currentEditingPost = null;
    }

    generatePreview(content) {
        const plainText = content.replace(/[#*`\[\]()]/g, '').trim();
        return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
    }

    renderPostsList() {
        if (this.posts.length === 0) {
            this.postsList.innerHTML = `
                <div class="no-posts">
                    <h3>No posts yet</h3>
                    <p>Create your first blog post to get started!</p>
                    <button class="btn btn-primary" onclick="blogPlatform.showEditor()">Create Post</button>
                </div>
            `;
            return;
        }
        
        this.postsList.innerHTML = this.posts.map(post => `
            <div class="post-item" onclick="blogPlatform.showPostView(${JSON.stringify(post).replace(/"/g, '&quot;')})">
                <h3>${this.escapeHtml(post.title)}</h3>
                <p class="post-preview">${this.escapeHtml(post.preview)}</p>
                <div class="post-meta">
                    <span class="post-date">${this.formatDate(post.createdAt)}</span>
                    <div class="post-actions">
                        <button class="btn btn-primary" onclick="event.stopPropagation(); blogPlatform.editPost(${post.id})">Edit</button>
                        <button class="btn btn-danger" onclick="event.stopPropagation(); blogPlatform.deletePost(${post.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPostView(post) {
        this.currentEditingPost = post;
        this.postViewContent.innerHTML = `
            <h1>${this.escapeHtml(post.title)}</h1>
            <div class="post-meta" style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
                <span>Created: ${this.formatDate(post.createdAt)}</span>
                ${post.updatedAt !== post.createdAt ? `<span>Updated: ${this.formatDate(post.updatedAt)}</span>` : ''}
            </div>
            <div class="post-content">
                ${marked.parse(post.content)}
            </div>
        `;
    }

    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            this.currentEditingPost = post;
            this.postTitle.value = post.title;
            this.markdownEditor.value = post.content;
            this.updatePreview();
            this.showEditor();
        }
    }

    editCurrentPost() {
        if (this.currentEditingPost) {
            this.editPost(this.currentEditingPost.id);
        }
    }

    deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.savePosts();
            this.showToast('Post deleted successfully!');
            this.showSavedPosts();
        }
    }

    deleteCurrentPost() {
        if (this.currentEditingPost) {
            this.deletePost(this.currentEditingPost.id);
        }
    }

    togglePreview() {
        if (window.innerWidth <= 1024) {
            this.previewPane.classList.toggle('show');
            this.editorPane.classList.toggle('hide');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    loadPosts() {
        try {
            const posts = localStorage.getItem('blogPosts');
            return posts ? JSON.parse(posts) : [];
        } catch (error) {
            console.error('Error loading posts:', error);
            return [];
        }
    }

    savePosts() {
        try {
            localStorage.setItem('blogPosts', JSON.stringify(this.posts));
        } catch (error) {
            console.error('Error saving posts:', error);
            this.showToast('Error saving post', 'error');
        }
    }
}

// Initialize the blog platform when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.blogPlatform = new BlogPlatform();
});

// Handle responsive preview toggle
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        document.querySelector('.preview-pane').classList.remove('show');
        document.querySelector('.editor-pane').classList.remove('hide');
    }
});

// No-posts styles
const style = document.createElement('style');
style.textContent = `
    .no-posts {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
    }
    
    .no-posts h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #374151;
    }
    
    .no-posts p {
        margin-bottom: 2rem;
        font-size: 1.1rem;
    }
`;
document.head.appendChild(style);