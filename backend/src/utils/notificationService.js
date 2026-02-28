// Real-time Notification Service using Server-Sent Events (SSE)

class NotificationService {
    constructor() {
        // Store client connections: { userId: Set(response_object) }
        this.clients = new Map();
    }

    // Add a new client connection
    addClient(userId, res) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(res);

        // Keep connection alive
        const keepAlive = setInterval(() => {
            res.write(':\n\n'); // SSE comment to keep socket open
        }, 30000);

        // Cleanup on disconnect
        res.on('close', () => {
            clearInterval(keepAlive);
            this.removeClient(userId, res);
        });
    }

    // Remove a closed connection
    removeClient(userId, res) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            userClients.delete(res);
            if (userClients.size === 0) {
                this.clients.delete(userId);
            }
        }
    }

    // Send event to a specific user (e.g., when their request is approved)
    sendToUser(userId, event, payload) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            const dataString = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
            userClients.forEach(res => res.write(dataString));
        }
    }

    // Send event to ALL users with specific roles (e.g., alert all admins of new request)
    // Needs access to user roles, typically we'd look this up but we'll broadcast 
    // to a special "admin" channel or track roles in the clients map.
    // simpler approach: broadcast to everyone, let frontend ignore if not admin
    broadcast(event, payload) {
        const dataString = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
        this.clients.forEach(userClients => {
            userClients.forEach(res => res.write(dataString));
        });
    }
}

// Singleton instance
const notificationService = new NotificationService();
export default notificationService;
