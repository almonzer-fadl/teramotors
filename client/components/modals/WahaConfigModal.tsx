import Image from 'next/image';
import { useState, useEffect } from 'react';
import { X, RefreshCw, Power, PowerOff, CheckCircle, XCircle, Loader } from 'lucide-react';

interface WahaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SessionInfo {
  name: string;
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED';
}

export function WahaConfigModal({ isOpen, onClose }: WahaConfigModalProps) {
  const [sessionStatus, setSessionStatus] = useState<SessionInfo | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSessionStatus = async () => {
    try {
      const response = await fetch('/api/waha/session');
      if (response.ok) {
        const data = await response.json();
        setSessionStatus(data);

        // If status is SCAN_QR_CODE, fetch QR code
        if (data.status === 'SCAN_QR_CODE') {
          fetchQRCode();
        } else {
          setQrCode(null);
        }
      }
    } catch (err) {
      console.error('Error fetching session status:', err);
    }
  };

  const fetchQRCode = async () => {
    try {
      const response = await fetch('/api/waha/qr');
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qr);
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
    }
  };

  const startSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/waha/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });

      if (response.ok) {
        await fetchSessionStatus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to start session');
      }
    } catch (err) {
      setError('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const stopSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/waha/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });

      if (response.ok) {
        await fetchSessionStatus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to stop session');
      }
    } catch (err) {
      setError('Failed to stop session');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      WORKING: { text: 'متصل', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      SCAN_QR_CODE: { text: 'امسح رمز QR', color: 'bg-yellow-100 text-yellow-800', icon: Loader },
      STARTING: { text: 'جاري البدء...', color: 'bg-blue-100 text-blue-800', icon: Loader },
      STOPPED: { text: 'متوقف', color: 'bg-gray-100 text-gray-800', icon: PowerOff },
      FAILED: { text: 'فشل', color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.STOPPED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessionStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoRefresh) {
      const interval = setInterval(fetchSessionStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, autoRefresh]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">
            إعدادات واتساب (Waha)
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Session Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">حالة الاتصال</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">الحالة</span>
              {sessionStatus ? (
                getStatusBadge(sessionStatus.status)
              ) : (
                <span className="text-gray-500">جاري التحميل...</span>
              )}
            </div>
          </div>

          {/* QR Code */}
          {sessionStatus?.status === 'SCAN_QR_CODE' && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">امسح رمز QR</h3>
              <div className="p-6 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
                {qrCode ? (
                  <div className="space-y-4">
                    <Image
                      src={qrCode}
                      alt="QR Code"
                      width={256}
                      height={256}
                      className="w-64 h-64 border-4 border-white shadow-lg rounded-lg"
                    />
                    <p className="text-sm text-center text-gray-600">
                      افتح واتساب على هاتفك وامسح هذا الرمز
                    </p>
                    <button
                      onClick={fetchQRCode}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      تحديث الرمز
                    </button>
                  </div>
                ) : (
                  <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
          )}

          {/* Working Status Info */}
          {sessionStatus?.status === 'WORKING' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">متصل بواتساب!</p>
                  <p className="text-sm text-green-700 mt-1">
                    يمكنك الآن إرسال الرسائل تلقائياً
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3 pt-4 border-t">
            {sessionStatus?.status === 'STOPPED' || sessionStatus?.status === 'FAILED' ? (
              <button
                onClick={startSession}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Power className="w-5 h-5" />
                )}
                بدء الجلسة
              </button>
            ) : (
              <button
                onClick={stopSession}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <PowerOff className="w-5 h-5" />
                )}
                إيقاف الجلسة
              </button>
            )}

            <button
              onClick={fetchSessionStatus}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </button>

            <label className="flex items-center gap-2 ms-auto">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">تحديث تلقائي</span>
            </label>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>ملاحظة:</strong> تأكد من تشغيل خادم Waha على {process.env.NEXT_PUBLIC_WAHA_URL || 'http://localhost:3000'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

