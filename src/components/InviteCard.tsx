import { forwardRef } from 'react'

const InviteCard = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '400px',
        height: '400px',
        background: 'linear-gradient(145deg, #0d0b08 0%, #1a0c04 60%, #0d0b08 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, "Microsoft JhengHei", "Noto Sans TC", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* 危險條紋頂部 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
        background: 'repeating-linear-gradient(-45deg, #c8861a, #c8861a 10px, #0d0b08 10px, #0d0b08 20px)',
      }} />

      {/* 危險條紋底部 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px',
        background: 'repeating-linear-gradient(-45deg, #c8861a, #c8861a 10px, #0d0b08 10px, #0d0b08 20px)',
      }} />

      {/* 背景格線 */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 24px, #c8861a 24px, #c8861a 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, #c8861a 24px, #c8861a 25px)',
      }} />

      {/* 警告三角 */}
      <div style={{ fontSize: '56px', marginBottom: '8px', lineHeight: 1 }}>⚠️</div>

      {/* 標題 */}
      <p style={{
        color: '#c8861a', fontSize: '11px', fontWeight: 700,
        letterSpacing: '5px', marginBottom: '8px',
      }}>
        // 緊急測驗通知
      </p>

      <h1 style={{
        color: '#e8e0d0', fontSize: '36px', fontWeight: 900,
        letterSpacing: '4px', marginBottom: '4px', textAlign: 'center',
        textShadow: '0 0 20px rgba(200,134,26,0.4)',
      }}>
        零時生存
      </h1>
      <p style={{
        color: '#c8861a', fontSize: '13px', fontWeight: 700,
        letterSpacing: '8px', marginBottom: '20px',
      }}>
        ZERO HOUR
      </p>

      {/* 挑戰文字 */}
      <div style={{
        background: 'rgba(200,134,26,0.08)',
        border: '1px solid rgba(200,134,26,0.3)',
        borderRadius: '8px',
        padding: '12px 20px',
        marginBottom: '20px',
        textAlign: 'center',
        maxWidth: '320px',
      }}>
        <p style={{ color: '#b0a090', fontSize: '13px', lineHeight: 1.7 }}>
          地震、海嘯、戰爭、疫情⋯⋯<br />
          <span style={{ color: '#e8e0d0', fontWeight: 700 }}>你準備好了嗎？</span><br />
          台灣災難應變能力情境測試
        </p>
      </div>

      {/* 統計 */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {[['7', '大情境'], ['9', '人物側寫'], ['S～F', '評級']].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ color: '#c8861a', fontSize: '18px', fontWeight: 900 }}>{val}</p>
            <p style={{ color: '#5a4a35', fontSize: '10px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* 網址 */}
      <div style={{
        background: '#1a1208',
        border: '1px solid #3d2a10',
        borderRadius: '6px',
        padding: '6px 16px',
      }}>
        <p style={{ color: '#c8861a', fontSize: '12px', fontWeight: 700, letterSpacing: '2px' }}>
          zerohour.app
        </p>
      </div>
    </div>
  )
})

InviteCard.displayName = 'InviteCard'
export default InviteCard
