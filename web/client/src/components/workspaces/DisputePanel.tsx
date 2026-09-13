import React from 'react';
import { ShieldAlert, Clock, Info } from 'lucide-react';

interface DisputePanelProps {
  gigId: number;
  disputeStatus: 'open' | 'contested' | 'accepted' | 'resolved' | null;
  disputeReason: string | null;
  evidenceHash?: string | null;
  clientBond: number;
  freelancerBond: number;
  disputedAt: number; // unix timestamp
  isClient: boolean;
  isFreelancer: boolean;
  onContest?: () => void;
  onAcceptSlash?: () => void;
}

export const DisputePanel: React.FC<DisputePanelProps> = ({
  gigId,
  disputeStatus,
  disputeReason,
  evidenceHash,
  clientBond,
  freelancerBond,
  disputedAt,
  isClient,
  isFreelancer,
  onContest,
  onAcceptSlash,
}) => {
  if (!disputeStatus) return null;

  const getStatusColor = () => {
    switch (disputeStatus) {
      case 'open': return '#f59e0b'; // amber
      case 'contested': return '#ef4444'; // red
      case 'accepted': return '#ef4444'; // red (slash upheld)
      case 'resolved': return '#10b981'; // green
      default: return '#888';
    }
  };

  const statusColor = getStatusColor();

  const getBadgeBg = () => {
    switch (disputeStatus) {
      case 'open': return 'rgba(245, 158, 11, 0.12)';
      case 'contested':
      case 'accepted': return 'rgba(239, 68, 68, 0.12)';
      case 'resolved': return 'rgba(16, 185, 129, 0.12)';
      default: return 'rgba(255, 255, 255, 0.08)';
    }
  };

  const getBadgeBorder = () => {
    switch (disputeStatus) {
      case 'open': return '1px solid rgba(245, 158, 11, 0.3)';
      case 'contested':
      case 'accepted': return '1px solid rgba(239, 68, 68, 0.3)';
      case 'resolved': return '1px solid rgba(16, 185, 129, 0.3)';
      default: return '1px solid rgba(255, 255, 255, 0.15)';
    }
  };

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
          background: getBadgeBg(),
          color: statusColor,
          border: getBadgeBorder()
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
          {disputeStatus === 'open' ? '72h for freelancer to contest or accept slash' :
           disputeStatus === 'contested' ? 'Awaiting VRF arbiter resolution' :
           disputeStatus === 'accepted' ? 'Slash accepted · Ready for settlement refund' :
           'Dispute closed'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: isFreelancer && disputeStatus === 'open' ? '1.25rem' : '0' }}>
        <span className="mono" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>EVIDENCE HASH</span>
        <span className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8', wordBreak: 'break-all' }}>
          {evidenceHash || 'No evidence hash committed'}
        </span>
      </div>

      {isFreelancer && disputeStatus === 'open' && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onContest}
            style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            className="mono"
          >
            CONTEST (STAKE BOND)
          </button>
          <button
            onClick={onAcceptSlash}
            style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            className="mono"
          >
            ACCEPT SLASH
          </button>
        </div>
      )}
    </div>
  );
};
