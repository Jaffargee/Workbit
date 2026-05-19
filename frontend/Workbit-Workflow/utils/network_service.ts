

export class NetworkService {
      // Check if user is online
      static isOnline(): boolean {
            return navigator.onLine;
      }

      // Wait for network connection
      static async waitForConnection(timeout: number = 5000): Promise<boolean> {
            if (this.isOnline()) return true;

            return new Promise((resolve) => {
                  
                  const timeoutId = setTimeout(() => {
                        window.removeEventListener('online', onlineHandler);
                        resolve(false);
                  }, timeout);

                  const onlineHandler = () => {
                        clearTimeout(timeoutId);
                        window.removeEventListener('online', onlineHandler);
                        resolve(true);
                  };

                  window.addEventListener('online', onlineHandler);
            });
      }

      // Detect network speed (optional enhancement)
      static async checkNetworkSpeed(): Promise<'fast' | 'slow' | 'offline'> {
            if (!this.isOnline()) return 'offline';

            try {
                  const connection = (navigator as any).connection;

                  if (connection) {
                        const effectiveType = connection.effectiveType;
                        return ['4g', 'wifi'].includes(effectiveType) ? 'fast' : 'slow';
                  }

                  return 'fast';

            } catch {
                  return 'fast';
            }
      }
}
