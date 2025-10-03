const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        type: 'mongodb',
        status: 'disconnected',
        host: process.env.MONGODB_URI ? 'configured' : 'not configured'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    };
    
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      health.database.status = 'connected';
      
      // Test database with a simple query
      try {
        await mongoose.connection.db.admin().ping();
        health.database.ping = 'success';
      } catch (pingError) {
        health.database.ping = 'failed';
        health.database.error = pingError.message;
      }
    } else {
      health.database.status = 'disconnected';
      health.status = 'unhealthy';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// GET /api/health/db - Detailed database health
router.get('/health/db', async (req, res) => {
  try {
    const dbHealth = {
      type: 'mongodb',
      status: 'disconnected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
    
    // Map ready states
    const readyStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    dbHealth.status = readyStates[mongoose.connection.readyState] || 'unknown';
    
    if (mongoose.connection.readyState === 1) {
      // Get database stats
      try {
        const stats = await mongoose.connection.db.stats();
        dbHealth.stats = {
          collections: stats.collections,
          dataSize: Math.round(stats.dataSize / 1024 / 1024), // MB
          indexSize: Math.round(stats.indexSize / 1024 / 1024), // MB
          storageSize: Math.round(stats.storageSize / 1024 / 1024) // MB
        };
      } catch (statsError) {
        dbHealth.statsError = statsError.message;
      }
    }
    
    const statusCode = dbHealth.status === 'connected' ? 200 : 503;
    res.status(statusCode).json(dbHealth);
    
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(503).json({
      type: 'mongodb',
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;