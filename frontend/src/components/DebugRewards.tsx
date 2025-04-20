import React, { useState } from 'react';
import { useCookiesToken } from '../hooks/useCookiesToken';

export const DebugRewards: React.FC = () => {
  const { pendingCookiesRewards, debugCheckPendingRewards } = useCookiesToken();
  const [debugResult, setDebugResult] = useState<{
    contractValue: string;
    frontendValue: string;
    match: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const result = await debugCheckPendingRewards();
      setDebugResult(result);
    } catch (err) {
      console.error('Error checking rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-londrina font-bold text-white mb-2">Debug Rewards</h3>
      <div className="mb-4">
        <p className="text-gray-300">Current frontend pendingCookiesRewards: <span className="text-white font-bold">{pendingCookiesRewards}</span></p>
      </div>
      <button
        onClick={handleCheck}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-londrina"
      >
        {loading ? 'Checking...' : 'Check Contract Values'}
      </button>
      
      {debugResult && (
        <div className="mt-4 p-3 bg-gray-700 rounded">
          <p className="text-gray-300">Contract value: <span className="text-white font-bold">{debugResult.contractValue}</span></p>
          <p className="text-gray-300">Frontend value: <span className="text-white font-bold">{debugResult.frontendValue}</span></p>
          <p className={`font-bold ${debugResult.match ? 'text-green-400' : 'text-red-400'}`}>
            {debugResult.match ? 'Values match correctly' : 'MISMATCH: Values do not match'}
          </p>
        </div>
      )}
    </div>
  );
}; 