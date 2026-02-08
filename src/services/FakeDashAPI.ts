import axios from "axios";

// --- Configuration ---
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';
// const API_PORT = import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : '';
// const BASE_URL = `${API_URL}${API_PORT}`;

const API_URL = 'http://localhost';
const API_PORT = '3001';
const BASE_URL = `${API_URL}${API_PORT ? ":" : ""}${API_PORT}`;

// --- Interfaces for Raw JSON Data ---
export interface RawPost {
    id: string;
    userId: number;
    title: string;
    content: string;
    createdAt: string;
}

export interface RawUser {
    id: string;
    name: string;
    email: string;
    password?: string;
}

// --- Domain Classes ---

export class Post {
    public id: string;
    public userId: number;
    public title: string;
    public content: string;
    public createdAt: string;

    private _api: FakeDashAPI;

    constructor(data: RawPost, api: FakeDashAPI) {
        this.id = data.id;
        this.userId = data.userId;
        this.title = data.title;
        this.content = data.content || "";
        this.createdAt = data.createdAt;
        this._api = api;
    }

    /** Returns the User object author of this post */
    get author(): User | undefined {
        return this._api.getUser(this.userId);
    }

    /** Updates the post in the API and updates local memory */
    async save(): Promise<void> {
        try {
            const payload = {
                id: this.id,
                userId: this.userId,
                title: this.title,
                content: this.content,
                createdAt: this.createdAt
            };

            // 1. Update API
            await axios.put(`${BASE_URL}/posts/${this.id}`, payload);

            // 2. Update local memory
            const index = this._api._posts.findIndex(p => p.id === this.id);
            if (index !== -1) {
                this._api._posts[index] = this;
            }

            // 3. Notify UI listeners
            this._api.notifyListeners();
        } catch (error) {
            console.error("Failed to save post", error);
            throw error;
        }
    }

    /** Deletes the post from API and removes it from local memory */
    async delete(): Promise<void> {
        try {
            await axios.delete(`${BASE_URL}/posts/${this.id}`);
            this._api.removePostFromMemory(this.id);
            this._api.notifyListeners();
        } catch (error) {
            console.error("Failed to delete post", error);
            throw error;
        }
    }
}

export class User {
    public id: string;
    public name: string;
    public email: string;
    public password?: string;

    private _api: FakeDashAPI;

    constructor(data: RawUser, api: FakeDashAPI) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this._api = api;
    }

    /** Returns all posts belonging to this user */
    get posts(): Post[] {
        return this._api.getPosts().filter(p => String(p.userId) === String(this.id));
    }

    async save(): Promise<void> {
        try {
            const payload = {
                id: this.id,
                name: this.name,
                email: this.email,
                password: this.password
            };
            await axios.put(`${BASE_URL}/users/${this.id}`, payload);

            // Update local memory
            const index = this._api._users.findIndex(u => u.id === this.id);
            if (index !== -1) {
                this._api._users[index] = this;
            }

            this._api.notifyListeners();
        } catch (error) {
            console.error("Failed to save user", error);
            throw error;
        }
    }

    async delete(): Promise<void> {
        try {
            // Optional: Delete user's posts first
            const userPosts = this.posts;
            await Promise.all(userPosts.map(p => axios.delete(`${BASE_URL}/posts/${p.id}`)));

            // Delete User
            await axios.delete(`${BASE_URL}/users/${this.id}`);

            // Update memory
            userPosts.forEach(p => this._api.removePostFromMemory(p.id));
            this._api.removeUserFromMemory(this.id);
            this._api.notifyListeners();
        } catch (error) {
            console.error("Failed to delete user", error);
            throw error;
        }
    }
}

// --- Main Service Class ---

export class FakeDashAPI {
    private _posts: Post[] = [];
    private _users: User[] = [];
    private _listeners: (() => void)[] = [];
    public isInitialized: boolean = false;

    /**
     * Fetches all data from the API and populates memory.
     * Call this at app startup.
     */
    async initialize(): Promise<void> {
        try {
            const [postsRes, usersRes] = await Promise.all([
                axios.get(`${BASE_URL}/posts`),
                axios.get(`${BASE_URL}/users`)
            ]);

            // Map raw JSON to Domain Classes
            // We pass 'this' (the API instance) to the classes so they can access relations
            this._users = usersRes.data.map((u: RawUser) => new User(u, this));
            this._posts = postsRes.data.map((p: RawPost) => new Post(p, this));

            this.isInitialized = true;
            this.notifyListeners();
        } catch (error) {
            console.error("Failed to initialize API", error);
            throw error;
        }
    }

    /** Get the list of all Post objects */
    getPosts(): Post[] {
        return this._posts;
    }

    /** Get the list of all User objects */
    getUsers(): User[] {
        return this._users;
    }

    /** Get a single post by ID from memory */
    getPost(id: string | number): Post | undefined {
        return this._posts.find(p => String(p.id) === String(id));
    }

    /** Get a single user by ID from memory */
    getUser(id: string | number): User | undefined {
        return this._users.find(u => String(u.id) === String(id));
    }

    /** * Internal: Removes a post from memory array and notifies UI.
     * Called by Post.delete()
     */
    removePostFromMemory(id: string) {
        this._posts = this._posts.filter(p => p.id !== id);
        this.notifyListeners();
    }

    /** * Internal: Removes a user from memory array and notifies UI.
     * Called by User.delete()
     */
    removeUserFromMemory(id: string) {
        this._users = this._users.filter(u => u.id !== id);
        this.notifyListeners();
    }

    // --- Reactivity System ---

    /** Register a listener (React component) to be notified of changes */
    subscribe(listener: () => void): () => void {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter(l => l !== listener);
        };
    }

    /** Notify all listeners that data has changed */
    notifyListeners() {
        this._listeners.forEach(listener => listener());
    }
}