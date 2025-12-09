'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingDown, CheckCircle } from 'lucide-react';
import { socketService } from '@/lib/services/socket';
import { useNotifications } from '@/lib/hooks/useNotifications';

export interface InventoryAlert {
  id: string;
  partId: string;
  partName: string;
  currentStock: number;
  minStockLevel: number;
  alertType: 'low_stock' | 'out_of_stock' | 'reorder_needed';
  severity: 'warning' | 'critical' | 'info';
  timestamp: Date;
  acknowledged: boolean;
}

export function useInventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Connect to socket service
    socketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    // Handle low stock alerts
    const handlePartStockLow = (part: any) => {
      const alert: InventoryAlert = {
        id: `alert_${part._id}_${Date.now()}`,
        partId: part._id,
        partName: part.name,
        currentStock: part.stockQuantity || 0,
        minStockLevel: part.minStockLevel || 5,
        alertType: part.stockQuantity <= 0 ? 'out_of_stock' : 'low_stock',
        severity: part.stockQuantity <= 0 ? 'critical' : 'warning',
        timestamp: new Date(),
        acknowledged: false,
      };

      setAlerts(prev => {
        // Remove any existing alerts for this part
        const filtered = prev.filter(a => a.partId !== part._id);
        return [alert, ...filtered];
      });

      // Add notification
      addNotification({
        type: alert.severity === 'critical' ? 'error' : 'warning',
        title: alert.severity === 'critical' ? 'Out of Stock!' : 'Low Stock Alert',
        message: `${part.name} is ${alert.severity === 'critical' ? 'out of stock' : `running low (${part.stockQuantity} remaining)`}`,
        data: { 
          part, 
          alert, 
          action: 'view', 
          url: `/inventory/${part._id}` 
        },
      });
    };

    // Handle stock updates
    const handlePartStockUpdated = (part: any) => {
      // Remove alerts for this part if stock is now above minimum
      if (part.stockQuantity > part.minStockLevel) {
        setAlerts(prev => prev.filter(alert => alert.partId !== part._id));
        
        addNotification({
          type: 'success',
          title: 'Stock Restocked',
          message: `${part.name} stock updated to ${part.stockQuantity}`,
          data: { 
            part, 
            action: 'view', 
            url: `/inventory/${part._id}` 
          },
        });
      }
    };

    // Set initial connection status
    setIsConnected(socketService.isConnected());

    // Register event listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.onPartStockLow(handlePartStockLow);
    socketService.onPartStockUpdated(handlePartStockUpdated);

    return () => {
      // Cleanup event listeners
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('part_stock_low', handlePartStockLow);
      socketService.off('part_stock_updated', handlePartStockUpdated);
      socketService.disconnect();
    };
  }, [addNotification]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const acknowledgeAllAlerts = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, acknowledged: true }))
    );
  };

  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const getCriticalAlerts = () => alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged);
  const getWarningAlerts = () => alerts.filter(alert => alert.severity === 'warning' && !alert.acknowledged);
  const getUnacknowledgedCount = () => alerts.filter(alert => !alert.acknowledged).length;

  return {
    alerts,
    isConnected,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    removeAlert,
    clearAllAlerts,
    getCriticalAlerts,
    getWarningAlerts,
    getUnacknowledgedCount,
  };
}

export function InventoryAlertBadge() {
  const { getUnacknowledgedCount, getCriticalAlerts, getWarningAlerts } = useInventoryAlerts();
  const unacknowledgedCount = getUnacknowledgedCount();
  const criticalCount = getCriticalAlerts().length;
  const warningCount = getWarningAlerts().length;

  if (unacknowledgedCount === 0) return null;

  return (
    <div className="relative">
      <div className="flex items-center space-x-1">
        {criticalCount > 0 && (
          <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            <AlertTriangle className="h-3 w-3" />
            <span>{criticalCount} Critical</span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            <TrendingDown className="h-3 w-3" />
            <span>{warningCount} Low Stock</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function InventoryAlertsPanel() {
  const { 
    alerts, 
    isConnected, 
    acknowledgeAlert, 
    acknowledgeAllAlerts, 
    removeAlert, 
    clearAllAlerts,
    getUnacknowledgedCount 
  } = useInventoryAlerts();

  const unacknowledgedCount = getUnacknowledgedCount();

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <TrendingDown className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center text-gray-500">
          <CheckCircle className="h-8 w-8 me-2 text-green-500" />
          <span>No inventory alerts</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
            {unacknowledgedCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {unacknowledgedCount} unacknowledged
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {unacknowledgedCount > 0 && (
              <button
                onClick={acknowledgeAllAlerts}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Acknowledge All
              </button>
            )}
            <button
              onClick={clearAllAlerts}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
        </div>
        {!isConnected && (
          <div className="mt-2 text-sm text-yellow-600">
            ⚠️ Real-time updates are temporarily unavailable
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 ${getAlertBgColor(alert.severity)} ${
              !alert.acknowledged ? 'border-l-4' : 'opacity-60'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.partName}
                  </p>
                  <div className="flex items-center space-x-2">
                    {!alert.acknowledged && (
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Current stock: {alert.currentStock} | Minimum: {alert.minStockLevel}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {alert.timestamp.toLocaleString()}
                </p>
                <div className="mt-2 flex space-x-2">
                  <a
                    href={`/inventory/${alert.partId}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Part →
                  </a>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
