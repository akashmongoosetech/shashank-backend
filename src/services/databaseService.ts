import mongoose from 'mongoose';

class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('📊 Database already connected');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-derma-clinic';
      
      await mongoose.connect(mongoUri, {
        // Remove deprecated options for newer MongoDB versions
      });

      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📊 MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('📊 MongoDB disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public async healthCheck(): Promise<{ status: string; connected: boolean; collections?: string[] }> {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', connected: false };
      }

      const collections = await mongoose.connection.db?.listCollections().toArray();
      const collectionNames = collections?.map(col => col.name) || [];

      return {
        status: 'connected',
        connected: true,
        collections: collectionNames
      };
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return { status: 'error', connected: false };
    }
  }
}

export const databaseService = DatabaseService.getInstance();
