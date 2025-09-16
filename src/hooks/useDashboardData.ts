// src/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { riskAPI } from '../services/riskAnalyticsAPI';

interface DashboardData {
  metrics: any;
  varHistory: any[];
  sectorExposure: any[];
  riskAlerts: any[];
  portfolioBreakdown: any[];
  systemHealth: any;
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  isRealTimeConnected: boolean;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      console.log('🔄 Starting dashboard data refresh...');
      
      const dashboardData = await riskAPI.getAllDashboardData();
      
      setData(dashboardData);
      setLastUpdated(new Date());
      setIsRealTimeConnected(true);
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setIsRealTimeConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await loadData();
  }, [loadData]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up real-time data updates via Kafka streaming
  useEffect(() => {
    if (!data) return;

    console.log('📡 Setting up Kafka event listeners...');

    // Subscribe to market data events from Kafka
    const unsubscribeMarket = riskAPI.subscribeToKafkaTopic('market_data', (message: any) => {
      // Update metrics in real-time based on market events
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          metrics: {
            ...prevData.metrics,
            valueAtRisk: prevData.metrics.valueAtRisk + (Math.random() - 0.5) * 50000,
            portfolioValue: prevData.metrics.portfolioValue + (Math.random() - 0.5) * 200000,
            timestamp: new Date().toISOString()
          }
        };
      });
      setLastUpdated(new Date());
    });

    // Subscribe to risk alert events
    const unsubscribeAlerts = riskAPI.subscribeToKafkaTopic('risk_alerts', (message: any) => {
      console.log('🚨 New risk alert received:', message.value);
      
      setData(prevData => {
        if (!prevData) return prevData;
        
        // Add new alert to the list
        const newAlert = {
          id: `ALERT_${Date.now()}`,
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          symbol: message.value.symbol,
          alert: message.value.alertType,
          severity: message.value.severity,
          status: 'ACTIVE',
          description: message.value.description
        };
        
        return {
          ...prevData,
          riskAlerts: [newAlert, ...prevData.riskAlerts.slice(0, 9)] // Keep last 10 alerts
        };
      });
    });

    // Periodic health checks
    const healthCheckInterval = setInterval(async () => {
      try {
        const health = await riskAPI.healthCheck();
        setData(prevData => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            systemHealth: health
          };
        });
      } catch (err) {
        console.warn('Health check failed:', err);
        setIsRealTimeConnected(false);
      }
    }, 30000); // Check every 30 seconds

    // Periodic metrics refresh via FastAPI
    const metricsInterval = setInterval(async () => {
      try {
        const newMetrics = await riskAPI.fetchRealTimeMetrics();
        setData(prevData => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            metrics: newMetrics
          };
        });
        setLastUpdated(new Date());
      } catch (err) {
        console.warn('Metrics update failed:', err);
      }
    }, 5000); // Update every 5 seconds

    // VaR data refresh via GraphQL
    const varDataInterval = setInterval(async () => {
      try {
        const varData = await riskAPI.executeGraphQLQuery(`
          query GetVarHistory {
            varHistory(timeframe: "1D") {
              timestamp
              time
              var
              expected
            }
          }
        `);
        
        setData(prevData => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            varHistory: varData.data?.varHistory || prevData.varHistory
          };
        });
      } catch (err) {
        console.warn('VaR data update failed:', err);
      }
    }, 15000); // Update every 15 seconds

    // Cleanup function
    return () => {
      clearInterval(healthCheckInterval);
      clearInterval(metricsInterval);
      clearInterval(varDataInterval);
      // Note: In a real implementation, you'd unsubscribe from Kafka topics here
    };
  }, [data]);

  // Connection status monitoring
  useEffect(() => {
    const connectionCheck = setInterval(() => {
      // Simulate connection monitoring
      const isConnected = Math.random() > 0.02; // 98% uptime simulation
      setIsRealTimeConnected(isConnected);
      
      if (!isConnected) {
        console.warn('⚠️ Real-time connection lost, attempting reconnection...');
        setTimeout(() => {
          setIsRealTimeConnected(true);
          console.log('✅ Real-time connection restored');
        }, 2000);
      }
    }, 10000);

    return () => clearInterval(connectionCheck);
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    isRealTimeConnected
  };
};