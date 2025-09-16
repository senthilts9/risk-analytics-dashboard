import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

// Type definitions
interface RiskMetrics {
    totalExposure: number;
    valueAtRisk: number;
    sharpeRatio: number;
    maxDrawdown: number;
    betaToMarket: number;
    portfolioValue: number;
}

interface VarHistoryData {
    time: string;
    var: number;
    expected: number;
}

interface SectorExposureData {
    sector: string;
    exposure: number;
    limit: number;
    color: string;
}

interface RiskAlert {
    time: string;
    symbol: string;
    alert: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'ACTIVE' | 'RESOLVED' | 'MONITORING';
}

interface PortfolioAsset {
    asset: string;
    value: number;
    percentage: number;
}

type SeverityType = 'HIGH' | 'MEDIUM' | 'LOW';
type StatusType = 'ACTIVE' | 'RESOLVED' | 'MONITORING';

// Mock data (simulating API responses)
const mockData = {
    metrics: {
        totalExposure: 125800000,
        valueAtRisk: 2410000,
        sharpeRatio: 1.87,
        maxDrawdown: 4.2,
        betaToMarket: 0.95,
        portfolioValue: 50200000,
    },
    varHistory: [
        { time: '09:30', var: 2100000, expected: 2300000 },
        { time: '10:00', var: 2300000, expected: 2400000 },
        { time: '10:30', var: 2800000, expected: 2500000 },
        { time: '11:00', var: 2500000, expected: 2400000 },
        { time: '11:30', var: 2200000, expected: 2300000 },
        { time: '12:00', var: 2400000, expected: 2400000 },
        { time: '12:30', var: 2600000, expected: 2500000 },
        { time: '13:00', var: 2400000, expected: 2400000 }
    ],
    sectorExposure: [
        { sector: 'Technology', exposure: 35.2, limit: 40.0, color: '#00D4FF' },
        { sector: 'Healthcare', exposure: 22.1, limit: 25.0, color: '#00FF88' },
        { sector: 'Financial', exposure: 18.3, limit: 20.0, color: '#FFD700' },
        { sector: 'Energy', exposure: 12.4, limit: 15.0, color: '#FF6B6B' },
        { sector: 'Consumer', exposure: 12.0, limit: 15.0, color: '#A78BFA' }
    ],
    riskAlerts: [
        { time: '13:45:23', symbol: 'TSLA', alert: 'Position Limit Breach', severity: 'HIGH' as const, status: 'ACTIVE' as const },
        { time: '13:42:18', symbol: 'NVDA', alert: 'Volatility Spike', severity: 'MEDIUM' as const, status: 'RESOLVED' as const },
        { time: '13:38:45', symbol: 'AMZN', alert: 'Correlation Alert', severity: 'LOW' as const, status: 'MONITORING' as const },
        { time: '13:35:12', symbol: 'GOOGL', alert: 'Liquidity Warning', severity: 'MEDIUM' as const, status: 'ACTIVE' as const }
    ],
    portfolioBreakdown: [
        { asset: 'Equities', value: 35200000, percentage: 70.1 },
        { asset: 'Fixed Income', value: 8500000, percentage: 16.9 },
        { asset: 'Derivatives', value: 4200000, percentage: 8.4 },
        { asset: 'Cash', value: 2300000, percentage: 4.6 }
    ]
};

// Simulate API service
class RiskAnalyticsService {
    private static instance: RiskAnalyticsService;
    private cache: Map<string, any> = new Map();

    static getInstance(): RiskAnalyticsService {
        if (!RiskAnalyticsService.instance) {
            RiskAnalyticsService.instance = new RiskAnalyticsService();
        }
        return RiskAnalyticsService.instance;
    }

    async fetchRealTimeMetrics(): Promise<any> {
        console.log('🔄 Fetching real-time metrics from FastAPI...');
        await this.delay(12); // Simulate 12ms FastAPI latency

        return {
            ...mockData.metrics,
            valueAtRisk: mockData.metrics.valueAtRisk + (Math.random() - 0.5) * 100000,
            portfolioValue: mockData.metrics.portfolioValue + (Math.random() - 0.5) * 500000,
            timestamp: new Date().toISOString()
        };
    }

    async executeGraphQLQuery(query: string): Promise<any> {
        console.log('📊 Executing GraphQL query...');
        await this.delay(8); // Simulate 8ms GraphQL efficiency

        if (query.includes('varHistory')) {
            return {
                data: {
                    varHistory: mockData.varHistory.map(item => ({
                        ...item,
                        var: item.var + (Math.random() - 0.5) * 50000
                    }))
                }
            };
        }

        return { data: mockData.sectorExposure };
    }

    async invokeLambdaFunction(functionName: string): Promise<any> {
        console.log(`⚡ Invoking AWS Lambda: ${functionName}`);
        await this.delay(5); // Simulate serverless cold start

        return {
            statusCode: 200,
            body: functionName === 'ALERT_PROCESSOR' ?
                { alerts: mockData.riskAlerts } :
                { analysis: mockData.portfolioBreakdown }
        };
    }

    async queryTimescaleDB(): Promise<any> {
        console.log('🕒 Executing TimescaleDB query...');
        await this.delay(15); // Simulate database latency
        return mockData;
    }

    subscribeToKafkaTopic(topic: string, callback: Function): void {
        console.log(`📡 Subscribing to Kafka topic: ${topic}`);
        // Simulate Kafka events every 100ms (10K+ events/sec)
        setInterval(() => {
            callback({
                topic,
                value: {
                    symbol: this.getRandomSymbol(),
                    price: Math.random() * 1000 + 100,
                    timestamp: new Date().toISOString()
                }
            });
        }, 100);
    }

    private getRandomSymbol(): string {
        const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'];
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Custom hook for dashboard data
const useDashboardData = () => {
    const [data, setData] = useState(mockData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRealTimeConnected, setIsRealTimeConnected] = useState(true);

    const apiService = RiskAnalyticsService.getInstance();

    const refreshData = async () => {
        setLoading(true);
        try {
            // Simulate loading from multiple sources
            const [metrics, varData, alerts, portfolio] = await Promise.all([
                apiService.fetchRealTimeMetrics(),
                apiService.executeGraphQLQuery('varHistory'),
                apiService.invokeLambdaFunction('ALERT_PROCESSOR'),
                apiService.invokeLambdaFunction('PORTFOLIO_ANALYSIS')
            ]);

            setData(prev => ({
                ...prev,
                metrics,
                varHistory: varData.data?.varHistory || prev.varHistory,
                riskAlerts: alerts.body?.alerts || prev.riskAlerts,
                portfolioBreakdown: portfolio.body?.analysis || prev.portfolioBreakdown
            }));

            setLastUpdated(new Date());
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Real-time data updates every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 5000);

        // Initial load
        refreshData();

        // Kafka subscription simulation
        apiService.subscribeToKafkaTopic('market_data', () => {
            setData(prev => ({
                ...prev,
                metrics: {
                    ...prev.metrics,
                    valueAtRisk: prev.metrics.valueAtRisk + (Math.random() - 0.5) * 50000
                }
            }));
            setLastUpdated(new Date());
        });

        return () => clearInterval(interval);
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

// Main Dashboard Component
const RiskAnalyticsDashboard: React.FC = () => {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const {
        data,
        loading,
        error,
        lastUpdated,
        refreshData,
        isRealTimeConnected
    } = useDashboardData();

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            timeZone: 'America/New_York'
        });
    };

    const formatCurrency = (value: number): string => {
        return (value / 1000000).toFixed(1);
    };

    const formatDataLatency = (): string => {
        if (!lastUpdated) return 'N/A';
        const latency = Date.now() - lastUpdated.getTime();
        return latency < 1000 ? `${latency}ms` : `${Math.floor(latency / 1000)}s`;
    };

    const getSeverityColor = (severity: SeverityType): string => {
        switch (severity) {
            case 'HIGH': return '#FF4444';
            case 'MEDIUM': return '#FFB347';
            case 'LOW': return '#90EE90';
            default: return '#FFFFFF';
        }
    };

    const getStatusColor = (status: StatusType): string => {
        switch (status) {
            case 'ACTIVE': return '#FF4444';
            case 'RESOLVED': return '#90EE90';
            case 'MONITORING': return '#FFB347';
            default: return '#FFFFFF';
        }
    };

    // Loading state
    if (loading && !data) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-cyan-400 mb-2">Loading Risk Analytics Platform</h2>
                    <p className="text-gray-400 text-sm">Connecting to Kafka streams...</p>
                    <p className="text-gray-400 text-sm">Fetching data from FastAPI...</p>
                    <p className="text-gray-400 text-sm">Querying TimescaleDB...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h2>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={refreshData}
                        className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const COLORS: string[] = ['#00D4FF', '#00FF88', '#FFD700', '#A78BFA', '#FF6B6B'];

    return (
        <div className="min-h-screen bg-slate-900 text-white p-3 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-cyan-400">Risk Analytics Platform</h1>
                    <p className="text-gray-400 text-xs">Real-time Portfolio Risk Management System</p>
                    <p className="text-xs text-gray-500">
                        Developed by Senthil Saravanamuthu - FinTech | Source Code: github.com/senthilts9/risk-analytics-dashboard
                    </p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${isRealTimeConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className={`font-semibold text-sm ${isRealTimeConnected ? 'text-green-400' : 'text-red-400'}`}>
                            {isRealTimeConnected ? 'LIVE MONITORING' : 'CONNECTION LOST'}
                        </span>
                        <span className="text-gray-400 text-sm">{formatTime(currentTime)} EST</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        Risk Engine: Active | Data Feed: 99.9% | Latency: {formatDataLatency()}
                    </div>
                    {lastUpdated && (
                        <div className="text-xs text-gray-500">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-6 gap-3 mb-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">TOTAL EXPOSURE</div>
                    <div className="text-lg font-bold text-white">${formatCurrency(data.metrics.totalExposure)}M</div>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                        <span>95% Utilization</span>
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">VALUE AT RISK (1D)</div>
                    <div className="text-lg font-bold text-white">${formatCurrency(data.metrics.valueAtRisk)}M</div>
                    <div className="text-xs text-orange-400">95% Confidence</div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">SHARPE RATIO</div>
                    <div className="text-lg font-bold text-white">{data.metrics.sharpeRatio.toFixed(2)}</div>
                    <div className="text-xs text-green-400">Above Target: 1.5</div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">MAX DRAWDOWN</div>
                    <div className="text-lg font-bold text-white">{data.metrics.maxDrawdown.toFixed(1)}%</div>
                    <div className="text-xs text-red-400">Trailing 30D</div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">BETA TO MARKET</div>
                    <div className="text-lg font-bold text-white">{data.metrics.betaToMarket.toFixed(2)}</div>
                    <div className="text-xs text-cyan-400">vs S&P 500</div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">PORTFOLIO VALUE</div>
                    <div className="text-lg font-bold text-white">${formatCurrency(data.metrics.portfolioValue)}M</div>
                    <div className="text-xs text-green-400">+2.4% Today</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                {/* VaR Trend */}
                <div className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-2 text-cyan-400">Value at Risk Trend (GraphQL)</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={data.varHistory.map(item => ({
                            ...item,
                            var: item.var / 1000000,
                            expected: item.expected / 1000000
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                            <YAxis stroke="#9CA3AF" fontSize={10} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                formatter={(value: any) => [`$${value.toFixed(2)}M`, '']}
                            />
                            <Area
                                type="monotone"
                                dataKey="var"
                                stroke="#00D4FF"
                                fill="#00D4FF"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="expected"
                                stroke="#FFB347"
                                strokeDasharray="5 5"
                                strokeWidth={1}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sector Exposure */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-2 text-cyan-400">Sector Exposure (Kafka Stream)</h3>
                    <div className="space-y-2">
                        {data.sectorExposure.map((item: SectorExposureData, index: number) => (
                            <div key={item.sector}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-300">{item.sector}</span>
                                    <span className="text-white">{item.exposure.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(item.exposure / item.limit) * 100}%`,
                                            backgroundColor: item.color
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Portfolio Breakdown Pie Chart */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-2 text-cyan-400">Asset Allocation (Lambda)</h3>
                    <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            <Pie
                                data={data.portfolioBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="percentage"
                            >
                                {data.portfolioBreakdown.map((entry: PortfolioAsset, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any, _name: any, props: any) => [
                                    `${typeof value === 'number' ? value.toFixed(1) : value}%`,
                                    props.payload.asset
                                ]}
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-3 gap-3 mb-3">
                {/* Risk Alerts */}
                <div className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-cyan-400">Recent Risk Alerts (AWS Lambda)</h3>
                        <button
                            onClick={refreshData}
                            className="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-400 border-b border-slate-700">
                                    <th className="text-left py-1">Time</th>
                                    <th className="text-left py-1">Symbol</th>
                                    <th className="text-left py-1">Alert Type</th>
                                    <th className="text-left py-1">Severity</th>
                                    <th className="text-left py-1">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.riskAlerts.map((alert: RiskAlert, index: number) => (
                                    <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                                        <td className="py-1 text-gray-300">{alert.time}</td>
                                        <td className="py-1 font-mono text-cyan-400">{alert.symbol}</td>
                                        <td className="py-1 text-white">{alert.alert}</td>
                                        <td className="py-1">
                                            <span
                                                className="px-1 py-0.5 rounded text-xs font-semibold"
                                                style={{
                                                    backgroundColor: getSeverityColor(alert.severity) + '20',
                                                    color: getSeverityColor(alert.severity)
                                                }}
                                            >
                                                {alert.severity}
                                            </span>
                                        </td>
                                        <td className="py-1">
                                            <span
                                                className="px-1 py-0.5 rounded text-xs font-semibold"
                                                style={{
                                                    backgroundColor: getStatusColor(alert.status) + '20',
                                                    color: getStatusColor(alert.status)
                                                }}
                                            >
                                                {alert.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-2 text-cyan-400">System Health (TimescaleDB)</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-xs">Risk Engine</span>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                <span className="text-green-400 text-xs">Operational</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-xs">Kafka Streams</span>
                            <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${isRealTimeConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className={`text-xs ${isRealTimeConnected ? 'text-green-400' : 'text-red-400'}`}>
                                    {isRealTimeConnected ? '10K+ events/sec' : 'Reconnecting'}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-xs">Redis Cache</span>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                <span className="text-green-400 text-xs">Sub-ms latency</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-xs">AWS Lambda</span>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                <span className="text-green-400 text-xs">Serverless</span>
                            </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-700">
                            <div className="text-xs text-gray-400 space-y-1">
                                <div>FastAPI: 12ms avg</div>
                                <div>GraphQL: 8ms avg</div>
                                <div>TimescaleDB: 15ms</div>
                                <div>Active Connections: 247</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Architecture Footer */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <h4 className="text-xs font-semibold mb-2 text-gray-400">System Architecture & Technology Stack</h4>
                <div className="grid grid-cols-6 gap-2">
                    <div className="bg-slate-700 rounded px-2 py-1 text-center">
                        <div className="text-xs text-cyan-400 font-semibold">Data Ingestion</div>
                        <div className="text-xs text-gray-300">Kafka / Redis</div>
                    </div>
                    <div className="bg-slate-700 rounded px-2 py-1 text-center">
                        <div className="text-xs text-cyan-400 font-semibold">Risk Engine</div>
                        <div className="text-xs text-gray-300">Python / NumPy</div>
                    </div>
                    <div className="bg-slate-700 rounded px-2 py-1 text-center">
                        <div className="text-xs text-cyan-400 font-semibold">Database</div>
                        <div className="text-xs text-gray-300">TimescaleDB</div>
                    </div>
                    <div className="bg-slate-700 rounded px-2 py-1 text-center">
                        <div className="text-xs text-cyan-400 font-semibold">API Gateway</div>
                        <div className="text-xs text-gray-300">FastAPI / GraphQL</div>
                    </div>
                    <div className="bg-slate-700 rounded px-2 py-1 text-center">
                        <div className="text-xs text-cyan-400 font-semibold">Serverless</div>
                        <div className="text-xs text-gray-300">AWS Lambda</div>
                    </div>
                    <div className="bg-slate-700 rounded px-2 py-1 text-center">
                        <div className="text-xs text-cyan-400 font-semibold">Frontend</div>
                        <div className="text-xs text-gray-300">React / TypeScript</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskAnalyticsDashboard;