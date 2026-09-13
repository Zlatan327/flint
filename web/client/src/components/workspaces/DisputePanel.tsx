import React from 'react';
import { ShieldAlert, Clock, Info } from 'lucide-react';

interface DisputePanelProps {
  gigId: number;
  disputeStatus: 'open' | 'contested' | 'accepted' | 'resolved' | null;
  disputeReason: string | null;
  clientBond: number;
  freelancerBond: number;
  disputedAt: number; // unix timestamp
  isClient: boolean;
  isFreelancer: boolean;
}

export const DisputePanel: React.FC<DisputePanelProps> = ({
  gigId,
  disputeStatus,
  disputeReason,
  clientBond,
  freelancerBond,
  disputedAt,
  isClient,
  isFreelancer,
}) => {
  if (!disputeStatus) return null;

  const getStatusColor = () => {
    switch (disputeStatus) {
      case 'open': return '#f59e0b'; // amber
      case 'contested': return '#ef4444'; // red
      case 'resolved': return '#10b981'; // green
      default: return '#888';
    }
  };

  const statusColor = getStatusColor();

  return (
    <div style={{
      background: '#151515',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} color={statusColor} />
          <span className="mono" style={{ fontSize: '0.75rem', color: statusColor, fontWeight: 700, letterSpacing: '0.05em' }}>
            DSP / 001 · DISPUTE STATUS
          </span>
        </div>
        <span className="mono" style={{
          fontSize: '0.68rem',
          padding: '2px 8px',
          borderRadius: '4px',
          background: `rgba(${disputeStatus === 'open' ? '245, 158, 11' : disputeStatus === 'contested' ? '239, 68, 68' : '16, 185, 129'}, 0.1)`,
          color: statusColor,
          border: `1px solid rgba(${disputeStatus === 'open' ? '245, 158, 11' : disputeStatus === 'contested' ? '239, 68, 68' : '16, 185, 129'}, 0.25)`
        }}>
          {disputeStatus.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>REASON</span>
          <span style={{ color: '#fff', fontSize: '0.9rem' }}>{disputeReason || 'N/A'}</span>
        </div>
        <div>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>CLIENT BOND</span>
          <span className="mono" style={{ color: '#fff', fontSize: '0.9rem' }}>{clientBond.toFixed(2)} SOL</span>
        </div>
        <div>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>WORKER BOND</span>
          <span className="mono" style={{ color: '#fff', fontSize: '0.9rem' }}>{freelancerBond.toFixed(2)} SOL</span>
        </div>
      </div>

      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
        <Clock size={16} color="rgba(255,255,255,0.5)" />
        <span className="mono" style={{ fontSize: '0.8rem', color: '#fff' }}>
          {disputeStatus === 'open' ? '72h for freelancer to contest' : disputeStatus === 'contested' ? 'Awaiting arbiter votes' : 'Dispute closed'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: isFreelancer && disputeStatus === 'open' ? '1.25rem' : '0' }}>
        <span className="mono" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>EVIDENCE HASH</span>
        <span className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8', wordBreak: 'break-all' }}>
          0x9a8f...3c21
        </span>
      </div>

      {isFreelancer && disputeStatus === 'open' && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }} className="mono">
            CONTEST (STAKE BOND)
          </button>
          <button style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }} className="mono">
            ACCEPT SLASH
          </button>
        </div>
      )}
    </div>
  );
};
